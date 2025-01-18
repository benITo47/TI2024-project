document.addEventListener("DOMContentLoaded", async () => {
  const userInfoContainer = document.getElementById("userInfoContainer");
  const userMazesContainer = document.getElementById("userMazesContainer");

  try {
    // Fetch and display user info
    const userInfo = await fetchUserInfo();
    if (userInfo) {
      userInfoContainer.innerHTML = `
        <div class="profile-info">
          <p><strong>Username:</strong> ${userInfo.username}</p>
          <p><strong>Email:</strong> ${userInfo.email}</p>
        </div>
      `;
    } else {
      userInfoContainer.innerHTML = `<p>Failed to load user info.</p>`;
    }

    // Fetch and display user mazes
    const userMazes = await fetchUserMazes();
    if (userMazes.length > 0) {
      userMazesContainer.innerHTML = userMazes
        .map(
          (maze) => `
          <div class="maze-item">
            <p><strong>Name:</strong> ${maze.maze_name}</p>
            <p><strong>Size:</strong> ${maze.rows}x${maze.cols}</p>
            <p><strong>Created at:</strong> ${new Date(maze.created_at).toLocaleString()}</p>
            <button class="load-maze-btn" data-maze-id="${maze.maze_id}">Load Maze</button>
            <button class="delete-maze-btn" data-maze-id="${maze.maze_id}">Delete Maze</button>
          </div>
        `,
        )
        .join("");

      // Bind delete functionality to buttons
      const deleteButtons = document.querySelectorAll(".delete-maze-btn");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          const mazeId = e.target.getAttribute("data-maze-id");
          console.log(
            `Dummy delete function called for maze with ID: ${mazeId}`,
          );
          alert("Dummy delete: Maze deletion simulated!");
        });
      });

      // Bind load functionality to buttons
      const loadButtons = document.querySelectorAll(".load-maze-btn");
      loadButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          const mazeId = e.target.getAttribute("data-maze-id");
          console.log(`Dummy load function called for maze with ID: ${mazeId}`);
          alert("Dummy load: Maze loading simulated!");
        });
      });
    } else {
      userMazesContainer.innerHTML = `<p>No mazes found.</p>`;
    }
  } catch (error) {
    console.error("Error loading profile data:", error);
    userInfoContainer.innerHTML = `<p>An error occurred. Please try again.</p>`;
    userMazesContainer.innerHTML = `<p>An error occurred. Please try again.</p>`;
  }
});

// Dummy function to simulate maze deletion
async function deleteMaze(mazeId) {
  console.log(`Deleting maze with ID: ${mazeId}`);
  alert("Maze deleted (dummy function).");
}

// Dummy function to simulate loading a maze
async function loadMaze(mazeId) {
  console.log(`Loading maze with ID: ${mazeId}`);
  alert("Maze loaded (dummy function).");
}
