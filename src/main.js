var world;
var display;

function main() {
    world = new World(8);
    // fuck with the world a lot
    world.fillArea([2, 2, 3], [5, 5, 5], FILL_ADD);
    world.fillArea([3, 3, 6], [4, 4, 6], FILL_ADD);
    world.fillArea([2, 3, 3], [5, 4, 4], FILL_REMOVE);
    world.fillArea([3, 2, 3], [4, 5, 4], FILL_REMOVE);
    world.fillArea([2, 2, 4], [5, 5, 6], FILL_TOGGLE);
    display.loadWorld(world);
    display.update();
    display.canvas.addEventListener("click", test);
}

function test() {
    world.fillArea([2, 2, 4], [5, 5, 6], FILL_TOGGLE);
    display.update();
}

main();
