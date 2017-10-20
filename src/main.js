var world;
var display;

function main() {
    world = new World(8);
    display = new Display();
    // fuck with the world a lot
    // world.fillArea([2, 2, 3], [5, 5, 5], FILL_ADD);
    // world.fillArea([3, 3, 6], [4, 4, 6], FILL_ADD);
    // world.fillArea([2, 3, 3], [5, 4, 4], FILL_REMOVE);
    // world.fillArea([3, 2, 3], [4, 5, 4], FILL_REMOVE);
    // world.fillArea([2, 2, 4], [5, 5, 6], FILL_TOGGLE);
    display.update();
    document.getElementById("glcanvas").addEventListener("click", test);
}

function test() {
    var x = Math.floor(world.size*Math.random());
    var y = Math.floor(world.size*Math.random());
    var z = Math.floor(world.size*Math.random());
    world.fillArea([x, y, z], [x, y, z], FILL_TOGGLE);
    display.update();
}

main();
