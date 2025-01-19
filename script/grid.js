// Refactored generateGrid function

let cells = [];
let startCell = null;
let targetCell = null;
let grid = null;
let cellSize = 25;

let selectedGridSize = 70;
let running = "";
let isAnimating = false;

let mouseState = {
  isPressed: false, // Is the mouse currently pressed
  action: null, // "drag-start", "drag-target", "add-wall", "remove-wall"
  previousCell: null, // Last cell interacted with (for drag logic)
};

function updateGridSize(size) {
  selectedGridSize = size;
  generateGrid(size);
  resetRunningState();
  markSelectedGridSize();
}

function markSelectedGridSize() {
  const gridSizeButtons = ["generate50x50", "generate70x70", "generate100x100"];
  gridSizeButtons.forEach((id) => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.toggle(
        "active",
        id === `generate${this.selectedGridSize}x${this.selectedGridSize}`,
      );
    }
  });
}

function resetRunningState() {
  running = "";
  isAnimating = false;
}

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
  mazeHasBeenSaved = false;

  // Attach mouse event listeners
  grid.addEventListener("mousedown", gridHandleMouseDown);
  grid.addEventListener("mousemove", gridHandleMouseMove);
  grid.addEventListener("mouseup", gridHandleMouseUp);
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
  mazeHasBeenSaved = true;
}

function getCellFromEvent(event) {
  const row = event.target?.dataset["row"];
  const col = event.target?.dataset["col"];
  return row !== undefined && col !== undefined ? cells[row][col] : null;
}

function toggleWall(cell, isWall) {
  if (cell.isStart || cell.isTarget) return; // Can't toggle walls on start/target cells

  mazeHasBeenSaved = false;
  cell.isWall = isWall;
  cell.htmlRef.classList.toggle("cell-wall", isWall);
}

function toggleWeight(cell, isWeighted) {
  if (cell.isStart || cell.isTarget || cell.isWall) return;

  mazeHasBeenSaved = false;
  cell.weight = isWeighted ? 50 : 1;
  cell.htmlRef.classList.toggle("cell-weight", isWeighted);
}

function gridHandleMouseDown(event) {
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

function gridHandleMouseMove(event) {
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

function gridHandleMouseUp() {
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
  mazeHasBeenSaved = false;

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

  mazeHasBeenSaved = false;
  if (running !== "") {
    clearGrid(true); // Clear the grid but keep walls
    visualizeSelectedAlgorithmInRealTime();
  }
}

async function saveGrid() {
  if (!mazeHasBeenSaved) {
    let encodedGrid = cells
      .map((row) =>
        row
          .map((cell) => {
            if (cell.isStart) return "S";
            if (cell.isTarget) return "T";
            if (cell.isWall) return "W";
            if (cell.weight > 1) return "#";
            return "0";
          })
          .join(""),
      )
      .join("");

    const response = await fetchWithAuth(
      "http://localhost:4000/api/save-maze",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: cells.length,
          cols: cells[0].length,
          startNode: { row: startCell.row, col: startCell.row },
          targetNode: { row: targetCell.row, col: targetCell.row },
          data: encodedGrid,
        }),
      },
    );

    if (response.ok) {
      console.log("Grid saved successfully!");
      mazeHasBeenSaved = true;
    } else {
      console.error("Failed to save the grid.");
    }
  } else {
    alert("Change the maze before saving again!");
  }
}

async function fetchMaze(mazeId) {
  try {
    const response = await fetchWithAuth(
      `http://localhost:4000/api/load-maze/${mazeId}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to load maze with ID: ${mazeId}`);
    }

    const mazeData = await response.json();

    localStorage.setItem("mazeData", JSON.stringify(mazeData));

    window.location.href = `index.html`;
  } catch (error) {
    console.error("Error loading maze:", error);
  }
}

function loadMazeFromData(mazeData) {
  const { rows, cols, data } = mazeData;

  if (!rows || !cols || !data) {
    throw new Error("Maze data is incomplete or invalid.");
  }

  selectedGridSize = rows;
  generateGrid(rows);

  console.log(data);
  for (let i = 0; i < cells.length; i++) {
    for (let j = 0; j < cells[0].length; j++) {
      const cellIndex = i * cols + j + 1;

      /*if (j === 0 || j === cells.length) {
        console.log(
          `Mapping grid cell (${i}, ${j}) to data index ${cellIndex}`,
        );
      }*/
      if (cellIndex >= data.length) {
        console.error(
          `Index ${cellIndex} out of bounds for data length ${data.length}.`,
        );
        continue;
      }

      const cellType = data[cellIndex];
      const cell = cells[i][j];

      if (!cell || !cell.htmlRef) {
        console.error(`Cell at (${i}, ${j}) is undefined.`);
        continue;
      }

      cell.htmlRef.classList = "cell"; // Reset cell class

      switch (cellType) {
        case "S":
          cell.isStart = true;
          cell.htmlRef.classList.add("cell-start");
          startCell = cell;
          break;
        case "T":
          cell.isTarget = true;
          cell.htmlRef.classList.add("cell-target");
          targetCell = cell;
          break;
        case "W":
          cell.isWall = true;
          cell.htmlRef.classList.add("cell-wall");
          break;
        case "#":
          cell.weight = 50;
          cell.htmlRef.classList.add("cell-weight");
          break;
        case "0":
          cell.isStart = false;
          cell.isTarget = false;
          cell.isWall = false;
          cell.weight = 1;
          break;
      }
    }
  }
  mazeHasBeenSaved = true;
}
