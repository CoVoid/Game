// controller.js

function update(){
    var world = new World(8);
    world.fillArea([0, 0, 6], [7, 7, 7], FILL_TOGGLE);
    console.log('' + world);
    console.log(world.getSolids());
}

function mainLoop() {
    update();
}

mainLoop();
