// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Steering Evolution
// Another version:
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning/tree/master/week2-evolution/01_evolve_steering
let vehicles = [];
let food = [];
let poison = [];
let dead_vehicles = [];
let best_vehicles = [];
let vehicle_id;
let alive_table;
let dead_table;
let best_table;
let new_food_pois;
let once = true;

function setup() {
  const canvas = createCanvas(windowWidth * 0.668, 460); // 965, 460
  canvas.parent('canvas_panel');

  let num_car = select('#num_car').value(15);
  let num_food = select('#num_food').value(30);
  let num_pois = select('#num_pois').value(40);
  let mr = select('#mr').value(0.01);
  new_food_pois = select('#new_food_pois').value(1);

  alive_table = document.getElementById('alive_table');
  dead_table = document.getElementById('dead_table');
  best_table = document.getElementById('best_table');

  perception = select('#check_perception');
  const use_best = select('#use_best');

  vehicle_id = 1;

  vehicles.length = 1;

  stop();

  // init tables
  create_empty_table(best_table, 10);
  create_empty_table(alive_table, 5);

  const apply = select('#apply_variables');
  apply.mousePressed(() => {
    console.log('Apply Clicked');
    // get input values
    num_car = select('#num_car').value();
    num_food = select('#num_food').value();
    num_pois = select('#num_pois').value();
    mr = select('#mr').value();
    new_food_pois = select('#new_food_pois').value();

    set_mr(mr);

    reinit();
    start();

    // reset the stop button
    if (!(STOP.class().indexOf('stop') > -1)) {
      document.getElementById('STOP').innerHTML = 'STOP';
      STOP.removeClass('start');
      STOP.addClass('stop');
    }
    // re-enable save button
    document.getElementById('save').classList.remove('disabled');
  });

  let STOP = select('#STOP');
  STOP.mousePressed(() => {
    if (STOP.class().indexOf('stop') > -1) {
      stop();
      STOP.removeClass('stop');
      STOP.addClass('start');
      document.getElementById('STOP').innerHTML = 'START';
    } else {
      document.getElementById('STOP').innerHTML = 'STOP';
      start();
      STOP.removeClass('start');
      STOP.addClass('stop');
    }
  });

  const save = select('#save');
  save.mousePressed(() => {
    if (dead_vehicles.length > 0 && vehicles.length === 0) {
      if (best_vehicles.length === 0) {
        best_vehicles = dead_vehicles.slice();
      } else {
        best_vehicles = best_vehicles.concat(dead_vehicles);
      }

      best_vehicles.sort((a, b) => {
        return b.time_alive - a.time_alive;
      });

      if (best_vehicles.length > 10) {
        best_vehicles = best_vehicles.slice(0, 10);
      }

      best_vehicles = [...new Set(best_vehicles)];

      write_table(best_table, best_vehicles, 10);
      document.getElementById('save').classList.add('disabled');
    } else {
      // eslint-disable-next-line no-alert
      alert('No dead bots yet or some still alive');
    }
  });

  const clear = select('#clear');
  clear.mousePressed(() => {
    // reset tables
    delete_table(dead_table);
    clear_table(alive_table, 5);
  });

  function init_food_and_poison() {
    for (let i = 0; i < num_food; i++) {
      const x = random(width);
      const y = random(height);
      food.push(createVector(x, y));
    }
    for (let i = 0; i < num_pois; i++) {
      const x = random(width);
      const y = random(height);
      poison.push(createVector(x, y));
    }
  }

  function init_random_bots() {
    document.getElementById('gen_num').innerHTML = 1;
    for (let i = 0; i < num_car; i++) {
      const x = random(width);
      const y = random(height);
      vehicles[i] = new Vehicle(x, y, null, vehicle_id);
      vehicle_id++;
    }
  }

  function init_bots_using_best() {
    // increase generation numbers
    let gen = document.getElementById('gen_num').innerHTML;
    gen++;
    document.getElementById('gen_num').innerHTML = gen;
    select('#gen_num').value(gen);
    // create new bots using best
    // not using clone because id's of clones have .number in them => gets very unorganised after a while
    for (let i = 0; i < num_car; i++) {
      const x = random(width);
      const y = random(height);
      const random_best_dna = best_vehicles[Math.floor(random(best_vehicles.length - 1))].dna;
      vehicles[i] = new Vehicle(x, y, random_best_dna, vehicle_id);
      vehicle_id++;
    }
  }

  async function reinit() {
    vehicles = [];
    food = [];
    poison = [];
    dead_vehicles = [];
    if (use_best.checked()) {
      init_bots_using_best();
    } else {
      init_random_bots();
    }
    set_mr(mr);

    // reset tables
    delete_table(dead_table);
    delete_table(alive_table);
    create_empty_table(alive_table, 5);

    init_food_and_poison();
    draw();
  }
}

