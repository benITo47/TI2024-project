function executeDFS() {
  if (!cells || !startCell || !targetCell) {
    console.error("Grid, start, or target cells are missing.");
    return;
  }

  clearGrid(true);
  let stack = [startCell]; // Initialize the stack with the start cell
  let pathfindMap = new Map(); // Map to track the path
  let visited = new Set(); // Set to track visited cells

  pathfindMap.set(startCell, null); // Mark start cell as the root of the path

  DFS(cells, targetCell, stack, pathfindMap, visited);
}

function DFS(cellGrid, target, stack, pathfindMap, visited) {
  if (stack.length === 0) {
    console.log("No path found!");
    toggleControls(false);
    return;
  }

  let currentCell = stack.pop();

  // Skip already visited cells
  if (visited.has(currentCell)) {
    setTimeout(() => DFS(cellGrid, target, stack, pathfindMap, visited), 0);
    return;
  }

  visited.add(currentCell); // Mark cell as visited
  let htmlCell = currentCell.htmlRef;

  // Animate the current cell
  htmlCell.classList.add("cell-current");
  setTimeout(() => {
    htmlCell.classList.remove("cell-current");
    htmlCell.classList.add("cell-visited");
  }, 90);

  // Check if the target is reached
  if (currentCell === target) {
    console.log("Path found!");
    findAndDrawPath(pathfindMap, currentCell);
    return;
  }

  for (let i = 0; i < directions.length; i++) {
    let row = parseInt(currentCell.htmlRef.dataset["row"]) + directions[i][0];
    let col = parseInt(currentCell.htmlRef.dataset["col"]) + directions[i][1];

    // Ensure neighbor is within bounds, not a wall, and not visited
    if (
      cellGrid[row] &&
      cellGrid[row][col] &&
      !cellGrid[row][col].isWall &&
      !visited.has(cellGrid[row][col])
    ) {
      stack.push(cellGrid[row][col]);
      pathfindMap.set(cellGrid[row][col], currentCell); // Track the path
    }
  }

  // Continue the animation
  setTimeout(() => DFS(cellGrid, target, stack, pathfindMap, visited), 10);
}

function DFSinRealTime(cellGrid, start, target) {
  if (!cellGrid || !start || !target) {
    console.error("Grid, start, or target cells are missing.");
    return;
  }

  let stack = [start];
  let pathfindMap = new Map(); // Map to reconstruct the path
  let visitedCells = new Set(); // Set to track visited cells

  pathfindMap.set(start, null); // Mark start cell as the root of the path

  while (stack.length > 0) {
    let currentCell = stack.pop();

    if (visitedCells.has(currentCell)) {
      continue;
    }

    visitedCells.add(currentCell);

    if (currentCell.isTarget) {
      findAndDrawPathRealTime(pathfindMap, currentCell);
      console.log("Path found in real-time!");
      return;
    }

    let htmlCell = currentCell.htmlRef;

    // Mark the cell visually as visited
    if (htmlCell) {
      htmlCell.classList.add("cell-visited");
    }

    // Process neighbors
    for (let i = 0; i < directions.length; i++) {
      let row = parseInt(currentCell.htmlRef.dataset["row"]) + directions[i][0];
      let col = parseInt(currentCell.htmlRef.dataset["col"]) + directions[i][1];

      if (
        cellGrid[row] &&
        cellGrid[row][col] &&
        !cellGrid[row][col].isWall &&
        !visitedCells.has(cellGrid[row][col])
      ) {
        stack.push(cellGrid[row][col]); // Add the neighbor to the stack
        pathfindMap.set(cellGrid[row][col], currentCell); // Track the path
      }
    }
  }

  console.log("No path found in real-time!");

  toggleControls(false);
}
