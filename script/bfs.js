function executeBFS() {
  if (!cells || !startCell || !targetCell) {
    return;
  }

  clearGrid(true);
  let queue = [];
  queue.push(startCell);
  let pathfindMap = new Map();
  pathfindMap.set(startCell, null);

  let directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  setTimeout(() => {
    BFS(cells, startCell, targetCell, queue, pathfindMap, directions);
  }, 10);
}

function BFS(cellGrid, startCell, targetCell, queue, pathfindMap, directions) {
  let size = 0;
  let currentCell = null;

  if (queue.length) {
    size = queue.length;
    for (let i = 0; i < size; i++) {
      currentCell = queue.shift();

      if (currentCell.isWall) {
        continue;
      }

      let htmlCell = currentCell.htmlRef;
      htmlCell.classList.add("cell-current");
      setTimeout(() => {
        htmlCell.classList.remove("cell-current");
        htmlCell.classList.add("cell-visited");
      }, 1000);

      if (currentCell === targetCell) {
        findAndDrawPath(pathfindMap, currentCell);
        return;
      }
      for (let j = 0; j < directions.length; j++) {
        let row = htmlCell.dataset["row"] + directions[j][0];
        let col = htmlCell.dataset["col"] + directions[j][1];
        if (
          cellGrid[row] &&
          cellGrid[row][col] &&
          !cellGrid[row][col].isWall &&
          !pathfindMap.has(cellGrid[row][col])
        ) {
          queue.push(cellGrid[row][col]);
          pathfindMap.set(grid[row][col], currentCell);
        }
      }
    }
    setTimeout(() => {
      BFS(cellGrid, startCell, targetCell, queue, pathfindMap, directions);
    }, 30);
  } else {
    //GUI MANIPULATION TO ADD : )
  }
}

function findAndDrawPath(pathfindMap, currentCell) {
  let path = [];
  while (currentCell !== null) {
    path.unshift(currentCell);
    currentCell = pathfindMap.get(currentCell);
  }
  setTimeout(drawPath, 0, path);
}

function drawPath(path) {
  for (let i = 0; i < path.length; i++) {
    const currentCell = path[i];
    currentCell.htmlRef.classList.add("cell-path");
    setTimeout(45);
  }
}
