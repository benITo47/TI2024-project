/**
 * Generates a simple placeholder canvas with a circle drawn on it.
 * @param {HTMLElement} container - The DOM element where the canvas should be displayed.
 */
function generateCanvas(container) {
  // Clear any existing content
  container.innerHTML = "";

  // Create a canvas element
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;
  canvas.classList.add("canvas-placeholder");
  container.appendChild(canvas);

  // Get the canvas context and draw a circle
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "lightblue"; // Circle color
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, 2 * Math.PI);
  ctx.fill();
}

// Example usage:
// Assuming there's an element with id 'gridContainer' in the HTML
document.addEventListener("DOMContentLoaded", () => {
  const gridContainer = document.getElementById("workplaceContainer");
  const modeSelect = document.getElementById("modeSelect");

  // Show grid or canvas based on the selected mode
  modeSelect.addEventListener("change", () => {
    if (modeSelect.value === "graph") {
      generateCanvas(gridContainer);
    }
  });

  // Initial display (optional)
  if (modeSelect.value === "graph") {
    generateCanvas(gridContainer);
  }
});