async function draw() {
  background(51);

  if (vehicles.length > 0) {
    if (random(1) < new_food_pois / 10) {
      const x = random(width);
      const y = random(height);
      food.push(createVector(x, y));
    }
    if (random(1) < new_food_pois / 50) {
      const x = random(width);
      const y = random(height);
      poison.push(createVector(x, y));
    }
  }
  for (let i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4, 4);
  }
  for (let i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4, 4);
  }
  for (let i = vehicles.length - 1; i >= 0; i--) {
    if (vehicles[i] instanceof Vehicle) {
      vehicles[i].boundaries();
      vehicles[i].behaviors(food, poison);
      vehicles[i].update();
      vehicles[i].display();
      const newVehicle = vehicles[i].clone();
      if (newVehicle != null) {
        vehicles.push(newVehicle);
      }
      if (vehicles[i].dead()) {
        dead_vehicles.push(vehicles[i]);
        const x = vehicles[i].position.x;
        const y = vehicles[i].position.y;
        food.push(createVector(x, y));
        vehicles.splice(i, 1);
      }
    }
  }

  if (vehicles.length === 0) {
    if (once) {
      once = false;
      dead_vehicles.sort((a, b) => {
        return b.time_alive - a.time_alive;
      });
      create_empty_table(dead_table, 5);
      write_table(dead_table, dead_vehicles, 5);
      clear_table(alive_table, 5);
      await wait(500);
      stop();
    }
  }

  if (vehicles.length >= 1) {
    vehicles.sort((a, b) => {
      return b.time_alive - a.time_alive;
    });
    write_table(alive_table, vehicles, 5);
  }

  document.getElementById('curr_num_alive').innerHTML = vehicles.length;
}

function wait(num) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, num);
  });
}

function stop() {
  noLoop();
}

function start() {
  loop();
}

function delete_table(table) {
  for (let i = table.rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

function create_empty_table(table, num_el) {
  for (let i = 1; i < num_el + 1; i++) {
    const row = table.insertRow();

    for (let j = 0; j < 7; j++) {
      const cell = row.insertCell();
      cell.innerHTML = '';
    }
  }
}

function clear_table(table, num_el, start = 0) {
  if (num_el > table.rows.length - 1) {
    // cuzz not counting tableheader
    num_el = table.rows.length - 1;
  }
  for (let i = 0; i < num_el; i++) {
    const row = table.rows[start + i + 1];
    for (let j = 0; j < 7; j++) {
      const cell = row.cells[j];
      cell.innerHTML = '';
    }
  }
}

async function write_table(table, arr, num_el) {
  let excess = 0;
  if (num_el > arr.length) {
    excess = num_el - arr.length;
    num_el = arr.length;
  }
  if (arr.length > 0) {
    for (let i = 0; i < num_el; i++) {
      if (arr[i] instanceof Vehicle) {
        const row = table.rows[i + 1];

        const index = row.cells[0];
        index.innerHTML = arr[i].id;

        const food_weigth = row.cells[1];
        food_weigth.innerHTML = Math.round(arr[i].dna.food_weight * 10000) / 10000;

        const poison_weight = row.cells[2];
        poison_weight.innerHTML = Math.round(arr[i].dna.poison_weight * 10000) / 10000;

        const food_perception = row.cells[3];
        food_perception.innerHTML = Math.round(arr[i].dna.food_perception * 10000) / 10000;

        const poison_perception = row.cells[4];
        poison_perception.innerHTML = Math.round(arr[i].dna.poison_perception * 10000) / 10000;

        const health = row.cells[5];
        health.innerHTML = Math.round(arr[i].health * 100) / 100;

        const time = row.cells[6];
        time.innerHTML = Math.round(arr[i].time_alive * 100) / 100;
      }
    }
    clear_table(alive_table, excess, num_el);
  }
}
