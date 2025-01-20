# Search Algorithms Visualizer

Welcome to the **Search Algorithms Visualizer** project! This project was developed as part of the *Techniki Internetowe* course and provides a dynamic way to visualize various search algorithms on two different structures: a **2D matrix (grid)** and a **graph**.

## Features

- **Supported Algorithms:**
  - Breadth-First Search (BFS)
  - Depth-First Search (DFS)
  - Dijkstra's Algorithm
  - A* Search (A-star)

- **Visualization Modes:**
  - **Grid View:** A 2D matrix where nodes are connected in a grid-like structure. Walls, weights, start, and target nodes can be configured.
  - **Graph View:** A generic graph with nodes and edges where search algorithms are applied dynamically.

## Getting Started

If you'd like to enable the option for saving mazes, you'll need to set up the backend. However, the visualizer will work just fine without it.

### Prerequisites

- **Node.js:** Ensure you have Node.js installed to run the backend.
- **npm/yarn:** A package manager to install backend dependencies.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/benITo47/TI2024-project.git
   cd TI2024-project
   ```

2. Navigate to the backend folder:
   ```bash
   cd api
   ```

3. Install backend dependencies:
   ```bash
   npm install
   ```

4. Start the backend server:
   ```bash
   node backend.js
   ```

5. Open the static frontend:
   - Open the `index.html` file directly in your browser.

## Usage

1. Choose the visualization mode: **Grid** or **Graph**.
2. Select the algorithm you want to visualize (BFS, DFS, Dijkstra, or A*).
3. Configure the grid or graph:
   - For the grid:
     - Set the start and target nodes.
     - Add walls or weighted nodes as needed.
   - For the graph:
     - Select start and target nodes.
4. Run the algorithm and watch the visualization in action.

## Technologies Used

- **Frontend:** HTML, CSS, and JavaScript
- **Backend:** Node.js
- **Visualization:** HTML Canvas

## Screenshots

### Grid Visualization
![image](https://github.com/user-attachments/assets/824e5c8c-4cce-47a5-ae3f-428a36439883)


### Graph Visualization
![image](https://github.com/user-attachments/assets/fcc504c1-cb42-4040-88f2-866b88d35261)


## Contributing

Contributions are welcome! If you'd like to improve the project or add new features, feel free to fork the repository and submit a pull request.


## Acknowledgments

- Course: *Techniki Internetowe*
- Algorithms and visualization concepts inspired by various online resources and educational materials.


