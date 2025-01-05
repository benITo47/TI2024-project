function executeDijkstra() {
  if (!cells || !startCell || !targetCell) {
    console.error("Grid, start, or target cells are missing.");
    return;
  }

  let distanceMap = new Map(); // Map to store distances of cells
  let pathfindMap = new Map(); // Map to reconstruct the path
  let visited = new Set(); // Set to track visited cells
  let priorityQueue = new MinHeap(); // MinHeap to manage the priority queue

  // Initialize the distance map with Infinity for all cells, and 0 for the start cell
  for (let row of cells) {
    for (let cell of row) {
      distanceMap.set(cell, Infinity);
    }
  }
  distanceMap.set(startCell, 0);

  pathfindMap.set(startCell, null); // Start cell has no predecessor
  priorityQueue.insert({ cell: startCell, distance: 0 }); // Add the start cell to the queue with distance 0

  Dijkstra(cells, targetCell, distanceMap, pathfindMap, visited, priorityQueue);
}

function Dijkstra(
  cellGrid,
  target,
  distanceMap,
  pathfindMap,
  visited,
  priorityQueue,
) {
  if (priorityQueue.isEmpty()) {
    console.log("No path found!");
    return;
  }

  let current = priorityQueue.extractMin(); // Get the cell with the smallest distance
  let currentCell = current.cell;

  // Skip already visited cells
  if (visited.has(currentCell)) {
    setTimeout(
      () =>
        Dijkstra(
          cellGrid,
          target,
          distanceMap,
          pathfindMap,
          visited,
          priorityQueue,
        ),
      0,
    );
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
  if (currentCell.isTarget) {
    console.log("Path found!");
    findAndDrawPath(pathfindMap, currentCell);
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
      let neighbor = cellGrid[row][col];
      let newDistance = distanceMap.get(currentCell) + 1; // Uniform weight is 1 for every step

      // Update the distance map if a shorter path is found
      if (newDistance < distanceMap.get(neighbor)) {
        distanceMap.set(neighbor, newDistance);
        pathfindMap.set(neighbor, currentCell); // Track the path
        priorityQueue.insert({ cell: neighbor, distance: newDistance }); // Add/Update the neighbor in the queue
      }
    }
  }

  // Continue the animation
  setTimeout(
    () =>
      Dijkstra(
        cellGrid,
        target,
        distanceMap,
        pathfindMap,
        visited,
        priorityQueue,
      ),
    10,
  );
}
