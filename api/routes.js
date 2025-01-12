const express = require("express");
const router = express.Router();
const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.user = user;
    next();
  });
};

// === Auth Routes ===

// Register a new user

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
// Login a user

// Login route (backend)

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const userQuery = "SELECT * FROM users WHERE email = ?";
    const user = db.prepare(userQuery).get(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { userId: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const updateRefreshTokenQuery = `
      UPDATE users SET refresh_token = ? WHERE user_id = ?
    `;
    db.prepare(updateRefreshTokenQuery).run(refreshToken, user.user_id);

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

  const userQuery = "SELECT * FROM users WHERE refresh_token = ?";
  const user = db.prepare(userQuery).get(refreshToken);

  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decodedUser) => {
      if (err) return res.status(403).json({ message: "Invalid token" });

      const newAccessToken = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const newRefreshToken = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" },
      );

      // Update the refresh token in the database
      const updateRefreshTokenQuery = `
        UPDATE users SET refresh_token = ? WHERE user_id = ?
      `;
      db.prepare(updateRefreshTokenQuery).run(newRefreshToken, user.user_id);

      res.status(200).json({
        accessToken: newAccessToken,
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

// Logout a user
router.post("/logout", (req, res) => {
  // Handle logout logic here
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
