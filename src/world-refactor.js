var world = (function() {

    var solid;
    var size;

    // sets up an empty world
    function init(s = 8) {
        size = s;
        solid = new Array(size);
        for (var x = 0; x < size; x++) {
            solid[x] = new Array(size);
            for (var y = 0; y < size; y++) {
                solid[x][y] = new Array(size);
                for (var z = 0; z < size; z++) {
                    solid[x][y][z] = false;
                }
            }
        }
    }

    // does exactly what you'd expect
    function isSolid(p) {
        return solid[p[0]][p[1]][p[2]];
    }

    // fills a single pixel
    function fill(p, operation = FILL_ADD) {
        let x = p[0], y = p[1], z = p[2];
        switch(operation) {
            case FILL_ADD:
                return solid[x][y][z] = true;
            case FILL_REMOVE:
                return solid[x][y][z] = false;
            case FILL_TOGGLE:
                return solid[x][y][z] = !solid[x][y][z];
            default:
                console.log('ERR: Invalid fill operation');
        }
    }

    // fills an area bouded by two points
    function fillArea(p1, p2, operation = FILL_ADD) {
        // trust nobody
        var x1 = Math.min(p1[0], p2[0]), x2 = Math.max(p1[0], p2[0]);
        var y1 = Math.min(p1[1], p2[1]), y2 = Math.max(p1[1], p2[1]);
        var z1 = Math.min(p1[2], p2[2]), z2 = Math.max(p1[2], p2[2]);
        if (x1 < 0 || y1 < 0 || z1 < 0 || x2 > size-1 || y2 > size-1 || z2 > size-1) {
            return console.log('ERR: Invalid range');
        }

        // fill 'er up
        for (var x = x1; x <= x2; x++) {
            for (var y = y1; y <= y2; y++) {
                for (var z = z1; z <= z2; z++) {
                    fill([x, y, z], operation);
                }
            }
        }
    }

    // returns an array with the coordinate of every solid block TODO cache this value
    function getSolids() {
        let solids = [];
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

    return {
        init: init,
        isSolid: isSolid,
        fill: fill,
        fillArea: fillArea,
        get size() {return size},
        get solids() {return getSolids()}
    };

})();

// *** DEPRICATED ***
// World.prototype.toString = function toString() {
//     var string = '';
//     for (var z = this.size - 1; z >= 0; z--) {
//         for (var y = 0; y < this.size; y++) {
//             for (var x = 0; x < this.size; x++) {
//                 string += this.solid[x][y][z] ? 'X' : ' ';
//             }
//             string += '\n';
//         }
//         string += '\n';
//     }
//     return string;
// }
