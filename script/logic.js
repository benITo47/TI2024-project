document.addEventListener("DOMContentLoaded", initializeApp);

// Global Constants
const height = window.innerHeight;
const width = window.innerWidth;
let running = ""; // Keeps track of the currently running algorithm
let isAnimating = false;
let selectedGridSize = 70; // Default grid size

// Initialize the application
function initializeApp() {
  setupEventListeners();
  initializeMode();
  markSelectedGridSize();
  generateGrid(selectedGridSize);
}

// Utility: Toggle Button Disabled State
function toggleButtonState(buttonId, state) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = state;
    button.style.opacity = state ? "0.5" : "1"; // Grayed out when disabled
    button.style.pointerEvents = state ? "none" : "auto"; // Prevent interactions
  }
}

// Utility: Mark selected grid size button
function markSelectedGridSize() {
  const gridSizeButtons = ["generate50x50", "generate70x70", "generate100x100"];
  gridSizeButtons.forEach((id) => {
    const button = document.getElementById(id);
    if (button) {
      button.classList.toggle(
        "active",
        id === `generate${selectedGridSize}x${selectedGridSize}`,
      );
    }
  });
}

// Set up all event listeners
function setupEventListeners() {
  const controlsContainer = document.getElementById("controlsContainer");

  // Handle mode changes
  const modeSelect = document.getElementById("modeSelect");
  if (modeSelect) {
    modeSelect.addEventListener("change", handleModeChange);
  }

  // Handle login/logout
  document.getElementById("loginBtn")?.addEventListener("click", handleLogin);
  document.getElementById("logoutBtn")?.addEventListener("click", handleLogout);

  // Delegate events for dynamically added buttons
  controlsContainer.addEventListener("click", (event) => {
    const { id } = event.target;

    const buttonMapping = {
      generateMazeBtn: () => executeMazeGenerator(),
      clearGridButton: () => clearGrid(),
      clearPathButton: () => clearGrid(true),
      visualizeGridButton: () => visualizeSelectedAlgorithm(),
      generate50x50: () => updateGridSize(50),
      generate70x70: () => updateGridSize(70),
      generate100x100: () => updateGridSize(100),
      visualizeGraphBtn: () => visualizeSelectedAlgorithm(),
    };

    if (buttonMapping[id]) {
      buttonMapping[id]();
    }
  });

  // Listen for changes in algorithm selection
  controlsContainer.addEventListener("change", (event) => {
    if (
      event.target.id === "gridAlgorithmSelect" ||
      event.target.id === "graphAlgorithmSelect"
    ) {
      resetRunningState();
      clearGrid(true);
    }
  });
}

// Update the selected grid size
function updateGridSize(size) {
  selectedGridSize = size;
  generateGrid(size);
  resetRunningState();
  markSelectedGridSize();
}

// Reset running state
function resetRunningState() {
  running = "";
  console.log("Running state reset.");
}

// Login/Logout handlers
function handleLogin() {
  alert("Login/Register clicked");
  toggleLoginState(true);
}

function handleLogout() {
  alert("Logged out");
  toggleLoginState(false);
}

function toggleLoginState(isLoggedIn) {
  document.getElementById("loginBtn").style.display = isLoggedIn
    ? "none"
    : "block";
  document.getElementById("logoutBtn").style.display = isLoggedIn
    ? "block"
    : "none";
}

function initializeMode() {
  const mode = document.getElementById("modeSelect").value;
  updateControls(mode);
  updateWorkingConrainer(mode);
}

function handleModeChange(event) {
  const mode = event.target.value;
  updateControls(mode);
}

function updateControls(mode) {
  const controlsContainer = document.getElementById("controlsContainer");
  controlsContainer.innerHTML = ""; // Clear existing controls

  if (mode === "grid") {
    controlsContainer.innerHTML = `
      <label for="gridAlgorithmSelect">Select Algorithm:</label>
      <select id="gridAlgorithmSelect">
        <option value="BFS">Breadth First Search</option>
        <option value="DFS">Depth First Search</option>
        <option value="dijkstra">Dijkstra's Algorithm</option>
        <option value="astar">A* Algorithm</option>
      </select>
      <button id="generateMazeBtn">Generate Maze</button>
      <button id="clearGridButton">Clear Grid</button>
      <button id="clearPathButton">Clear Path</button>
      <button id="visualizeGridButton">Visualize</button>
      <div class="grid-size-buttons">
        <button id="generate50x50">50 x 50 Grid</button>
        <button id="generate70x70">70 x 70 Grid</button>
        <button id="generate100x100">100 x 100 Grid</button>
      </div>
    `;

    markSelectedGridSize(); // Update grid size indicator
  } else if (mode === "graph") {
    controlsContainer.innerHTML = `
      <label for="graphAlgorithmSelect">Select Algorithm:</label>
      <select id="graphAlgorithmSelect">
        <option value="astar">A* Algorithm</option>
        <option value="dijkstra">Dijkstra's Algorithm</option>
      </select>
      <button id="visualizeGraphBtn">Visualize</button>
    `;
  }

  // Reattach event listeners for the new controls
  resetRunningState(); // Reset state when controls change
}

function updateWorkingConrainer(mode) {}
// Visualize the selected algorithm

function visualizeSelectedAlgorithm() {
  const selectedAlgorithm =
    document.getElementById("gridAlgorithmSelect")?.value ||
    document.getElementById("graphAlgorithmSelect")?.value;

  toggleControls(true);

  const algorithmMapping = {
    BFS: executeBFS,
    DFS: executeDFS,
    dijkstra: executeDijkstra,
    astar: executeAStar,
  };

  if (algorithmMapping[selectedAlgorithm]) {
    console.log(`Running ${selectedAlgorithm}...`);
    running = selectedAlgorithm;
    algorithmMapping[selectedAlgorithm]();
  } else {
    console.error("Selected algorithm is not implemented or invalid.");
    alert("The selected algorithm is not available.");
    toggleControls(false);
  }
}

function visualizeSelectedAlgorithmInRealTime() {
  const selectedAlgorithm =
    document.getElementById("gridAlgorithmSelect")?.value ||
    document.getElementById("graphAlgorithmSelect")?.value;

  const algorithmMapping = {
    BFS: BFSinRealTime,
    DFS: DFSinRealTime,
    dijkstra: DijkstraInRealTime,
    astar: AStarInRealTime,
  };

  if (algorithmMapping[selectedAlgorithm]) {
    console.log(`Running ${selectedAlgorithm}...`);
    running = selectedAlgorithm;
    algorithmMapping[selectedAlgorithm](cells, startCell, targetCell);
  } else {
    console.error("Selected algorithm is not implemented or invalid.");
    alert("The selected algorithm is not available.");
    toggleControls(false);
  }
}

// Toggle control buttons' disabled state
function toggleControls(disable) {
  const buttons = [
    "generateMazeBtn",
    "clearGridButton",
    "clearPathButton",
    "visualizeGridButton",
    "generate50x50",
    "generate70x70",
    "generate100x100",
    "visualizeGraphBtn",
  ];
  buttons.forEach((id) => toggleButtonState(id, disable));
}
