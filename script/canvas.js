let isDragging = false;
let draggedVertex = null;

let graph;
let startVertix = null;
let targetVertix = null;

function generateCanvas() {
  const container = document.querySelector("#workplaceContainer");
  container.innerHTML = "";
  const canvas = createCanvas(800, 800);
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const graph = createGraph();

  // Set up mouse event listeners
  setupMouseEvents(canvas);

  // Start animation loop
  animate(canvas, ctx);
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.classList.add("canvas-placeholder");
  return canvas;
}

function createGraph() {
  graph = new Graph();

  // Add vertices
  graph.addVertex("A", 100, 100);
  graph.addVertex("B", 200, 200);
  graph.addVertex("C", 300, 100);
  graph.addVertex("D", 300, 200);
  graph.addVertex("E", 500, 200);
  graph.addVertex("F", 600, 200);
  graph.addVertex("G", 800, 100);
  graph.addVertex("H", 700, 300);
  graph.addVertex("I", 900, 300);
  graph.addVertex("J", 100, 300);
  graph.addVertex("K", 110, 200);
  graph.addVertex("L", 120, 100);
  graph.addVertex("M", 120, 300);
  graph.addVertex("N", 130, 200);
  graph.addVertex("O", 130, 100);
  graph.addVertex("P", 150, 100);
  graph.addVertex("Q", 140, 200);
  graph.addVertex("R", 140, 300);
  graph.addVertex("S", 160, 200);

  // Add edges
  graph.addEdge("A", "B", 4);
  graph.addEdge("B", "C", 7);
  graph.addEdge("B", "D", 6);
  graph.addEdge("B", "F", 10);
  graph.addEdge("C", "D", 2);
  graph.addEdge("C", "H", 10);
  graph.addEdge("D", "F", 10);
  graph.addEdge("D", "G", 2);
  graph.addEdge("E", "F", 10);
  graph.addEdge("E", "J", 10);
  graph.addEdge("F", "G", 1);
  graph.addEdge("F", "J", 8);
  graph.addEdge("G", "I", 1);
  graph.addEdge("H", "K", 1);
  graph.addEdge("I", "J", 8);
  graph.addEdge("I", "L", 10);
  graph.addEdge("J", "L", 1);
  graph.addEdge("J", "M", 4);
  graph.addEdge("K", "L", 3);
  graph.addEdge("L", "M", 10);
  graph.addEdge("L", "N", 10);
  graph.addEdge("M", "N", 3);
  graph.addEdge("N", "Q", 10);
  graph.addEdge("O", "P", 7);
  graph.addEdge("O", "Q", 5);
  graph.addEdge("O", "R", 9);
  graph.addEdge("P", "Q", 8);
  graph.addEdge("P", "S", 4);
  graph.addEdge("Q", "S", 2);
  graph.addEdge("R", "S", 5);
}

function setupMouseEvents(canvas) {
  // Mouse down event
  canvas.addEventListener("mousedown", (e) => {
    if (isMouseInsideCanvas(e, canvas)) {
      canvasMouseDownHandler(e);
    }
  });

  // Mouse move event
  canvas.addEventListener("mousemove", (e) => {
    if (isDragging && draggedVertex) {
      canvasMouseMoveHandler(e);
    }
  });

  // Mouse up event on the window to capture it even when outside the canvas
  window.addEventListener("mouseup", () => {
    canvasMouseUpHandler();
  });
}

function isMouseInsideCanvas(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  );
}

function canvasMouseDownHandler(e) {
  e.preventDefault();
  const canvas = e.target;
  const mousePosition = getMousePositionCanvas(e, canvas);

  // Check if a vertex is clicked
  draggedVertex = getVertexAtPosition(mousePosition);
  if (draggedVertex) {
    isDragging = true;
  }
}

function canvasMouseMoveHandler(e) {
  if (isDragging && draggedVertex) {
    const canvas = e.target;
    const mousePosition = getMousePositionCanvas(e, canvas);
    draggedVertex.x = mousePosition.x;
    draggedVertex.y = mousePosition.y;

    // Redraw the graph
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    graph.drawGraph(canvas.getContext("2d"));
  }
}

function canvasMouseUpHandler() {
  isDragging = false;
  draggedVertex = null;
}

function getMousePositionCanvas(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function getVertexAtPosition(mousePosition) {
  for (let vertex of graph.getVertices()) {
    const dx = mousePosition.x - vertex.x;
    const dy = mousePosition.y - vertex.y;
    if (Math.sqrt(dx * dx + dy * dy) <= 20) {
      return vertex;
    }
  }
  return null;
}

function animate(canvas, ctx) {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (graph) {
      graph.applySpringForces();
      graph.applyRepulsiveForces();
      graph.applyFriction();
      graph.updatePositions();
      graph.drawGraph(ctx);
    }
    requestAnimationFrame(() => animate(canvas, ctx));
  } catch (err) {
    console.error("Error in animation loop:", err);
  }
}
