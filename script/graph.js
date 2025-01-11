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
    let colour = "#a4fcf8"; // Default color for unvisited vertices

    if (this.isVisited) {
      colour = "#81c784"; // Green for visited vertices
    }
    if (this.isPath) {
      colour = "#ffd700"; // Gold for vertices that are part of the found path
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
      this.edges.push({ neighbour, weight, progress: 0 });
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

  // Reset visited status for all edges (if needed)
  resetVisited() {
    for (let vertex of this.vertices.values()) {
      vertex.isVisited = false;
      vertex.isNext = false;
      vertex.isPath = false;

      for (let edge of vertex.edges) {
        edge.progress = 0;
      }
    }
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
    vertexU.addEdge(vertexV, weight);
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

  // Get all vertices in the graph
  getVertices() {
    return Array.from(this.vertices.values());
  }

  // Get edges of a specific vertex
  getEdges(vertexId) {
    const vertex = this.vertices.get(vertexId);
    return vertex ? vertex.edges : [];
  }

  drawEdges(ctx) {
    for (let vertex of this.vertices.values()) {
      for (let edge of vertex.edges) {
        const { neighbour, progress, color = "red" } = edge;

        // Pełna krawędź (np. czarna)
        ctx.beginPath();
        ctx.moveTo(vertex.x, vertex.y);
        ctx.lineTo(neighbour.x, neighbour.y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Progresywna część krawędzi (np. kolorowa)
        if (progress > 0) {
          const dx = neighbour.x - vertex.x;
          const dy = neighbour.y - vertex.y;
          const endX = vertex.x + dx * progress;
          const endY = vertex.y + dy * progress;

          ctx.beginPath();
          ctx.moveTo(vertex.x, vertex.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }
  }

  drawVertices(ctx) {
    for (let vertex of this.vertices.values()) {
      // Wierzchołek
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = vertex.verticeColour(); // Zwraca kolor na podstawie stanu
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();

      // Id wierzchołka
      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(vertex.id, vertex.x - 5, vertex.y + 4);
    }
  }

  drawGraph(ctx) {
    this.drawEdges(ctx); // Rysuje krawędzie
    this.drawVertices(ctx); // Rysuje wierzchołki
  }

  animateBFS(startV, targetV, ctx) {
    // Ensure start and target vertices exist

    if (!startV || !targetV) {
      console.error("Start or target vertex does not exist.");
      return;
    }

    // Reset visited status and path flags before starting BFS
    this.resetVisited();

    // BFS setup
    const queue = []; // Queue for BFS traversal
    const parentMap = new Map(); // To track the path

    // Mark start vertex
    startV.isVisited = true;
    startV.isStart = true;
    queue.push(startV);
    parentMap.set(startV, null);

    while (queue) {
      const current = queue.shift(); // Dequeue the first vertex

      // If we reach the target, reconstruct the path and mark it
      if (current === targetV) {
        targetV.isTarget = true;

        // Reconstruct the path using parentMap
        let pathVertex = targetV;
        while (pathVertex) {
          console.log("Marking path vertex:", pathVertex.id);
          pathVertex.isPath = true;
          pathVertex = parentMap.get(pathVertex);
        }
        return; // Exit after finding the target
      }

      // Visit neighbors
      for (let edge of current.edges) {
        const neighbor = edge.neighbour;
        if (!neighbor.isVisited) {
          neighbor.isVisited = true;
          queue.push(neighbor);
          parentMap.set(neighbor, current);
          console.log("Visited neighbor:", neighbor.id, "Pushed to queue.");
        }
      }

      console.log(
        "Current queue state:",
        queue.map((v) => v.id),
      );
    }

    console.warn("Target vertex not found.");
  }
}
