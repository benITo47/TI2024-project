class GraphVertex {
  constructor(id, x = 0, y = 0) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.isVisited = false;
    this.isStart = false;
    this.isTarget = false;
    this.isPath = false;
  }

  verticeColour() {
    let colour = "#a4fcf8";

    if (this.isVisited) colour = "#81c784";
    if (this.isPath) colour = "#ffd700";
    if (this.isStart) colour = "#007bff";
    if (this.isTarget) colour = "#dc3545";

    return colour;
  }
}

class Graph {
  constructor() {
    this.vertices = new Map();
    this.edges = [];
    this.canvasHeight = 800;
    this.canvasWidth = 800;
  }

  resetVisited() {
    for (let vertex of this.vertices.values()) {
      vertex.isVisited = false;
      vertex.isPath = false;
    }
    for (let edge of this.edges) {
      edge.color = "black";
    }
  }

  addVertex(id, x = 0, y = 0) {
    if (!this.vertices.has(id)) {
      this.vertices.set(id, new GraphVertex(id, x, y));
    } else {
      console.warn(`Vertex ${id} already exists.`);
    }
  }

  addEdge(v, u, weight = 1) {
    const vertexV = this.vertices.get(v);
    const vertexU = this.vertices.get(u);

    if (!vertexV || !vertexU) {
      console.error(
        `Both vertices must exist before adding an edge: ${v}, ${u}`,
      );
      return;
    }

    const existingEdge = this.edges.find(
      (edge) =>
        (edge.v1 === vertexV && edge.v2 === vertexU) ||
        (edge.v1 === vertexU && edge.v2 === vertexV),
    );
    if (existingEdge) {
      existingEdge.weight = weight;
    } else {
      this.edges.push({ v1: vertexV, v2: vertexU, weight, color: "black" });
    }
  }

  getVertices() {
    return Array.from(this.vertices.values());
  }

  getEdges(vertexId) {
    //const vertex = this.vertices.get(vertexId);
    // return vertex ? vertex.edges : [];
  }

  applySpringForces() {
    const springStrength = 0.005;
    for (let { v1, v2, weight } of this.edges) {
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const springLength = 65 + 20 * weight;
      const displacement = distance - springLength;

      const force = springStrength * displacement;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;

      v1.vx += fx;
      v1.vy += fy;
      v2.vx -= fx;
      v2.vy -= fy;
    }
  }

  applyFriction() {
    const friction = 0.85;
    for (let vertex of this.vertices.values()) {
      vertex.vx *= friction;
      vertex.vy *= friction;
    }
  }

