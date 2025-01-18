function executeMazeGenerator() {
  clearGrid(false, false);
  toggleControls(true);

  // Set all cells as walls initially
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      cells[i][j].htmlRef.classList.add("cell-wall");
      cells[i][j].isWall = true;
    }
  }

  let mazeDirections = [
    [0, 2],
    [0, -2],
    [2, 0],
    [-2, 0],
  ];

  let cell =
    cells[Math.floor(Math.random() * cells.length)][
      Math.floor(Math.random() * cells[0].length)
    ];

  cell.isWall = false;
  cell.htmlRef.classList.remove("cell-wall");

  let frontierArr = [];
  computeFrontierCells(cells, cell, frontierArr, mazeDirections);
  setTimeout(() => {
    generateMazePrim(cells, frontierArr, mazeDirections);
  }, 5);
}

function setStartAndTargetCells() {
  let start = getRandomCell();
  let target = getRandomCell();

  while (start.isWall) {
    start = getRandomCell();
  }
  while (target.isWall || start === target) {
    target = getRandomCell();
  }
  start.isStart = true;
  start.htmlRef.classList.add("cell-start");
  target.isTarget = true;
  target.htmlRef.classList.add("cell-target");

  startCell = start;
  targetCell = target;
}

function getRandomCell() {
  let randomRow = Math.floor(Math.random() * cells.length);
  let randomCol = Math.floor(Math.random() * cells[0].length);
  return cells[randomRow][randomCol];
}

function computeFrontierCells(cellGrid, cell, frontierArr, mazeDirections) {
  for (let i = 0; i < mazeDirections.length; ++i) {
    let row = parseInt(cell.htmlRef.dataset["row"]) + mazeDirections[i][0];
    let col = parseInt(cell.htmlRef.dataset["col"]) + mazeDirections[i][1];
    if (cellGrid[row] && cellGrid[row][col] && cellGrid[row][col].isWall) {
      let frontier = cellGrid[row][col];
      let inBetween = null;

      if (mazeDirections[i][0] === -2 && cell.row - 1 >= 0) {
        inBetween = cellGrid[cell.row - 1][cell.col];
      } else if (mazeDirections[i][0] === 2 && cell.row + 1 < cellGrid.length) {
        inBetween = cellGrid[cell.row + 1][cell.col];
      } else if (mazeDirections[i][1] === -2 && cell.col - 1 >= 0) {
        inBetween = cellGrid[cell.row][cell.col - 1];
      } else if (
        mazeDirections[i][1] === 2 &&
        cell.col + 1 < cellGrid[0].length
      ) {
        inBetween = cellGrid[cell.row][cell.col + 1];
      }

      // Only push to frontier if `inBetween` is valid
      if (inBetween) {
        frontierArr.push([inBetween, frontier]);
      }
    }
  }
}

function generateMazePrim(cellGrid, frontierArr, mazeDirections) {
  if (frontierArr.length) {
    let random = Math.floor(Math.random() * frontierArr.length);
    let batch = frontierArr[random];
    frontierArr.splice(random, 1);
    let inBetween = batch[0];
    let frontier = batch[1];
    if (frontier.isWall) {
      frontier.isWall = false;
      frontier.htmlRef.classList.remove("cell-wall");
      inBetween.isWall = false;
      inBetween.htmlRef.classList.remove("cell-wall");
      computeFrontierCells(cellGrid, frontier, frontierArr, mazeDirections);
    }
    setTimeout(generateMazePrim, 10, cellGrid, frontierArr, mazeDirections);
  } else {
    setTimeout(() => {
      setStartAndTargetCells();
    }, 20);
    toggleControls(false);
    mazeHasBeenSaved = false;
  }
}

function executeBacktrackingMazeGenerator() {
  clearGrid(false, false);
  toggleControls(true);

  // Set all cells as walls initially
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      cells[i][j].htmlRef.classList.add("cell-wall");
      cells[i][j].isWall = true;
    }
  }

  let cell =
    cells[Math.floor(Math.random() * cells.length)][
      Math.floor(Math.random() * cells[0].length)
    ];
  cell.isWall = false;
  cell.htmlRef.classList.remove("cell-wall");

  setStartAndTargetCells();

  // Start Recursive Backtracking algorithm
  let visitedCells = [];
  recursiveBacktrack(cell, visitedCells);

  // After maze generation, set the start and target cells
  setStartAndTargetCells();
}
