

function Controller() {
    document.addEventListener("keydown", keyPress);

    function move(dir) {
        player.move(dir);
    }

    function keyPress(event) {
        switch(event.key) {
            case 'w':
                return move(NORTH);
            case 's':
                return move(SOUTH);
            case 'a':
                return move(WEST);
            case 'd':
                return move(EAST);
        }
    }
}
