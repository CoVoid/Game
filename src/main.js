var world;
var display;
var player;
var controller;

function main() {
    display = new Display();
    world = new World(8);
    player = new Player(2, 2, 1);
    controller = new Controller();
    test();
    // document.getElementById("glcanvas").addEventListener("click", clackity);

    // a simple test level
    function test() {
        let s = world.size;
        // makes the floor solid
        world.fillArea([0,   0,   0  ], [s-1, s-1, 0  ]);
        // adds a tiny pedestal in the middle
        world.fillArea([3,   3,   1  ], [4,   4,   1  ]);
        // adds a frame
        world.fillArea([0,   0,   1  ], [0,   0,   s-1]);
        world.fillArea([0,   s-1, 1  ], [0,   s-1, s-1]);
        world.fillArea([s-1, 0,   1  ], [s-1, 0,   s-1]);
        world.fillArea([s-1, s-1, 1  ], [s-1, s-1, s-1]);
        world.fillArea([0,   1,   s-1], [0,   s-2, s-1]);
        world.fillArea([1,   0,   s-1], [s-2, 0,   s-1]);
        world.fillArea([s-1, 1,   s-1], [s-1, s-2, s-1]);
        world.fillArea([1,   s-1, s-1], [s-2, s-1, s-1]);
    }

    // a weirder test level
    function test2() {
        world.fillArea([2, 2, 3], [5, 5, 5], FILL_ADD);
        world.fillArea([3, 3, 6], [4, 4, 6], FILL_ADD);
        world.fillArea([2, 3, 3], [5, 4, 4], FILL_REMOVE);
        world.fillArea([3, 2, 3], [4, 5, 4], FILL_REMOVE);
        world.fillArea([2, 2, 4], [5, 5, 6], FILL_TOGGLE);
    }

    // for testing purposes, of course
    function clickity() {
        // toggle a 4x4 cube
        let s = world.size - 4;
        let x = Math.floor(s * Math.random());
        let y = Math.floor(s * Math.random());
        let z = Math.floor(s * Math.random());
        world.fillArea([x, y, z], [x+4, y+4, z+4], FILL_TOGGLE);
    }

    function clackity() {
        // toggle a single cube away from the edge
        let s = world.size - 2;
        let x = Math.floor(s * Math.random()) + 1;
        let y = Math.floor(s * Math.random()) + 1;
        let z = Math.floor(s * Math.random()) + 1;
        world.fillArea([x, y, z], [x, y, z], FILL_TOGGLE);
    }
}

main();