  applyRepulsiveForces() {
    const repulsionStrength = 20;
    const vertexList = Array.from(this.vertices.values());

    for (let i = 0; i < vertexList.length; i++) {
      for (let j = i + 1; j < vertexList.length; j++) {
        const vertex1 = vertexList[i];
        const vertex2 = vertexList[j];

        const dx = vertex2.x - vertex1.x;
        const dy = vertex2.y - vertex1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = 40;

        if (distance < minDistance) {
          const overlap = minDistance - distance || 1;
          const force = repulsionStrength / (distance * distance);
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

  updatePositions() {
    for (let vertex of this.vertices.values()) {
      vertex.x += vertex.vx;
      vertex.y += vertex.vy;

      if (vertex.x - 20 <= 0 || vertex.x + 20 >= this.canvasWidth) {
        vertex.vx *= -0.3;
        vertex.x = Math.max(20, Math.min(this.canvasWidth - 20, vertex.x));
      }
      if (vertex.y - 20 <= 0 || vertex.y + 20 >= this.canvasHeight) {
        vertex.vy *= -0.3;
        vertex.y = Math.max(20, Math.min(this.canvasHeight - 20, vertex.y));
      }
    }
  }

  drawEdges(ctx) {
    for (let { v1, v2, color } of this.edges) {
      ctx.beginPath();
      ctx.moveTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  drawVertices(ctx) {
    for (let vertex of this.vertices.values()) {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = vertex.verticeColour();
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "12px Arial";
      ctx.fillText(vertex.id, vertex.x - 5, vertex.y + 4);
    }
  }

  drawGraph(ctx) {
    this.drawEdges(ctx);
    this.drawVertices(ctx);
  }

  animateBFS(startVertex, targetVertex, ctx) {
    if (!startVertex || !targetVertex) {
      console.error("Start or target vertex does not exist.");

      toggleControls(false);
      return;
    }

    this.resetVisited();

    const queue = [];
    const parentMap = new Map();
    let targetFound = false;

    startVertex.isVisited = true;
    startVertex.isStart = true;
    queue.push(startVertex);
    parentMap.set(startVertex, null);

    const step = (currentLevelQueue) => {
      if (currentLevelQueue.length === 0) {
        if (!targetFound) {
          console.warn("Target vertex not found.");
        }

        toggleControls(false);
        return;
      }

      const nextLevelQueue = [];

      currentLevelQueue.forEach((currentVertex) => {
        if (targetFound) return;

        console.log("Processing vertex:", currentVertex.id);

        if (currentVertex === targetVertex) {
          console.log("Target vertex reached:", currentVertex.id);
          targetVertex.isTarget = true;
          targetFound = true;

          const path = [];
          let pathVertex = targetVertex;

          while (pathVertex) {
            path.unshift(pathVertex);
            pathVertex = parentMap.get(pathVertex);
          }

          // Animate the path coloring
          path.forEach((vertex, index) => {
            setTimeout(() => {
              vertex.isPath = true;

              if (index > 0) {
                const prevVertex = path[index - 1];

                const edge = this.edges.find(
                  (e) =>
                    (e.v1 === prevVertex && e.v2 === vertex) ||
                    (e.v1 === vertex && e.v2 === prevVertex),
                );

                if (edge) edge.color = "#ffd700";
              }

              ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
              this.drawGraph(ctx);
            }, index * 200);
          });
          toggleControls(false);
          return;
        }

        this.edges.forEach((edge) => {
          const neighbor =
            edge.v1 === currentVertex
              ? edge.v2
              : edge.v2 === currentVertex
                ? edge.v1
                : null;

          if (neighbor && !neighbor.isVisited) {
            neighbor.isVisited = true;
            edge.color = "#81c784";

            nextLevelQueue.push(neighbor);
            parentMap.set(neighbor, currentVertex);
          }
        });
      });

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawGraph(ctx);

      console.log(
        "Next level queue state:",
        nextLevelQueue.map((v) => v.id),
      );

      if (!targetFound) {
        setTimeout(() => step(nextLevelQueue), 500);
      }
    };

    step([startVertex]);
  }

  animateDFS(startVertex, targetVertex, ctx) {
    if (!startVertex || !targetVertex) {
      console.error("Start or target vertex does not exist.");
      toggleControls(false);
      return;
    }

    this.resetVisited();

    const stack = [];
    const parentMap = new Map();
    let targetFound = false;

    startVertex.isVisited = true;
    startVertex.isStart = true;
    stack.push(startVertex);
    parentMap.set(startVertex, null);

    const step = () => {
      if (stack.length === 0) {
        if (!targetFound) {
          console.warn("Target vertex not found.");
        }
        toggleControls(false);
        return;
      }

      if (targetFound) return;
      const current = stack.pop();

      current.isVisited = true;
      console.log("Processing vertex:", current.id);

      const parent = parentMap.get(current);
      if (parent) {
        const edge = this.edges.find(
          (e) =>
            (e.v1 === current && e.v2 === parent) ||
            (e.v1 === parent && e.v2 === current),
        );
        if (edge) {
          edge.color = "#81c784";
        }
      }

      if (current === targetVertex) {
        console.log("Target vertex reached:", current.id);
        targetVertex.isTarget = true;
        targetFound = true;

        const path = [];
        let pathVertex = targetVertex;

        while (pathVertex) {
          path.unshift(pathVertex);
          pathVertex = parentMap.get(pathVertex);
        }

        path.forEach((vertex, index) => {
          setTimeout(() => {
            vertex.isPath = true;

            if (index > 0) {
              const prevVertex = path[index - 1];

              const edge = this.edges.find(
                (e) =>
                  (e.v1 === prevVertex && e.v2 === vertex) ||
                  (e.v1 === vertex && e.v2 === prevVertex),
              );

              if (edge) edge.color = "#ffd700";
            }

            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.drawGraph(ctx);
          }, index * 200);
        });
        toggleControls(false);
        return;
      }

      this.edges.forEach((edge) => {
        const neighbor =
          edge.v1 === current ? edge.v2 : edge.v2 === current ? edge.v1 : null;

        if (neighbor && !neighbor.isVisited) {
          neighbor.isNext = true;

          stack.push(neighbor);
          parentMap.set(neighbor, current);

          console.log("Visited neighbor:", neighbor.id);
        }
      });

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawGraph(ctx);

      setTimeout(step, 500);
    };

    step();
  }

  animateDijkstra(startVertex, targetVertex, ctx) {
    if (!startVertex || !targetVertex) {
      console.error("Start or target vertex does not exist.");
      toggleControls(false);
      return;
    }

    this.resetVisited();

    // Priority queue and distance map initialization
    const distances = new Map(); // Stores the shortest known distances to each vertex
    const priorityQueue = []; // Priority queue for Dijkstra's algorithm
    const parentMap = new Map(); // To reconstruct the shortest path

    // Initialize distances with infinity and priority queue
    this.vertices.forEach((vertex) => {
      distances.set(vertex, Infinity);
    });

    distances.set(startVertex, 0); // Distance to start vertex is 0
    priorityQueue.push({ vertex: startVertex, distance: 0 }); // Add start vertex to priority queue

    const step = () => {
      if (priorityQueue.length === 0) {
        console.warn("No path found to target vertex.");
        toggleControls(false);
        return;
      }

      // Sort queue by distance and extract the vertex with the smallest distance
      priorityQueue.sort((a, b) => a.distance - b.distance);
      const { vertex: current } = priorityQueue.shift();

      // Skip if already visited
      if (current.isVisited) return;

      // Mark the current vertex as visited
      current.isVisited = true;
      console.log("Processing vertex:", current.id);

      // Mark the edge to the current vertex's parent
      const parent = parentMap.get(current);
      if (parent) {
        const edge = this.edges.find(
          (e) =>
            (e.v1 === current && e.v2 === parent) ||
            (e.v1 === parent && e.v2 === current),
        );
        if (edge) edge.color = "#81c784"; // Green for visited edges
      }

      // If the current vertex is the target
      if (current === targetVertex) {
        console.log("Target vertex reached:", current.id);
        targetVertex.isTarget = true;

        const path = [];
        let pathVertex = targetVertex;

        while (pathVertex) {
          path.unshift(pathVertex);
          pathVertex = parentMap.get(pathVertex);
        }

        // Animate the path coloring
        path.forEach((vertex, index) => {
          setTimeout(() => {
            vertex.isPath = true;

            if (index > 0) {
              const prevVertex = path[index - 1];

              const edge = this.edges.find(
                (e) =>
                  (e.v1 === prevVertex && e.v2 === vertex) ||
                  (e.v1 === vertex && e.v2 === prevVertex),
              );

              if (edge) edge.color = "#ffd700";
            }

            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.drawGraph(ctx);
          }, index * 200);
        });
        toggleControls(false);
        return;
      }

      // Process neighbors
      this.edges.forEach((edge) => {
        const neighbor =
          edge.v1 === current ? edge.v2 : edge.v2 === current ? edge.v1 : null;

        if (neighbor && !neighbor.isVisited) {
          const newDistance = distances.get(current) + edge.weight;

          if (newDistance < distances.get(neighbor)) {
            distances.set(neighbor, newDistance);
            parentMap.set(neighbor, current);

            // Add or update neighbor in priority queue
            const queueEntry = priorityQueue.find(
              (entry) => entry.vertex === neighbor,
            );
            if (queueEntry) {
              queueEntry.distance = newDistance;
            } else {
              priorityQueue.push({ vertex: neighbor, distance: newDistance });
            }
          }
        }
      });

      // Redraw the graph to update visuals after processing the current vertex
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawGraph(ctx);

      // Schedule the next step
      setTimeout(step, 500);
    };

    step();
  }

  animateAStar(startVertex, targetVertex, ctx) {
    if (!startVertex || !targetVertex) {
      console.error("Start or target vertex does not exist.");
      toggleControls(false);
      return;
    }

    this.resetVisited();

    const distances = new Map();
    const heuristics = new Map();
    const priorityQueue = [];
    const parentMap = new Map();

    const heuristic = (v1, v2) => {
      const dx = v2.x - v1.x;
      const dy = v2.y - v1.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    this.vertices.forEach((vertex) => {
      distances.set(vertex, Infinity);
      heuristics.set(vertex, Infinity);
    });

    distances.set(startVertex, 0);
    heuristics.set(startVertex, heuristic(startVertex, targetVertex));
    priorityQueue.push({
      vertex: startVertex,
      cost: heuristics.get(startVertex),
    });

    const step = () => {
      if (priorityQueue.length === 0) {
        console.warn("No path found to target vertex.");
        toggleControls(false);
        return;
      }

      priorityQueue.sort((a, b) => a.cost - b.cost);
      const { vertex: current } = priorityQueue.shift();

      if (current.isVisited) return;

      current.isVisited = true;
      console.log("Processing vertex:", current.id);

      if (current === targetVertex) {
        console.log("Target vertex reached:", current.id);
        targetVertex.isTarget = true;

        const path = [];
        let pathVertex = targetVertex;

        while (pathVertex) {
          path.unshift(pathVertex);
          pathVertex = parentMap.get(pathVertex);
        }

        path.forEach((vertex, index) => {
          setTimeout(() => {
            vertex.isPath = true;

            if (index > 0) {
              const prevVertex = path[index - 1];

              const edge = this.edges.find(
                (e) =>
                  (e.v1 === prevVertex && e.v2 === vertex) ||
                  (e.v1 === vertex && e.v2 === prevVertex),
              );

              if (edge) edge.color = "#ffd700";
            }

            ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.drawGraph(ctx);
          }, index * 200);
        });
        toggleControls(false);
        return;
      }

      this.edges.forEach((edge) => {
        const neighbor =
          edge.v1 === current ? edge.v2 : edge.v2 === current ? edge.v1 : null;

        if (neighbor && !neighbor.isVisited) {
          const tentativeDistance = distances.get(current) + edge.weight;

          if (tentativeDistance < distances.get(neighbor)) {
            distances.set(neighbor, tentativeDistance);
            parentMap.set(neighbor, current);

            const heuristicCost = heuristic(neighbor, targetVertex);
            heuristics.set(neighbor, heuristicCost);

            const totalCost = tentativeDistance + heuristicCost;

            const queueEntry = priorityQueue.find(
              (entry) => entry.vertex === neighbor,
            );
            if (queueEntry) {
              queueEntry.cost = totalCost;
            } else {
              priorityQueue.push({ vertex: neighbor, cost: totalCost });
            }

            edge.color = "#81c784";
          }
        }
      });

      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawGraph(ctx);

      setTimeout(step, 500);
    };

    step();
  }
}
