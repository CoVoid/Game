//Model
var worldBlocks = Array(8);

for (x = 0; x < worldBlocks.length; x++){
    worldBlocks[x] = Array(8);
    for (y = 0; y < worldBlocks[x].length; y++){
        worldBlocks[x][y] = Array(8);
        for (z = 0; z < worldBlocks[x][y].length; z++){
            worldBlocks[x][y][z] = false;
        }
    }
}
