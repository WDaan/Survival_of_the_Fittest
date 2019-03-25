// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Steering Evolution
// Another version:
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning/tree/master/week2-evolution/01_evolve_steering
// Part 1: [TBA]
// Part 2: [TBA]
// Part 3: [TBA]
// Part 4: [TBA]
// Part 5: [TBA]
var vehicles = [];
var food = [];
var poison = [];

function setup() {
    var canvas = createCanvas(640, 360);
    canvas.parent('canvas_panel');

    var num_car = 30;
    var num_food = 40;
    var num_pois = 20;

    var apply = select('#apply_variables');
    apply.mousePressed(() => {
        console.log('test');
        num_car = select('#num_car').value();
        num_food = select('#num_food').value();
        num_pois = select('#num_pois').value();
        reinit();
    });

    function init() {
        for (var i = 0; i < num_car; i++) {
            var x = random(width);
            var y = random(height);
            vehicles[i] = new Vehicle(x, y);
        }
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

    function reinit() {
        redraw();
        vehicles = [];
        food = [];
        poison = [];
        init();
        draw();
    }

    init();

    perception = select('#check_perception')
}

function draw() {
    background(51);
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
            var x = vehicles[i].position.x;
            var y = vehicles[i].position.y;
            food.push(createVector(x, y));
            vehicles.splice(i, 1);
        }
    }
}