var controller = (function() {

    function init() {
        document.addEventListener("keydown", keyPress);
        display.canvas.addEventListener("mousemove", mouseMove);
        display.canvas.addEventListener("mouseleave", mouseLeave);
    }

    function keyPress() {
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

    function mouseMove() {
        let x = (2 * event.clientX - display.canvas.clientWidth) / display.canvas.clientHeight;
        let y = -2 * event.clientY / display.canvas.clientHeight + 1;
        display.offset(x, y);
    }

    function mouseLeave() {
        display.offset(0, 0);
    }

    return {
        init: init
    }
})();
