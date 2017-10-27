var controller = (function() {

    function init() {
        document.addEventListener("keydown", keyPress);
    }

    function keyPress(event) {
        switch(event.key) {
            case 'w':
                return player.move(NORTH);
            case 's':
                return player.move(SOUTH);
            case 'a':
                return player.move(WEST);
            case 'd':
                return player.move(EAST);
        }
    }

    return {
        init: init
    }
})();
