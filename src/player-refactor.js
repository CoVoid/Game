var player = (function() {

    var pos = [];

    function init(p) {
        pos = p;
    }

    function move(dir) {
        let x = pos[0], y = pos[1], z = pos[2];
        let dx = dir[0], dy = dir[1];
        if (!world.isSolid([x + dx, y + dy, z])) {
            pos[0] = x + dx;
            pos[1] = y + dy;
            fall();
        } else {
            if (!world.isSolid([x, y, z + 1]) && !world.isSolid([x + dx, y + dy, z + 1])) {
                pos[0] = x + dx;
                pos[1] = y + dy;
                pos[2] = z + 1;
            }
        }
    }

    function fall() {
        let z = pos[2];
        if (!world.isSolid([pos[0], pos[1], z - 1])) {
            pos[2] = z - 1;
            fall();
        }
    }

    return {
        init: init,
        move: move,
        get pos() {return pos}
    }
})();
