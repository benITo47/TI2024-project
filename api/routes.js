const express = require("express");
const router = express.Router();
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const {
  generateTokens,
  invalidateRefreshToken,
  findUserByRefreshToken,
  authenticateToken,
  updateRefreshToken,
} = require("./utils.js");

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Invalid information" });
  }

  try {
    // Check if the user already exists
    const userQuery = "SELECT * FROM users WHERE email = ? OR username = ?";
    const existingUser = db.prepare(userQuery).get(email, username);

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (username, email, password_hash)
      VALUES (?, ?, ?)
    `;
    const result = db.prepare(insertQuery).run(username, email, hashedPassword);

    res.status(201).json({
      message: "User registered successfully",
      userId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Fetch the user from the database
    const userQuery = "SELECT * FROM users WHERE email = ?";
    const user = db.prepare(userQuery).get(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate the password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate new access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update the refresh token in the database
    const updateRefreshTokenQuery = `
      UPDATE users SET refresh_token = ? WHERE user_id = ?
    `;
    db.prepare(updateRefreshTokenQuery).run(refreshToken, user.user_id);

    // Respond with tokens and user details
    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      userId: user.user_id,
      username: user.username,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  const user = findUserByRefreshToken(refreshToken);

  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);

      // Update the new refresh token in the database
      const updateRefreshTokenQuery = `
        UPDATE users SET refresh_token = ? WHERE user_id = ?
      `;
      db.prepare(updateRefreshTokenQuery).run(newRefreshToken, user.user_id);

      res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
        userId: user.user_id,
        username: user.username,
      });
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Verify Token

router.post("/verify-token", async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];
  const refreshToken = req.body.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(accessToken, JWT_SECRET, async (err, user) => {
    if (err) {
      // If access token is invalid/expired, fallback to refresh token
      if (err.name === "TokenExpiredError" && refreshToken) {
        const userFromRefreshToken = findUserByRefreshToken(refreshToken);

        if (!userFromRefreshToken) {
          return res.status(403).json({ message: "Invalid refresh token" });
        }

        const { accessToken: newAccessToken } =
          generateTokens(userFromRefreshToken);
        return res.status(200).json({
          accessToken: newAccessToken,
          userId: userFromRefreshToken.user_id,
          username: userFromRefreshToken.username,
        });
      }

      return res.status(403).json({ message: "Invalid access token" });
    }

    res.status(200).json({ userId: user.userId, username: user.username });
  });
});

// Logout a user

router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  const user = findUserByRefreshToken(refreshToken);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  invalidateRefreshToken(user.user_id);

  res.status(200).json({ message: "Logout successful" });
});

// === Maze Routes ===

// Save a maze
router.post("/maze", authenticateToken, (req, res) => {
  // Save maze for the authenticated user
});

// Fetch all mazes for a user
router.get("/mazes", authenticateToken, (req, res) => {
  // Fetch mazes logic here
});

// Delete a maze
router.delete("/maze/:id", authenticateToken, (req, res) => {
  // Delete maze logic here
});

module.exports = router;
