function executeAStar() {
  if (!cells || !startCell || !targetCell) {
    return;
  }
  isAnimating = true;
  clearGrid(true);
  let pathfindMap = new Map();
  let distanceMap = new Map();
  let heuresticMap = new Map();
  let processed = new Set();
  let minHeap = new MinHeap();

  let h = 0;
  for (let i = 0; i < cells.length; ++i) {
    for (let j = 0; j < cells[i].length; ++j) {
      distanceMap.set(cells[i][j], Infinity);
      h = heuristic(cells[i][j], targetCell);
      heuresticMap.set(cells[i][j], h);
    }
  }
  distanceMap.set(startCell, 0);
  pathfindMap.set(startCell, null);

  minHeap.insert({ cell: startCell, distance: 0 });
  setTimeout(
    AStar,
    0,
    cells,
    startCell,
    targetCell,
    pathfindMap,
    distanceMap,
    heuresticMap,
    processed,
    minHeap,
  );
}

function AStar(
  cellGrid,
  start,
  target,
  pathfindMap,
  distanceMap,
  heuresticMap,
  visited,
  priorityQueue,
) {
  if (priorityQueue.isEmpty()) {
    console.log("No path found!");
    toggleControls(false);

    isAnimating = false;
    return;
  }

  let currentCell = priorityQueue.extractMin().cell;

  if (visited.has(currentCell)) {
    setTimeout(
      () =>
        AStar(
          cellGrid,
          start,
          target,
          pathfindMap,
          distanceMap,
          heuresticMap,
          visited,
          priorityQueue,
        ),
      10,
    );
    return;
  }

  visited.add(currentCell); // Mark cell as visited
  let htmlCell = currentCell.htmlRef;

  // Visually mark the current cell as being processed
  htmlCell.classList.add("cell-current");
  setTimeout(() => {
    htmlCell.classList.remove("cell-current");
    htmlCell.classList.add("cell-visited");
  }, 1000);

  if (currentCell === target) {
    console.log("Path found!");
    findAndDrawPath(pathfindMap, target);
    return;
  }

  // Process neighbors
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
      let currentDistanceFromStart = distanceMap.get(currentCell);
      let edgeDistance = cellGrid[row][col].weight;
      let newDistance = currentDistanceFromStart + edgeDistance;

      if (newDistance < distanceMap.get(cellGrid[row][col])) {
        distanceMap.set(cellGrid[row][col], newDistance);
        pathfindMap.set(cellGrid[row][col], currentCell);

        // Calculate priority using g + h
        let priority = newDistance + heuresticMap.get(cellGrid[row][col]);
        priorityQueue.insert({ cell: cellGrid[row][col], distance: priority });
      }
    }
  }

  // Recursively call AStar with a delay for animation
  setTimeout(
    () =>
      AStar(
        cellGrid,
        start,
        target,
        pathfindMap,
        distanceMap,
        heuresticMap,
        visited,
        priorityQueue,
      ),
    10,
  );
}

/**
 * Heuristic function: Manhattan Distance
 * @param {Object} cellA - The current cell
 * @param {Object} cellB - The target cell
 * @returns {number} - The Manhattan distance between the two cells
 */
function heuristic(cellA, cellB) {
  let rowA = parseInt(cellA.htmlRef.dataset["row"]);
  let colA = parseInt(cellA.htmlRef.dataset["col"]);
  let rowB = parseInt(cellB.htmlRef.dataset["row"]);
  let colB = parseInt(cellB.htmlRef.dataset["col"]);

  return Math.abs(rowA - rowB) + Math.abs(colA - colB);
}

function AStarInRealTime(cellGrid, start, target) {
  const pathfindMap = new Map();
  const distanceMap = new Map();
  const heuresticMap = new Map();
  const visited = new Set();
  const minHeap = new MinHeap();

  // Initialize distances and heuristics
  for (let i = 0; i < cellGrid.length; ++i) {
    for (let j = 0; j < cellGrid[i].length; ++j) {
      distanceMap.set(cellGrid[i][j], Infinity);
      const h = heuristic(cellGrid[i][j], target);
      heuresticMap.set(cellGrid[i][j], h);
    }
  }
  distanceMap.set(start, 0);
  pathfindMap.set(start, null);

  minHeap.insert({ cell: start, distance: 0 });

  while (!minHeap.isEmpty()) {
    const currentCell = minHeap.extractMin().cell;

    if (visited.has(currentCell)) {
      continue;
    }

    visited.add(currentCell);

    const htmlCell = currentCell.htmlRef;
    htmlCell.classList.add("cell-visited");

    if (currentCell === target) {
      console.log("Path found!");
      findAndDrawPathRealTime(pathfindMap, target);
      return;
    }

    for (let i = 0; i < directions.length; i++) {
      const row =
        parseInt(currentCell.htmlRef.dataset["row"]) + directions[i][0];
      const col =
        parseInt(currentCell.htmlRef.dataset["col"]) + directions[i][1];

      if (
        cellGrid[row] &&
        cellGrid[row][col] &&
        !cellGrid[row][col].isWall &&
        !visited.has(cellGrid[row][col])
      ) {
        const currentDistanceFromStart = distanceMap.get(currentCell);
        const edgeDistance = cellGrid[row][col].weight;
        const newDistance = currentDistanceFromStart + edgeDistance;

        if (newDistance < distanceMap.get(cellGrid[row][col])) {
          distanceMap.set(cellGrid[row][col], newDistance);
          pathfindMap.set(cellGrid[row][col], currentCell);

          const priority = newDistance + heuresticMap.get(cellGrid[row][col]);
          minHeap.insert({ cell: cellGrid[row][col], distance: priority });
        }
      }
    }
  }

  console.log("No path found!");
}
