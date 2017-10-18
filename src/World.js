// world.js

function World(size) {

    // fill a volume with 'false'
    var solid = new Array(size);
    for (var x = 0; x < size; x++) {
        solid[x] = new Array(size);
        for (var y = 0; y < size; y++) {
            solid[x][y] = new Array(size);
            for (var z = 0; z < size; z++) {
                solid[x][y][z] = false;
            }
        }
    }

    // does exactly what you'd expect
    function isSolid(x, y, z) {
        return solid[x][y][z];
    }

    // fills a single pixel
    function fill(x, y, z, operation) {
        switch(operation) {
            case FILL_ADD:
                solid[x][y][z] = true;
                break;
            case FILL_REMOVE:
                solid[x][y][z] = false;
                break;
            case FILL_TOGGLE:
                solid[x][y][z] = !solid[x][y][z];
                break;
            default:
                console.log('There\'s been a mistake');
        }
    }

    // fills an area bouded by two points
    function fillArea(p1, p2, operation = FILL_ADD) {
        // trust nobody
        var x1 = Math.min(p1[0], p2[0]), x2 = Math.max(p1[0], p2[0]);
        var y1 = Math.min(p1[1], p2[1]), y2 = Math.max(p1[1], p2[1]);
        var z1 = Math.min(p1[2], p2[2]), z2 = Math.max(p1[2], p2[2]);
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; z++) {
                    fill(x, y, z, operation);
                }
            }
        }
    };

    // returns an array with the coordinate of every solid block
    function getSolids() {
        solids = [];
        for (var x = 0; x < size; x++) {
            for (var y = 0; y < size; y++) {
                for (var z = 0; z < size; z++) {
                    if(solid[x][y][z]) {
                        solids.push([x, y, z]);
                    }
                }
            }
        }
        return solids;
    }

    // adds some terrain to test the level
    function test() {
        let s = size;
        // makes the floor solid
        fillArea([0,   0,   0  ], [s-1, s-1, 0  ]);
        // adds a tiny pedestal in the middle
        fillArea([3,   3,   1  ], [4,   4,   1  ]);
        // adds a frame
        fillArea([0,   0,   1  ], [0,   0,   s-1]);
        fillArea([0,   s-1, 1  ], [0,   s-1, s-1]);
        fillArea([s-1, 0,   1  ], [s-1, 0,   s-1]);
        fillArea([s-1, s-1, 1  ], [s-1, s-1, s-1]);
        fillArea([0,   1,   s-1], [0,   s-2, s-1]);
        fillArea([1,   0,   s-1], [s-2, 0,   s-1]);
        fillArea([s-1, 1,   s-1], [s-1, s-2, s-1]);
        fillArea([1,   s-1, s-1], [s-2, s-1, s-1]);
    };
    // run it, why not?
    test();

    // determines what properties are saved and accessible
    this.size = size;
    this.solid = solid;
    this.isSolid = isSolid;
    this.fill = fill;
    this.fillArea = fillArea;
    this.getSolids = getSolids;
}

World.prototype.toString = function toString() {
    var string = '';
    for (var z = this.size - 1; z >= 0; z--) {
        for (var y = 0; y < this.size; y++) {
            for (var x = 0; x < this.size; x++) {
                string += this.solid[x][y][z] ? 'X' : ' ';
            }
            string += '\n';
        }
        string += '\n';
    }
    return string;
}
