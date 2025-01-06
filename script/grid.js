// Refactored generateGrid function

document.addEventListener("DOMContentLoaded", generateGrid);

let cells = [];
let startCell = null;
let targetCell = null;
let grid = null;
let cellSize = 25;

let mouseState = {
  isPressed: false, // Is the mouse currently pressed
  action: null, // "drag-start", "drag-target", "add-wall", "remove-wall"
  previousCell: null, // Last cell interacted with (for drag logic)
};

function generateGrid(size = 70) {
  const gridContainer = document.querySelector("#workplaceContainer");
  gridContainer.innerHTML = ""; // Clear previous grid

  // Create grid table element
  grid = document.createElement("table");
  grid.id = "grid";
  gridContainer.appendChild(grid);

  cellSize =
    Math.min(gridContainer.clientWidth, gridContainer.clientHeight) / size;

  // Initialize the grid's rows and columns
  const rows = size;
  const columns = size;

  // Randomly place start and target cells
  const startRowIndex = Math.floor(Math.random() * rows);
  const startColIndex = Math.floor(Math.random() * columns);
  let targetRowIndex = Math.floor(Math.random() * rows);
  let targetColIndex = Math.floor(Math.random() * columns);

  // Ensure target cell is not the same as the start cell
  while (targetRowIndex === startRowIndex && targetColIndex === startColIndex) {
    targetRowIndex = Math.floor(Math.random() * rows);
    targetColIndex = Math.floor(Math.random() * columns);
  }

  // Initialize the cells array
  cells = Array.from({ length: rows }, () => Array(columns).fill(null));
  const documentFragment = document.createDocumentFragment();

  // Create grid rows and cells
  for (let i = 0; i < rows; i++) {
    const gridRow = document.createElement("tr");

    for (let j = 0; j < columns; j++) {
      const htmlCell = document.createElement("td");
      htmlCell.classList.add("cell");
      htmlCell.dataset["row"] = i;
      htmlCell.dataset["col"] = j;

      htmlCell.style.width = `${cellSize}px`;
      htmlCell.style.height = `${cellSize}px`;

      // Initialize the cell object
      cells[i][j] = new Cell(htmlCell, i, j);

      // Set start and target cells
      if (i === startRowIndex && j === startColIndex) {
        htmlCell.classList.add("cell-start");
        startCell = cells[i][j];
        cells[i][j].isStart = true;
      } else if (i === targetRowIndex && j === targetColIndex) {
        htmlCell.classList.add("cell-target");
        targetCell = cells[i][j];
        cells[i][j].isTarget = true;
      }

      gridRow.appendChild(htmlCell);
    }

    documentFragment.appendChild(gridRow);
  }

  grid.appendChild(documentFragment);

  // Set grid size to match container dimensions
  // Set the grid size to fit the container's size
  grid.style.width = `${columns * cellSize}px`;
  grid.style.height = `${rows * cellSize}px`;

  // Attach mouse event listeners
  grid.addEventListener("mousedown", handleMouseDown);
  grid.addEventListener("mousemove", handleMouseMove);
  grid.addEventListener("mouseup", handleMouseUp);
  grid.addEventListener("contextmenu", (event) => event.preventDefault()); // Disable context menu
}

function clearGrid(keepWalls = false, keepPoints = true) {
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      cells[i][j].htmlRef.className = "cell";
      if (cells[i][j].isStart) {
        if (keepPoints) {
          cells[i][j].htmlRef.classList.add("cell-start");
        } else {
          cells[i][j].isStart = false;
        }
      } else if (cells[i][j].isTarget) {
        if (keepPoints) {
          cells[i][j].htmlRef.classList.add("cell-target");
        } else {
          cells[i][j].isTarget = false;
        }
      } else if (cells[i][j].isWall) {
        if (keepWalls) {
          cells[i][j].htmlRef.classList.add("cell-wall");
        } else {
          cells[i][j].isWall = false;
        }
      } else if (cells[i][j].weight > 1) {
        if (keepPoints) {
          cells[i][j].htmlRef.classList.add("cell-weight");
        } else {
          cells[i][j].weight = 1;
        }
      }
    }
  }
}

function getCellFromEvent(event) {
  const row = event.target?.dataset["row"];
  const col = event.target?.dataset["col"];
  return row !== undefined && col !== undefined ? cells[row][col] : null;
}

function toggleWall(cell, isWall) {
  if (cell.isStart || cell.isTarget) return; // Can't toggle walls on start/target cells
  cell.isWall = isWall;
  cell.htmlRef.classList.toggle("cell-wall", isWall);
}

function toggleWeight(cell, isWeighted) {
  if (cell.isStart || cell.isTarget || cell.isWall) return;

  cell.weight = isWeighted ? 50 : 1;
  cell.htmlRef.classList.toggle("cell-weight", isWeighted);
}

function handleMouseDown(event) {
  const cell = getCellFromEvent(event); // Helper to get cell from event.target
  if (!cell || isAnimating) return;

  mouseState.isPressed = true;

  if (cell.isStart) {
    mouseState.action = "drag-start";
    mouseState.previousCell = cell;
  } else if (cell.isTarget) {
    mouseState.action = "drag-target";
    mouseState.previousCell = cell;
  } else if (event.button === 0) {
    if (event.shiftKey) {
      // Shift + Left Click
      mouseState.action = "add-weight";
      toggleWeight(cell, true);
    } else {
      // Regular Left Click
      mouseState.action = "add-wall";
      toggleWall(cell, true);
    }
  } else if (event.button === 2) {
    if (event.shiftKey) {
      // Shift + Right Click
      mouseState.action = "remove-weight";
      toggleWeight(cell, false);
    } else {
      // Regular Right Click
      mouseState.action = "remove-wall";
      toggleWall(cell, false);
    }
  }
}

function handleMouseMove(event) {
  if (!mouseState.isPressed || isAnimating) return;

  const cell = getCellFromEvent(event);
  if (!cell || cell === mouseState.previousCell) return;

  switch (mouseState.action) {
    case "drag-start":
      moveStartCell(cell);
      break;
    case "drag-target":
      moveTargetCell(cell);
      break;
    case "add-wall":
      toggleWall(cell, true);
      break;
    case "remove-wall":
      toggleWall(cell, false);
      break;
    case "remove-weight":
      toggleWeight(cell, false);
      break;
    case "add-weight":
      toggleWeight(cell, true);
      break;
  }

  mouseState.previousCell = cell; // Update previous cell
}

function handleMouseUp() {
  mouseState.isPressed = false;
  mouseState.action = null;
  mouseState.previousCell = null;
}

function moveStartCell(newCell) {
  if (newCell.isWall || newCell.isTarget) return;

  // Remove the start class from the old start cell
  startCell.htmlRef.classList.remove("cell-start");
  startCell.isStart = false;

  newCell.htmlRef.classList.add("cell-start");
  newCell.isStart = true;

  startCell = newCell;

  if (running !== "") {
    clearGrid(true);
    visualizeSelectedAlgorithmInRealTime();
  }
}

function moveTargetCell(newCell) {
  if (newCell.isWall || newCell.isStart) return;

  targetCell.htmlRef.classList.remove("cell-target");
  targetCell.isTarget = false;

  newCell.htmlRef.classList.add("cell-target");
  newCell.isTarget = true;

  targetCell = newCell;

  if (running !== "") {
    clearGrid(true); // Clear the grid but keep walls
    visualizeSelectedAlgorithmInRealTime();
  }
}
