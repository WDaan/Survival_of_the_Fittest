// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Steering Evolution
// Another version:
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning/tree/master/week2-evolution/01_evolve_steering
var vehicles = [];
var food = [];
var poison = [];
var dead_vehicles = [];
var best_vehicles = [];
var vehicle_id;
var alive_table;
var dead_table;
var best_table;

function setup() {
    var canvas = createCanvas(700, 360);
    canvas.parent('canvas_panel');

    var num_car = select('#num_car').value(3);
    var num_food = select('#num_food').value(10);
    var num_pois = select('#num_pois').value(40);
    var mr = select('#mr').value(0.01);
    set_mr(mr);

    alive_table = document.getElementById("alive_table");
    dead_table = document.getElementById("dead_table");
    best_table = document.getElementById("best_table");


    perception = select('#check_perception');
    use_best = select('#use_best');

    vehicle_id = 1;

    var apply = select('#apply_variables');
    apply.mousePressed(() => {
        console.log('Apply Clicked');
        num_car = select('#num_car').value();
        num_food = select('#num_food').value();
        num_pois = select('#num_pois').value();
        reinit();
        clear_table(dead_table);
        loop();
    });



    var STOP = select('#STOP');
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


    var save = select('#save');
    save.mousePressed(() => {
        if (best_vehicles.length == 0) {
            best_vehicles = dead_vehicles.slice();
            console.log(dead_vehicles.length);
            console.log(best_vehicles.length);
        } else {
            best_vehicles = best_vehicles.concat(dead_vehicles);
        }
        if (best_vehicles.length > 10) {
            best_vehicles = best_vehicles.slice(0, 10);
        }

        best_vehicles.sort((a, b) => {
            return (b.time_alive - a.time_alive);
        })

        best_vehicles = [...new Set(best_vehicles)];
        console.log(best_vehicles);

        update_table(best_table, best_vehicles, 0);
    });

    function init_food_and_poison() {
        for (var i = 0; i < num_food; i++) {
            var x = random(width);
            var y = random(height);
            food.push(createVector(x, y));
        }
        for (var i = 0; i < num_pois; i++) {
            var x = random(width);
            var y = random(height);
            poison.push(createVector(x, y));
        }
    }

    function init_random_bots() {
        for (var i = 0; i < num_car; i++) {
            var x = random(width);
            var y = random(height);
            vehicles[i] = new Vehicle(x, y, null, vehicle_id);
            vehicle_id++;
        }
    }

    function init_bots_using_best() {
        var gen = document.getElementById("gen_num").innerHTML;
        gen++;
        document.getElementById("gen_num").innerHTML = gen;
        select('#gen_num').value(gen);
        for (var i = 0; i < num_car; i++) {
            var x = random(width);
            var y = random(height);
            var random_best_dna = best_vehicles[Math.floor(random(best_vehicles.length - 1))].dna;
            vehicles[i] = new Vehicle(x, y, random_best_dna, vehicle_id);
            vehicle_id++;
        }
    }

    function reinit() {
        vehicle_id = 1;
        vehicles = [];
        vehicles.length = 1;
        food = [];
        poison = [];
        dead_vehicles = [];
        if (use_best.checked()) {
            init_bots_using_best();
        } else {
            init_random_bots();
        }
        init_food_and_poison();
        draw();
        alive_table = document.getElementById("alive_table");
        dead_table = document.getElementById("dead_table");
        clear_table(dead_table, 0);
        clear_table(alive_table, 0);
    }

}

function draw() {
    background(51);

    if (vehicles.length > 0) {
        if (random(1) < 0.1) {
            var x = random(width);
            var y = random(height);
            food.push(createVector(x, y));
        }
        if (random(1) < 0.01) {
            var x = random(width);
            var y = random(height);
            poison.push(createVector(x, y));
        }
    }
    for (var i = 0; i < food.length; i++) {
        fill(0, 255, 0);
        noStroke();
        ellipse(food[i].x, food[i].y, 4, 4);
    }
    for (var i = 0; i < poison.length; i++) {
        fill(255, 0, 0);
        noStroke();
        ellipse(poison[i].x, poison[i].y, 4, 4);
    }
    for (var i = vehicles.length - 1; i >= 0; i--) {
        vehicles[i].boundaries();
        vehicles[i].behaviors(food, poison);
        vehicles[i].update();
        vehicles[i].display();
        var newVehicle = vehicles[i].clone();
        if (newVehicle != null) {
            vehicles.push(newVehicle);
        }
        if (vehicles[i].dead()) {
            dead_vehicles.push(vehicles[i]);
            var x = vehicles[i].position.x;
            var y = vehicles[i].position.y;
            food.push(createVector(x, y));
            vehicles.splice(i, 1);
        }
    }

    if (vehicles.length === 0) {
        dead_vehicles.sort((a, b) => {
            return a.time_alive - b.time_alive;
        })
        update_table(dead_table, dead_vehicles, 0);
        noLoop();
    }

    if (vehicles.length <= 5)
        update_table(alive_table, vehicles, 0);


    document.getElementById('curr_num_alive').innerHTML = vehicles.length;
}


async function update_table(table, arr, num) {
    await clear_table(table, num);
    for (i = 0; i < arr.length; i++) {
        var row = table.insertRow();

        var index = row.insertCell(0);
        index.innerHTML = arr[i].id;

        var food_weigth = row.insertCell(1);
        food_weigth.innerHTML = Math.round(arr[i].dna.food_weight * 10000) / 10000;

        var poison_weight = row.insertCell(2);
        poison_weight.innerHTML = Math.round(arr[i].dna.poison_weight * 10000) / 10000;

        var food_perception = row.insertCell(3);
        food_perception.innerHTML = Math.round(arr[i].dna.food_perception * 10000) / 10000;

        var poison_perception = row.insertCell(4);
        poison_perception.innerHTML = Math.round(arr[i].dna.poison_perception * 10000) / 10000;


        var health = row.insertCell(5);
        health.innerHTML = Math.round(arr[i].health * 100) / 100;


        var time = row.insertCell(6);
        time.innerHTML = Math.round(arr[i].time_alive * 100) / 100;
    }
}

function clear_table(table, num = 0) {
    for (i = 1; i < table.rows.length; i++) {
        table.deleteRow(i);
    }
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