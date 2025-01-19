document.addEventListener("DOMContentLoaded", async () => {
  const userInfoContainer = document.getElementById("userInfoContainer");
  const userMazesContainer = document.getElementById("userMazesContainer");

  const getUserIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("user"); // Gets the value of the 'user' parameter
  };

  try {
    const fetchId = getUserIdFromUrl();
    const userInfo = await fetchUserInfo(fetchId);
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
    const userMazes = await fetchUserMazes(fetchId);
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
          await deleteMaze(mazeId);
        });
      });

      // Bind load functionality to buttons
      const loadButtons = document.querySelectorAll(".load-maze-btn");
      loadButtons.forEach((button) => {
        button.addEventListener("click", async (e) => {
          const mazeId = e.target.getAttribute("data-maze-id");
          try {
            await fetchMaze(mazeId);
          } catch (error) {}
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
