let directions = [
  [0, -1], // Left
  [0, 1], // Right
  [-1, 0], // Up
  [1, 0], // Down
];

function toggleControls(disable = true) {
  const controls = [
    "#clearGridButton",
    "#clearPathButton",
    "#visualizeGridButton",
    "#gridAlgorithmSelect",
    "#modeSelect",
    "#generateMazeBtn",
  ];

  controls.forEach((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.disabled = disable; // Disable or enable the control
    }
    if (disable) {
      element.classList.add("disabled");
    } else {
      element.classList.remove("disabled");
    }
  });

  // Optional: Add a class to visually indicate controls are disabled
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
    setTimeout(() => {
      const currentCell = path[i];
      currentCell.htmlRef.classList.add("cell-path");
    }, i * 25); // Delay increases with each step
  }

  setTimeout(() => {
    toggleControls(false);
    isAnimating = false;
  }, path.length * 25);
}

function findAndDrawPathRealTime(pathfindMap, currentCell) {
  let path = [];
  while (currentCell !== null) {
    path.unshift(currentCell);
    currentCell = pathfindMap.get(currentCell);
  }
  drawPathRealTime(path); // Draw the path immediately
}

function drawPathRealTime(path) {
  for (let i = 0; i < path.length; i++) {
    const currentCell = path[i];
    currentCell.htmlRef.classList.add("cell-path");
  }
}

function findAndDrawPathGraph(pathfindMap, currentVertex, canvas) {
  const ctx = canvas.getContext("2d");
  let path = [];
  while (currentVertex !== null) {
    path.unshift(currentVertex); // Push vertices in reverse order
    currentVertex = pathfindMap.get(currentVertex);
  }
  drawPathGraph(path, canvas, ctx); // Ensure the path drawing function is called with the right parameters
}

function drawPathGraph(path, canvas, ctx) {
  path.forEach((vertex, i) => {
    setTimeout(() => {
      if (i > 0) {
        const prevVertex = path[i - 1];
        graph.markEdgeAsPath(prevVertex, vertex); // Mark edges as part of the path
      }
      vertex.isPath = true; // Mark vertex as part of the path
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      graph.drawGraph(ctx);
    }, i * 150); // Delay for smooth animation
  });

  // End the animation after drawing the full path
  setTimeout(() => {
    toggleControls(false);
    isAnimating = false;
  }, path.length * 150);
}
