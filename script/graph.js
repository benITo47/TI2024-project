class GraphVertex {
  constructor(id, x = 0, y = 0) {
    this.id = id; // Unique identifier for the vertex
    this.x = x; // X-coordinate for canvas rendering
    this.y = y; // Y-coordinate for canvas rendering
    this.edges = []; // List of edges connected to this vertex
    this.vx = 0; // Velocity in x-direction
    this.vy = 0; // Velocity in y-direction
    this.isVisited = false;
    this.isStart = false;
    this.isTarget = false;
    this.isPath = false;
    this.isNext = false;
  }

  verticeColour() {
    let colour = "#25c1fa"; // Default color for unvisited vertices

    if (this.isVisited) {
      colour = "#81c784"; // Green for visited vertices
    }
    if (this.isPath) {
      colour = "#ffd700"; // Gold for vertices that are part of the found path
    }
    if (this.isNext) {
      colour = "#ffa500"; // Orange for vertices in the queue or being considered next
    }
    if (this.isStart) {
      colour = "#007bff"; // Blue for the start vertex
    }
    if (this.isTarget) {
      colour = "#dc3545"; // Red for the target vertex
    }

    return colour;
  }

  addEdge(neighbour, weight = 1) {
    const existingEdge = this.edges.find(
      (edge) => edge.neighbour === neighbour,
    );
    if (existingEdge) {
      existingEdge.weight = weight; // Update weight if edge exists
    } else {
      this.edges.push({ neighbour, weight });
    }
  }
}

class Graph {
  constructor() {
    this.vertices = new Map(); // Store vertices by their id
    this.hasMoved = false; // Flag to track if any vertex has moved
    this.canvasHeight = 800;
    this.canvasWidth = 800;
  }

  // Add a vertex to the graph
  addVertex(id, x = 0, y = 0) {
    if (!this.vertices.has(id)) {
      this.vertices.set(id, new GraphVertex(id, x, y));
    } else {
      console.warn(`Vertex ${id} already exists.`);
    }
  }

  // Add an edge to the graph
  addEdge(v, u, weight = 1) {
    const vertexV = this.vertices.get(v);
    const vertexU = this.vertices.get(u);

    if (!vertexV || !vertexU) {
      console.error(
        `Both vertices must exist before adding an edge: ${v}, ${u}`,
      );
      return;
    }

    vertexV.addEdge(vertexU, weight);
    vertexU.addEdge(vertexV, weight); // For undirected graph
  }

  // Apply spring forces (with edge weight consideration)
  applySpringForces() {
    const springStrength = 0.005; // Spring force strength

    for (let vertex of this.vertices.values()) {
      for (let edge of vertex.edges) {
        const dx = edge.neighbour.x - vertex.x;
        const dy = edge.neighbour.y - vertex.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate ideal spring length based on edge weight
        const springLength = 65 + 20 * edge.weight; // Smaller weight = shorter distance
        const displacement = distance - springLength;

        const force = springStrength * displacement;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;

        vertex.vx += fx;
        vertex.vy += fy;
        edge.neighbour.vx -= fx;
        edge.neighbour.vy -= fy;
      }
    }
  }

  // Apply friction to simulate damping
  applyFriction() {
    const friction = 0.85;
    for (let vertex of this.vertices.values()) {
      vertex.vx *= friction;
      vertex.vy *= friction;
    }
  }

  // Apply repulsive forces to prevent vertex overlap
  applyRepulsiveForces() {
    const repulsionStrength = 20; // Adjust based on desired repulsion force

    for (let vertex1 of this.vertices.values()) {
      for (let vertex2 of this.vertices.values()) {
        if (vertex1 === vertex2) continue; // Skip self-collision

        const dx = vertex2.x - vertex1.x;
        const dy = vertex2.y - vertex1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 40; // Radius * 2 (since vertices have radius 20)

        if (distance < minDistance) {
          const overlap = minDistance - distance || 1; // Avoid division by zero
          const force = repulsionStrength / (distance * distance); // Repulsion inversely proportional to distance^2
          const fx = (dx / distance) * force * overlap;
          const fy = (dy / distance) * force * overlap;

          vertex1.vx -= fx;
          vertex1.vy -= fy;
          vertex2.vx += fx;
          vertex2.vy += fy;
        }
      }
    }
  }

  // Update the positions of the vertices

  updatePositions() {
    this.hasMoved = false;

    for (let vertex of this.vertices.values()) {
      if (Math.abs(vertex.vx) > 0.01 || Math.abs(vertex.vy) > 0.01) {
        this.hasMoved = true;
      }
      vertex.x += vertex.vx;
      vertex.y += vertex.vy;

      // Handle collisions with canvas boundaries
      if (vertex.x - 20 <= 0 || vertex.x + 20 >= this.canvasWidth) {
        vertex.vx *= -0.3; // Reverse direction with damping
        vertex.x = Math.max(20, Math.min(this.canvasWidth - 20, vertex.x));
      }
      if (vertex.y - 20 <= 0 || vertex.y + 20 >= this.canvasHeight) {
        vertex.vy *= -0.3; // Reverse direction with damping
        vertex.y = Math.max(20, Math.min(this.canvasHeight - 20, vertex.y));
      }
    }
  }

  // Draw the graph to the canvas
  drawGraph(ctx) {
    this.canvasWidth = ctx.canvas.width;
    this.canvasHeight = ctx.canvas.height;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw edges
    for (let vertex of this.vertices.values()) {
      for (let edge of vertex.edges) {
        ctx.beginPath();
        ctx.moveTo(vertex.x, vertex.y);
        ctx.lineTo(edge.neighbour.x, edge.neighbour.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Draw vertices
    for (let vertex of this.vertices.values()) {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = vertex.verticeColour();
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();

      // Draw vertex id
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(vertex.id, vertex.x - 5, vertex.y + 4);
    }
  }

  // Reset visited status for all edges (if needed)
  resetVisited() {
    for (let vertex of this.vertices.values()) {
      vertex.edges = vertex.edges.map((edge) => ({ ...edge, visited: false }));
    }
  }

  // Get all vertices in the graph
  getVertices() {
    return Array.from(this.vertices.values());
  }

  // Get edges of a specific vertex
  getEdges(vertexId) {
    const vertex = this.vertices.get(vertexId);
    return vertex ? vertex.edges : [];
  }

  // Method for positioning vertices in a more organized way (optional grid-based approach)
  positionVerticesInGrid() {
    const cols = 5;
    let row = 1;
    let col = 1;
    const spacing = 125; // Space between vertices
    for (let vertex of this.vertices.values()) {
      vertex.x = col * spacing;
      vertex.y = row * spacing;
      col++;
      if (col >= cols) {
        col = 0;
        row++;
      }
    }
  }
}
