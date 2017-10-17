//Controller.js
var box = document.getElementById('box'),
    boxPos = 10,
    boxVelocity = 2,
    limit = 300;

var requestAnimationFrame = window.requestAnimationFrame;

function draw() {
  box.style.left = boxPos +'px';
}

function update(){
  boxPos += boxVelocity;
  if(boxPos >= limit || boxPos <= 0) boxVelocity = -boxVelocity;
}

function mainLoop() {
  update();
  draw();
  requstAnimationFrame(mainLoop);
}

mainLoop();
