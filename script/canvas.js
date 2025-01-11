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

function createGraph(
  dimensions = { width: 800, height: 800 },
  rows = 5,
  cols = 5,
  weightRange = [1, 10],
) {
  graph = new Graph();
  const { width, height } = dimensions;
  const vertices = [];
  const spacingX = width / (cols + 1);
  const spacingY = height / (rows + 1);

  // Generate vertices in a grid layout
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const x = Math.round((j + 1) * spacingX);
      const y = Math.round((i + 1) * spacingY);
      const id = String.fromCharCode(65 + vertices.length); // A, B, C, etc.
      graph.addVertex(id, x, y);
      vertices.push(id);
    }
  }

  // Generate edges with logical density
  vertices.forEach((v, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    // Add edges to right and bottom neighbors
    if (col < cols - 1) {
      const rightNeighbor = vertices[index + 1];
      const weight =
        Math.floor(Math.random() * (weightRange[1] - weightRange[0] + 1)) +
        weightRange[0];
      graph.addEdge(v, rightNeighbor, weight);
    }

    if (row < rows - 1) {
      const bottomNeighbor = vertices[index + cols];
      const weight =
        Math.floor(Math.random() * (weightRange[1] - weightRange[0] + 1)) +
        weightRange[0];
      graph.addEdge(v, bottomNeighbor, weight);
    }
  });

  // Optional: Add sparse cross-connections for complexity
  const additionalEdges = Math.floor(vertices.length * 0.2); // 20% additional edges
  for (let i = 0; i < additionalEdges; i++) {
    const v1 = vertices[Math.floor(Math.random() * vertices.length)];
    const v2 = vertices[Math.floor(Math.random() * vertices.length)];
    if (
      v1 !== v2 &&
      !graph.edges.some(
        (e) =>
          (e.v1.id === v1 && e.v2.id === v2) ||
          (e.v1.id === v2 && e.v2.id === v1),
      )
    ) {
      const weight =
        Math.floor(Math.random() * (weightRange[1] - weightRange[0] + 1)) +
        weightRange[0];
      graph.addEdge(v1, v2, weight);
    }
  }
  return graph;
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
      startVertex = clickedVertex;
      startVertex.isStart = true;
      startVertex.isTarget = false;
      graph.resetVisited();
    } else if (e.shiftKey && e.button === 2) {
      if (targetVertex) {
        targetVertex.isTarget = false;
      }

      graph.resetVisited();
      targetVertex = clickedVertex;
      targetVertex.isTarget = true;
      targetVertex.isStart = false;
    } else {
      isDragging = true;
      draggedVertex = clickedVertex;
      /* let gr = graph.getVertices();
      for (let vertex of gr) {
        console.log(vertex.id, vertex.x, vertex.y);
      }*/
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
