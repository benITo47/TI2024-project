let isDragging = false;
let draggedVertex = null;

let graph;
let startVertex = null;
let targetVertex = null;

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

  // Add edges
  graph.addEdge("A", "B", 6);
  graph.addEdge("B", "C", 6);
  graph.addEdge("B", "D", 6);
  graph.addEdge("B", "F", 6);
  graph.addEdge("C", "D", 6);
  graph.addEdge("C", "H", 6);
  graph.addEdge("D", "F", 6);
  graph.addEdge("D", "G", 6);
  graph.addEdge("E", "F", 6);
  graph.addEdge("F", "G", 6);
  graph.addEdge("G", "I", 6);
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

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

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
  const clickedVertex = getVertexAtPosition(mousePosition);
  if (clickedVertex) {
    if (e.shiftKey && e.button === 0) {
      if (startVertex) {
        startVertex.isStart = false;
      }
      graph.resetVisited();
      startVertex = clickedVertex;
      startVertex.isStart = true;
    } else if (e.shiftKey && e.button === 2) {
      if (targetVertex) {
        targetVertex.isTarget = false;
      }

      graph.resetVisited();
      targetVertex = clickedVertex;
      targetVertex.isTarget = true;
    } else {
      isDragging = true;
      draggedVertex = clickedVertex;
    }
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
