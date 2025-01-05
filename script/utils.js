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
