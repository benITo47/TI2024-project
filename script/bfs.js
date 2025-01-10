function executeBFS() {
  if (!cells || !startCell || !targetCell) {
    return;
  }
  isAnimating = true;
  clearGrid(true);
  let queue = [];
  queue.push(startCell);
  let pathfindMap = new Map();
  pathfindMap.set(startCell, null);

  setTimeout(() => {
    BFS(cells, startCell, targetCell, queue, pathfindMap);
  }, 10);
}

function BFS(cellGrid, start, target, queue, pathfindMap) {
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
      }, 200);

      if (currentCell === targetCell) {
        findAndDrawPath(pathfindMap, currentCell);
        return;
      }
      for (let j = 0; j < directions.length; j++) {
        let row = parseInt(htmlCell.dataset["row"]) + directions[j][0];
        let col = parseInt(htmlCell.dataset["col"]) + directions[j][1];

        if (
          cellGrid[row] &&
          cellGrid[row][col] &&
          !cellGrid[row][col].isWall &&
          !pathfindMap.has(cellGrid[row][col])
        ) {
          queue.push(cellGrid[row][col]);
          pathfindMap.set(cellGrid[row][col], currentCell);
        }
      }
    }
    setTimeout(() => {
      BFS(cellGrid, start, target, queue, pathfindMap);
    }, 80);
  } else {
    toggleControls(false);
    isAnimating = false;
  }
}

function BFSinRealTime(cellGrid, start, target) {
  if (!cellGrid || !start || !target) {
    return;
  }

  let queue = [];
  queue.push(start);
  let pathfindMap = new Map();
  pathfindMap.set(start, null);

  while (queue.length > 0) {
    let currentCell = queue.shift();

    if (currentCell.isWall) {
      continue; // Skip walls
    }

    // Mark the cell as visited
    currentCell.htmlRef.classList.add("cell-visited");

    if (currentCell === target) {
      findAndDrawPathRealTime(pathfindMap, currentCell);
      return; // Path found
    }

    for (let i = 0; i < directions.length; i++) {
      let row = parseInt(currentCell.htmlRef.dataset["row"]) + directions[i][0];
      let col = parseInt(currentCell.htmlRef.dataset["col"]) + directions[i][1];

      // Check bounds and if cell has already been visited
      if (
        cellGrid[row] &&
        cellGrid[row][col] &&
        !cellGrid[row][col].isWall &&
        !pathfindMap.has(cellGrid[row][col])
      ) {
        queue.push(cellGrid[row][col]);
        pathfindMap.set(cellGrid[row][col], currentCell);
      }
    }
  }

  console.log("No path found");

  toggleControls(false);
}

function graphBFS(graph, start, target) {}
