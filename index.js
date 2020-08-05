const get = document.querySelector.bind(document);
const get_all = document.querySelectorAll.bind(document);

let circle_being_moved = null;
let coordinates = [{ "x": 0, "y": 0 }, { "x": 350, "y": 0 }];
let circle_on_left = 1;
let circle_on_right = 2;
let angle = 0;

for (let circle of get_all(".circle")) {
  circle.addEventListener("mousedown", function (event) {
    const this_circle = event.currentTarget;
    circle_being_moved = this_circle.dataset.circle;
  });
}

window.addEventListener("mouseup", function (event) {
  circle_being_moved = null;
});

window.addEventListener("mousemove", function (event) {
  if (circle_being_moved) {
    redrawCircle(circle_being_moved);
  }
});

function redrawCircle(circle_number) {
  const x = event.pageX - get('#content').offsetLeft - 75;
  const y = event.pageY - get('#content').offsetTop - 75;

  const this_circle = get(`[data-circle="${circle_number}"]`);

  this_circle.style.left = x + 'px';
  this_circle.style.top = y + 'px';

  coordinates[circle_number - 1]["x"] = Math.round(x);
  coordinates[circle_number - 1]["y"] = Math.round(y);

  get(`[data-circle="${circle_number}"] .circle-x`).value = x;
  get(`[data-circle="${circle_number}"] .circle-y`).value = y;

  updateDistance();
  drawLine();
}

for (let coordinate_input of get_all(".coordinate-input")) {
  coordinate_input.addEventListener("change", function () {
    const axis = this.dataset.axis;
    const circle = this.closest(".circle");

    if (axis === "x") {
      circle.style.left = this.value + 'px';
    } else {
      circle.style.top = this.value + 'px';
    }

    const circle_number = circle.dataset.circle;
    coordinates[circle_number - 1][axis] = Math.round(this.value);

    updateDistance();
    drawLine();
  })

  coordinate_input.addEventListener("mousedown", function (event) {
    event.stopPropagation();
  });
}

get(".distance").addEventListener("change", function () {
  distance = this.value;

  if (distance < 0) {
    distance = 0;
    get(".distance").value = distance;
  }
  
  const angle_sin = Math.abs(Math.sin(angle));
  // if circle 1 is on the left
  if (circle_on_left === 1) {
    coordinates[1].x = coordinates[0].x + Math.cos(angle) * distance;

    // and is higher than circle 2
    if (coordinates[0].y < coordinates[1].y) {
      coordinates[1].y = coordinates[0].y + angle_sin * distance;
    } else {
      coordinates[1].y = coordinates[0].y - angle_sin * distance;
    }
  } else { // if circle 2 is on the left
    coordinates[1].x = coordinates[0].x - Math.cos(angle) * distance;
    // and is higher than circle 1
    if (coordinates[1].y < coordinates[0].y) {
      coordinates[1].y = coordinates[0].y - angle_sin * distance;
    } else {
      coordinates[1].y = coordinates[0].y + angle_sin * distance;
    }
  }

  coordinates[1].x = Math.round(coordinates[1].x);
  coordinates[1].y = Math.round(coordinates[1].y);

  get('[data-circle="2"]').style.left = coordinates[1].x + 'px';
  get('[data-circle="2"]').style.top = coordinates[1].y + 'px';
  get('[data-circle="2"] .circle-x').value = coordinates[1].x;
  get('[data-circle="2"] .circle-y').value = coordinates[1].y;

  drawLine(false);
});

let distance;
function updateDistance() {
  const distance_x = Math.abs(coordinates[0].x - coordinates[1].x);
  const distance_y = Math.abs(coordinates[0].y - coordinates[1].y);

  distance = Math.round(Math.sqrt(distance_x * distance_x + distance_y * distance_y));

  get(".distance").value = distance;
}

function drawLine(recalculate_angle) {
  if (coordinates[0].x > coordinates[1].x) {
    circle_on_left = 2;
    circle_on_right = 1;
  } else {
    circle_on_left = 1;
    circle_on_right = 2;
  }

  if (recalculate_angle !== false) {
    const distance_x = Math.abs(coordinates[0].x - coordinates[1].x);
    const distance_y = Math.abs(coordinates[0].y - coordinates[1].y);

    angle = Math.atan2(distance_y, distance_x); //angle in radians

    if (coordinates[circle_on_left - 1].y > coordinates[circle_on_right - 1].y) {
      angle = -angle;
    }
  }

  const line = get('.line');
  line.style.width = `${distance}px`;
  line.style.left = coordinates[circle_on_left - 1].x + 75 + 'px';
  line.style.top = coordinates[circle_on_left - 1].y + 75 + 'px';
  line.style.transform = `rotate(${angle * 180 / Math.PI}deg)`;
}