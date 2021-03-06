// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain

// Steering Evolution
// Another version:
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning/tree/master/week2-evolution/01_evolve_steering

// Part 1: https://youtu.be/flxOkx0yLrY
// Part 2: https://youtu.be/XaOVH8ZSRNA
// Part 3: https://youtu.be/vZUWTlK7D2Q
// Part 4: https://youtu.be/ykOcaInciBI
// Part 5: https://youtu.be/VnFF5V5DS8s

let mr;

function set_mr(num) {
  mr = num;
}

function Vehicle(x, y, dna, id) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(0, -2);
  this.position = createVector(x, y);
  this.r = 4;
  this.maxspeed = 5;
  this.maxforce = 0.5;
  this.time_alive = 0;
  this.health = 1;
  this.id = id;
  this.offspring_id = 0;

  const that = this;

  this.dna = {
    food_weight: 0,
    poison_weight: 0,
    food_perception: 0,
    poison_perception: 0
  };
  if (dna == null) {
    // Food weight
    this.dna.food_weight = random(-2, 2);
    // Poison weight
    this.dna.poison_weight = random(-2, 2);
    // Food perception
    this.dna.food_perception = random(0, 100);
    // Poision Percepton
    this.dna.poison_perception = random(0, 100);
  } else {
    // Mutation
    this.dna.food_weight = dna.food_weight;
    if (random(1) < mr) {
      this.dna.food_weight += random(-0.1, 0.1);
    }
    this.dna.poison_weight = dna.poison_weight;
    if (random(1) < mr) {
      this.dna.poison_weight += random(-0.1, 0.1);
    }
    this.dna.food_perception = dna.food_perception;
    if (random(1) < mr) {
      this.dna.food_perception += random(-10, 10);
    }
    this.dna.poison_perception = dna.poison_perception;
    if (random(1) < mr) {
      this.dna.poison_perception += random(-10, 10);
    }
  }

  this.add_seconds = () => {
    this.time_alive += 1;
    console.log(this.time_alive);
  };

  this.timer = setInterval(() => {
    that.time_alive += 1;
  }, 1000);

  this.stop_time = timerId => {
    clearInterval(timerId);
  };

  // Method to update location
  this.update = () => {
    this.health -= 0.005;

    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  };

  this.applyForce = force => {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
  };

  this.behaviors = (good, bad) => {
    const steerG = this.eat(good, 0.2, this.dna.food_perception);
    const steerB = this.eat(bad, -1, this.dna.poison_perception);

    steerG.mult(this.dna.food_weight);
    steerB.mult(this.dna.poison_weight);

    this.applyForce(steerG);
    this.applyForce(steerB);
  };

  this.clone = () => {
    if (random(1) < 0.002 && this.health > 0.65 && this.time_alive > 10) {
      this.offspring_id++;
      const id = `${this.id}.${this.offspring_id}`;
      const nv = new Vehicle(this.position.x, this.position.y, this.dna, id);
      return nv;
    }
    return null;
  };

  this.eat = (list, nutrition, perception) => {
    let record = Infinity;
    let closest = null;
    for (let i = list.length - 1; i >= 0; i--) {
      const d = this.position.dist(list[i]);

      if (d < this.maxspeed && this.health <= 5) {
        list.splice(i, 1);
        this.health += nutrition;
      } else if (d < record && d < perception) {
        record = d;
        closest = list[i];
      }
    }

    // This is the moment of eating!

    if (closest != null) {
      return this.seek(closest);
    }

    return createVector(0, 0);
  };

  // A method that calculates a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  this.seek = target => {
    const desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    const steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force

    return steer;
    // this.applyForce(steer);
  };

  this.dead = () => {
    if (this.health < 0) {
      this.stop_time(this.timer);
      return true;
    }
    return false;
  };

  this.display = () => {
    // Draw a triangle rotated in the direction of velocity
    const angle = this.velocity.heading() + PI / 2;

    push();
    translate(this.position.x, this.position.y);
    rotate(angle);

    if (perception.checked()) {
      strokeWeight(3);
      stroke(0, 255, 0);
      noFill();
      line(0, 0, 0, -this.dna.food_weight * 25);
      strokeWeight(2);
      ellipse(0, 0, this.dna.food_perception * 2);
      stroke(255, 0, 0);
      line(0, 0, 0, -this.dna.poison_weight * 25);
      ellipse(0, 0, this.dna.poison_perception * 2);
    }

    const gr = color(0, 255, 0);
    const rd = color(255, 0, 0);
    const col = lerpColor(rd, gr, this.health);

    fill(col);
    stroke(col);
    strokeWeight(1);
    beginShape();
    vertex(0, -this.r * 2);
    vertex(-this.r, this.r * 2);
    vertex(this.r, this.r * 2);
    endShape(CLOSE);

    pop();
  };

  this.boundaries = () => {
    const d = 25;

    let desired = null;

    if (this.position.x < d) {
      desired = createVector(this.maxspeed, this.velocity.y);
    } else if (this.position.x > width - d) {
      desired = createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < d) {
      desired = createVector(this.velocity.x, this.maxspeed);
    } else if (this.position.y > height - d) {
      desired = createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxspeed);
      const steer = p5.Vector.sub(desired, this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
  };
}
