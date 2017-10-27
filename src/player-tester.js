// gettin into that REALLY complicated stuff now
function Player(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    function move(dir) {
        let x = this.x, y = this.y, z = this.z;
        let dx = 0, dy = 0;
        switch(dir) {
            case NORTH:
                dy = 1;
                break;
            case SOUTH:
                dy = -1;
                break;
            case WEST:
                dx = -1;
                break
            case EAST:
                dx = 1;
                break;
            default:
                return console.log('Not a valid direction');
        }
        if (!world.isSolid(x + dx, y + dy, z)) {
            this.x = x + dx;
            this.y = y + dy;
            fall();
        } else {
            if (!world.isSolid(x, y, z + 1) && !world.isSolid(x + dx, y + dy, z + 1)) {
                this.x = x + dx;
                this.y = y + dy;
                this.z = z + 1;
            }
        }
    }

    function fall() {
        let x = player.x; y = player.y, z = player.z;
        if (!world.isSolid(x, y, z - 1)) {
            player.z = z - 1;
            fall();
        }
    }

    this.move = move;
}
