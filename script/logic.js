// Application Logic

const height =
  document.body.clientHeight ||
  document.documentElement.clientHeight ||
  window.innerHeight;

const width =
  document.body.clientWidth ||
  document.documentElement.clientWidth ||
  window.innerWidth;

document
  .querySelector("#clearGridButton")
  .addEventListener("click", () => clearGrid());
document
  .querySelector("#clearPathButton")
  .addEventListener("click", () => clearGrid(true));

// Handle mode switching between Grid and Graph
const modeSelect = document.getElementById("modeSelect");
const gridControls = document.getElementById("gridControls");
const graphControls = document.getElementById("graphControls");
const workplaceContainer = document.getElementById("workplaceContainer");

modeSelect.addEventListener("change", (e) => {
  if (e.target.value === "grid") {
    gridControls.style.display = "block";
    graphControls.style.display = "none";
    // Call grid generation logic here
    generateGrid();
  } else if (e.target.value === "graph") {
    gridControls.style.display = "none";
    graphControls.style.display = "block";
    // Call canvas generation logic here
    generateCanvas(workplaceContainer);
  }
});

// Initial display based on default mode
if (modeSelect.value === "grid") {
  gridControls.style.display = "block";
  generateGrid();
} else if (modeSelect.value === "graph") {
  graphControls.style.display = "block";
  generateCanvas(workplaceContainer);
}

// Handle login/logout toggle
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

loginBtn.addEventListener("click", () => {
  alert("Login/Register clicked");
  loginBtn.style.display = "none";
  logoutBtn.style.display = "block";
});

logoutBtn.addEventListener("click", () => {
  alert("Logged out");
  loginBtn.style.display = "block";
  logoutBtn.style.display = "none";
});
