let canvas;
let xPos;
let yPos;
const easing = 0.1;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);
  canvas.style("position", "fixed");
  canvas.style("z-index", "0");
  canvas.style("pointer-events", "none");
  xPos = width / 2;
  yPos = height / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();
  xPos = xPos + (mouseX - xPos) * easing;
  yPos = yPos + (mouseY - yPos) * easing;
  drawThing(xPos, yPos);
}

function drawThing(x, y) {
  //draw eyes
  fill(255);
  ellipse(x, y, 30, 30);
  ellipse(x + 20, y + 5, 30, 30);
  //draw pupils
  fill(0);
  ellipse(x, y, 5, 5);
  ellipse(x + 20, y + 5, 5, 5);
}
