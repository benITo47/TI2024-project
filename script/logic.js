document.addEventListener("DOMContentLoaded", initializeApp);

// Global Constants
const height = window.innerHeight;
const width = window.innerWidth;

let mazeHasBeenSaved = false;

// Initialize the application

async function initializeApp() {
  try {
    await verifyUserOnLoad();
    initializeMode();
    setupEventListeners();

    const mazeDataString = localStorage.getItem("mazeData");
    if (mazeDataString) {
      const mazeData = JSON.parse(mazeDataString);
      loadMazeFromData(mazeData);
      localStorage.removeItem("mazeData");
    } else {
      generateGrid(selectedGridSize);
    }

    markSelectedGridSize();
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
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
function injectLegend(mode) {
  const legendContainer = document.getElementById("legendContainer");

  legendContainer.innerHTML = "";

  if (mode === "grid") {
    legendContainer.innerHTML = createGridLegend();
  } else if (mode === "graph") {
    legendContainer.innerHTML = createGraphLegend();
  }
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
  document
    .getElementById("loginBtn")
    ?.addEventListener("click", handleLoginBtn);
  document
    .getElementById("registerBtn")
    ?.addEventListener("click", handleRegisterBtn);
  document
    .getElementById("profileBtn")
    ?.addEventListener("click", handleUserBtn);

  document
    .getElementById("logoutBtn")
    ?.addEventListener("click", handleLogoutBtn);

  // Delegate events for dynamically added buttons
  controlsContainer.addEventListener("click", (event) => {
    const { id } = event.target;

    const buttonMapping = {
      generateMazeBtn: () => executeMazeGenerator(),
      clearGridButton: () => clearGrid(),
      clearPathButton: () => clearGrid(true),
      visualizeGridButton: () => visualizeSelectedAlgorithm(),
      generate50x50: () => updateGridSize(50),
      generate25x25: () => updateGridSize(25),
      generate75x75: () => updateGridSize(75),
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
      graph?.resetVisited();
      resetRunningState();
      clearGrid(true);
    }
  });
}

function handleLoginBtn() {
  // Redirect to auth.html for login
  window.location.href = "auth.html?action=login";
}

function handleRegisterBtn() {
  // Redirect to auth.html for registration
  window.location.href = "auth.html?action=register";
}

async function handleUserBtn() {
  const userId = localStorage.getItem("userId");

  window.location.href = `profile.html?user=${userId}`;
}

function handleLogoutBtn() {
  // Redirect to auth.html for logout
  window.location.href = "auth.html?action=logout";
}

function toggleLoginState(isLoggedIn, username = "") {
  const mode = document.getElementById("modeSelect").value;
  console.log("Auth one is being called");

  document.getElementById("loginBtn").style.display = isLoggedIn
    ? "none"
    : "block";
  document.getElementById("registerBtn").style.display = isLoggedIn
    ? "none"
    : "block";
  document.getElementById("logoutBtn").style.display = isLoggedIn
    ? "block"
    : "none";
  document.getElementById("profileBtn").style.display = isLoggedIn
    ? "block"
    : "none";

  if (isLoggedIn) {
    document.getElementById("profileBtn").textContent = `Welcome, ${username}`;
    const saveGridButton = document.getElementById("saveGridButton");
    if (mode === "grid") {
      saveGridButton.style.display = "block";
      saveGridButton.disabled = false;
    } else {
      saveGridButton.style.display = "none";
      saveGridButton.disabled = true;
    }
  } else {
    document.getElementById("profileBtn").textContent = "";
    const saveGridButton = document.getElementById("saveGridButton");
    if (saveGridButton) {
      saveGridButton.style.display = "none";
      saveGridButton.disabled = true;
    }
  }
}

function initializeMode() {
  const mode = document.getElementById("modeSelect").value;
  updateControls(mode);

  injectLegend(mode);
}

function handleModeChange(event) {
  const mode = event.target.value;
  updateControls(mode);

  injectLegend(mode);
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
        <button id="generate25x25">25 x 25 Grid</button>
        <button id="generate50x50">50 x 50 Grid</button>
        <button id="generate75x75">75 x 75 Grid</button>
        <button id="generate100x100">100 x 100 Grid</button>
      </div>
    `;

    generateGrid(selectedGridSize);
    markSelectedGridSize();
  } else if (mode === "graph") {
    controlsContainer.innerHTML = `
      <label for="gridAlgorithmSelect">Select Algorithm:</label>
      <select id="gridAlgorithmSelect" >
        <option value="BFS">Breadth First Search</option>
        <option value="DFS">Depth First Search</option>
        <option value="dijkstra">Dijkstra's Algorithm</option>
        <option value="astar">A* Algorithm</option>
      </select>
      <button id="visualizeGraphBtn">Visualize</button>
    `;

    generateCanvas();
  }

  const username = localStorage.getItem("username");

  if (username) {
    toggleLoginState(true, username);
  } else {
    toggleLoginState(false);
  }

  resetRunningState(); // Reset state when controls change
}

function createGridLegend() {
  const legendHTML = `
    <div id="grid-legend" class="legend">
      <div class="legend-item legend-start">
        <div class="legend-box legend-start-box" title="Drag to move"></div>
        <span>Start Cell</span>
      </div>
      <div class="legend-item legend-target">
        <div class="legend-box legend-target-box" title="Drag to move"></div>
        <span>Target Cell</span>
      </div>
      <div class="legend-item legend-wall">
        <div class="legend-box legend-wall-box" title="Left-click to add, right-click to remove"></div>
        <span>Wall</span>
      </div>
      <div class="legend-item legend-weight">
        <div class="legend-box legend-weight-box" title="Shift + Left-click to add, Shift + Right-click to remove"></div>
        <span>Weighted Cell</span>
      </div>
    </div>
  `;
  return legendHTML;
}

function createGraphLegend() {
  const legendHTML = `
    <div id="graph-legend" class="legend">
      <div class="legend-item">
        <div class="legend-circle legend-vertex" title="Vertex: Drag to move"></div>
        <span>Vertex</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle legend-start-vertex" title="Start Vertex: Shift + Left-click to add, Drag to move"></div>
        <span>Start Vertex</span>
      </div>
      <div class="legend-item">
        <div class="legend-circle legend-target-vertex" title="Target Vertex: Shift + Right-click to add, Drag to move"></div>
        <span>Target Vertex</span>
      </div>
    </div>
  `;
  return legendHTML;
}

function visualizeSelectedAlgorithm() {
  const mode = document.getElementById("modeSelect").value;
  const selectedAlgorithm =
    document.getElementById("gridAlgorithmSelect")?.value ||
    document.getElementById("graphAlgorithmSelect")?.value;

  toggleControls(true);
  if (mode === "grid") {
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
  } else if (mode === "graph") {
    const algorithmMapping = {
      BFS: graph.animateBFS.bind(graph), // Properly bind the graph instance
      DFS: graph.animateDFS?.bind(graph), // Placeholder for other graph algorithms
      dijkstra: graph.animateDijkstra?.bind(graph),
      astar: graph.animateAStar?.bind(graph),
    };

    if (algorithmMapping[selectedAlgorithm]) {
      console.log(`Running ${selectedAlgorithm}...`);
      running = selectedAlgorithm;
      algorithmMapping[selectedAlgorithm](
        startVertex,
        targetVertex,
        document.querySelector("canvas").getContext("2d"),
      );
    } else {
      console.error("Selected algorithm is not implemented or invalid.");
      alert("The selected algorithm is not available.");
      toggleControls(false);
    }
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

    toggleControls(false);
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
    "generate25x25",
    "generate50x50",
    "generate75x75",
    "generate100x100",
    "visualizeGraphBtn",
  ];
  buttons.forEach((id) => toggleButtonState(id, disable));
}
