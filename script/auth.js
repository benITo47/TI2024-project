async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;

  console.log("Fetching with auth:", url); // Debug log

  let response = await fetch(url, options);

  if (response.status === 401) {
    console.log("Access token expired. Attempting to refresh...");
    const newAccessToken = await refreshAccessToken();

    if (newAccessToken) {
      options.headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    }
  }

  return response;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    console.error("No refresh token available. Cannot refresh access token.");
    clearLocalStorage();
    return null;
  }

  try {
    const response = await fetch("http://localhost:4000/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();
    if (response.ok) {
      saveTokens(result); // Save the new tokens
      return result.accessToken;
    } else {
      console.error("Failed to refresh tokens:", result.message);
      clearLocalStorage();
    }
  } catch (error) {
    console.error("Error refreshing tokens:", error);
    clearLocalStorage();
  }
  return null;
}

function saveTokens({ accessToken, refreshToken, userId, username }) {
  console.log("Saving tokens:", {
    accessToken,
    refreshToken,
    userId,
    username,
  });
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("userId", userId);
  localStorage.setItem("username", username);
}

function clearLocalStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
}

async function verifyUserOnLoad() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    console.log("No valid tokens found. User is not authenticated.");
    toggleLoginState(false);
    return;
  }

  console.log("Verifying user with token:", accessToken);

  try {
    const response = await fetchWithAuth(
      "http://localhost:4000/api/verify-token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (response.ok) {
      const { userId, username } = await response.json();
      console.log(`User authenticated: ${username} (ID: ${userId})`);
      toggleLoginState(true, username);
    } else {
      console.log("Authentication failed. Clearing tokens.");
      clearLocalStorage();
      toggleLoginState(false);
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    clearLocalStorage();
    toggleLoginState(false);
  }
}

async function fetchUserInfo() {
  const userId = localStorage.getItem("userId");
  const url = `http://localhost:4000/api/user/${userId}`;

  try {
    const response = await fetchWithAuth(url);
    if (response.ok) {
      const userData = await response.json();
      return userData;
    } else {
      console.error("Failed to fetch user info:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
  }
  return null;
}

async function fetchUserMazes() {
  const userId = localStorage.getItem("userId");
  const url = `http://localhost:4000/api/mazes/${userId}`;

  try {
    const response = await fetchWithAuth(url);
    if (response.ok) {
      const mazes = await response.json();
      return mazes;
    } else {
      console.error("Failed to fetch user mazes:", await response.text());
    }
  } catch (error) {
    console.error("Error fetching user mazes:", error);
  }
  return [];
}

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  if (isAuthPage()) {
    initializeFormVisibility(action);

    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin);
    }

    if (registerForm) {
      registerForm.addEventListener("submit", handleRegister);
    }

    if (action === "logout") {
      handleLogout();
    }
  } else {
    document
      .getElementById("saveGridButton")
      ?.addEventListener("click", saveGrid);
  }
  function isAuthPage() {
    return window.location.pathname.includes("auth.html");
  }

  function initializeFormVisibility(action) {
    if (action === "login") {
      toggleForms(loginForm, registerForm);
    } else if (action === "register") {
      toggleForms(registerForm, loginForm);
    } else if (action === "logout") {
      handleLogout();
    } else {
      authMessage.textContent =
        "Invalid action. Please select login, register, or logout.";
    }
  }

  function toggleForms(showForm, hideForm) {
    if (showForm) showForm.style.display = "block";
    if (hideForm) hideForm.style.display = "none";
  }

  async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        saveTokens(result);
        authMessage.textContent = "Login successful!";
        returnToPreviousPage();
      } else {
        authMessage.textContent = result.message;
      }
    } catch (error) {
      console.error("Login failed:", error);
      authMessage.textContent = "An error occurred. Please try again.";
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById("registerUsername").value;
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
      const response = await fetch("http://localhost:4000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      if (response.ok) {
        authMessage.textContent =
          "Registration successful! You can now log in.";
        returnToPreviousPage();
      } else {
        authMessage.textContent = result.message;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      authMessage.textContent = "An error occurred. Please try again.";
    }
  }

  async function handleLogout() {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      authMessage.textContent = "You are already logged out.";
      returnToPreviousPage();
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        clearLocalStorage();
        authMessage.textContent = "Logged out successfully.";
        returnToPreviousPage();
      } else {
        const result = await response.json();
        authMessage.textContent = result.message;
      }
    } catch (error) {
      console.error("Logout failed:", error);
      authMessage.textContent =
        "An error occurred while logging out. Please try again.";
    }
  }

  async function saveGrid() {
    if (!mazeHasBeenSaved) {
      let encodedGrid = cells
        .map((row) =>
          row
            .map((cell) => {
              if (cell.isStart) return "S";
              if (cell.isTarget) return "T";
              if (cell.isWall) return "W";
              if (cell.weight > 1) return "#";
              return "0";
            })
            .join(""),
        )
        .join("\n");

      console.log("Encoded Grid:", encodedGrid);

      const response = await fetchWithAuth(
        "http://localhost:4000/api/save-maze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rows: cells.length,
            cols: cells[0].length,
            startNode: { row: startCell.row, col: startCell.row },
            targetNode: { row: targetCell.row, col: targetCell.row },
            data: encodedGrid,
          }),
        },
      );

      if (response.ok) {
        console.log("Grid saved successfully!");
        mazeHasBeenSaved = true;
      } else {
        console.error("Failed to save the grid.");
      }
    } else {
      alert("Change the maze before saving again!");
    }
  }

  function returnToPreviousPage() {
    window.location.href = document.referrer || "index.html";
  }
});
