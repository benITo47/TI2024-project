// auth.js
// Authentication Utilities

/**
 * Initialize authentication forms and actions.
 */
export function initializeAuth() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  // Handle action-specific visibility or behavior
  if (action === "login") {
    toggleForms(loginForm, registerForm);
  } else if (action === "register") {
    toggleForms(registerForm, loginForm);
  } else if (action === "logout") {
    handleLogout(authMessage);
  } else {
    displayMessage(
      authMessage,
      "Invalid action. Please select login, register, or logout.",
      true,
    );
  }

  // Add event listeners for login and register
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
}

/**
 * Handle login form submission.
 */
export async function handleLogin(event) {
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
      displayMessage("Login successful!");
      returnToPreviousPage();
    } else {
      displayMessage(result.message, true);
    }
  } catch (error) {
    console.error("Login failed:", error);
    displayMessage("An error occurred. Please try again.", true);
  }
}

/**
 * Handle register form submission.
 */
export async function handleRegister(event) {
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
      displayMessage("Registration successful! You can now log in.");
      returnToPreviousPage();
    } else {
      displayMessage(result.message, true);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    displayMessage("An error occurred. Please try again.", true);
  }
}

/**
 * Handle logout action.
 */
export async function handleLogout(authMessage) {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    displayMessage(authMessage, "You are already logged out.");
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
      displayMessage(authMessage, "Logged out successfully.");
      returnToPreviousPage();
    } else {
      const result = await response.json();
      displayMessage(authMessage, result.message, true);
    }
  } catch (error) {
    console.error("Logout failed:", error);
    displayMessage(
      authMessage,
      "An error occurred while logging out. Please try again.",
      true,
    );
  }
}

/**
 * Refresh the access token.
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    const response = await fetch("http://localhost:4000/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();
    if (response.ok) {
      saveTokens(result);
      return result.accessToken;
    } else {
      console.error("Failed to refresh tokens:", result.message);
      clearLocalStorage();
    }
  } catch (error) {
    console.error("Error refreshing tokens:", error);
  }
  return null;
}

/**
 * Perform an authenticated fetch request.
 */
export async function fetchWithAuth(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");

  if (!options.headers) options.headers = {};
  options.headers["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(url, options);

  if (response.status === 401) {
    const newAccessToken = await refreshAccessToken();
    if (newAccessToken) {
      options.headers["Authorization"] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    }
  }

  return response;
}

/**
 * Save tokens and user info to localStorage.
 */
export function saveTokens({ accessToken, refreshToken, userId, username }) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("userId", userId);
  localStorage.setItem("username", username);
}

/**
 * Clear all user-related data from localStorage.
 */
export function clearLocalStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
}

/**
 * Display a message to the user.
 */
export function displayMessage(element, message, isError = false) {
  element.textContent = message;
  element.style.color = isError ? "red" : "green";
}

/**
 * Redirect the user to the previous page or a default page.
 */
export function returnToPreviousPage() {
  window.location.href = document.referrer || "index.html";
}
