//Controller.js
function update(){
    for (x = 0; x < worldBlocks.length; x++){
        for (y = 0; y < worldBlocks[x].length; y++){
            for (z = 0; z < worldBlocks[x][y].length; z++){
                console.log(worldBlocks[x][y][z]);
            }
        }
    }
}


function mainLoop() {
  update();
}

mainLoop();
