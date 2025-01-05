// Application Logic

document.addEventListener("DOMContentLoaded", initializeApp);
const height =
  document.body.clientHeight ||
  document.documentElement.clientHeight ||
  window.innerHeight;

const width =
  document.body.clientWidth ||
  document.documentElement.clientWidth ||
  window.innerWidth;

let running = ""; // Keeps track of the currently running algorithm

// Function to initialize the application
function initializeApp() {
  setupEventListeners(); // Set up all event listeners
  initializeMode(); // Initialize mode-specific UI and logic
}

// Function to set up all event listeners
function setupEventListeners() {
  document
    .querySelector("#clearGridButton")
    .addEventListener("click", () => clearGrid());
  document
    .querySelector("#clearPathButton")
    .addEventListener("click", () => clearGrid(true));

  document
    .querySelector("#visualizeGridButton")
    .addEventListener("click", () => visualizeSelectedAlgorithm());

  const modeSelect = document.getElementById("modeSelect");
  modeSelect.addEventListener("change", handleModeChange);

  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  loginBtn.addEventListener("click", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);
}

function handleLogin() {
  alert("Login/Register clicked");
  document.getElementById("loginBtn").style.display = "none";
  document.getElementById("logoutBtn").style.display = "block";
}

function handleLogout() {
  alert("Logged out");
  document.getElementById("loginBtn").style.display = "block";
  document.getElementById("logoutBtn").style.display = "none";
}

function initializeMode() {
  const modeSelect = document.getElementById("modeSelect");
  if (modeSelect.value === "grid") {
    document.getElementById("gridControls").style.display = "block";
    generateGrid();
  } else if (modeSelect.value === "graph") {
    document.getElementById("graphControls").style.display = "block";
    generateCanvas(document.getElementById("workplaceContainer"));
  }
}

function handleModeChange(event) {
  const mode = event.target.value;
  const gridControls = document.getElementById("gridControls");
  const graphControls = document.getElementById("graphControls");
  const workplaceContainer = document.getElementById("workplaceContainer");

  if (mode === "grid") {
    gridControls.style.display = "block";
    graphControls.style.display = "none";
    generateGrid(); // Call grid generation logic
  } else if (mode === "graph") {
    gridControls.style.display = "none";
    graphControls.style.display = "block";
    generateCanvas(workplaceContainer); // Call canvas generation logic
  }
}
function visualizeSelectedAlgorithm() {
  const selectedAlgorithm = document.getElementById(
    "gridAlgorithmSelect",
  ).value;

  toggleControls(true);

  switch (selectedAlgorithm) {
    case "BFS":
      console.log("Running BFS...");
      running = "BFS";
      executeBFS();
      break;

    case "DFS":
      console.log("Running DFS...");
      running = "DFS";
      executeDFS();
      break;

    case "dijkstra":
      console.log("Running Dijkstra's Algorithm...");
      running = "dijkstra";
      executeDijkstra();
      break;

    case "astar":
      console.log("Running A* Algorithm...");
      running = "astar";
      executeAStar();
      break;

    default:
      console.error("Selected algorithm is not implemented or invalid.");
      alert("The selected algorithm is not available.");
      toggleControls(false);
      return;
  }
}

function visualizeSelectedAlgorithmInRealTime() {
  switch (running) {
    case "BFS":
      BFSinRealTime(cells, startCell, targetCell);
      break;

    case "DFS":
      DFSinRealTime(cells, startCell, targetCell);
      break;

    case "dijkstra":
      executeDijkstra();
      break;

    case "astar":
      executeAStar();
      break;

    default:
      toggleControls(false);
      return;
  }
}

function executeAStar() {
  console.log("Executing A* Algorithm...");
}
