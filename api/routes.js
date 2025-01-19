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
    const userQuery = "SELECT * FROM users WHERE email = ?";
    const user = db.prepare(userQuery).get(email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

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

router.post("/save-maze", authenticateToken, (req, res) => {
  const { rows, cols, startNode, targetNode, data } = req.body;

  if (!rows || !cols || !startNode || !targetNode || !data) {
    return res.status(400).json({ message: "All maze details are required" });
  }

  if (rows > 100 || cols > 100) {
    return res
      .status(400)
      .json({ message: "Maze dimensions cannot exceed 100x100" });
  }

  try {
    const userId = req.userToken.userId;

    // Get the current count of mazes for this user
    const countQuery = `
      SELECT COUNT(*) AS count FROM mazes WHERE user_id = ?
    `;
    const { count } = db.prepare(countQuery).get(userId);

    // Generate a unique maze name based on the count
    const mazeNumber = count + 1;
    const mazeName = `${req.userToken.username}'s Maze ${mazeNumber}`;

    const insertQuery = `
      INSERT INTO mazes (user_id, maze_name, rows, cols, start_node, target_node, data)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = db.prepare(insertQuery).run(
      userId,
      mazeName,
      rows,
      cols,
      JSON.stringify(startNode), // Convert coordinates to JSON string
      JSON.stringify(targetNode), // Convert coordinates to JSON string
      JSON.stringify(data), // Convert 2D matrix to JSON string
    );

    res.status(201).json({
      message: "Maze saved successfully",
      mazeId: result.lastInsertRowid,
      mazeName,
    });
  } catch (error) {
    console.error("Error saving maze:", error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res
        .status(409)
        .json({ message: "Maze name must be unique for this user" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/user/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;

  if (userId != req.userToken.userId) {
    res.status(500).json({ message: "Cannot view other's profiles" });
  }
  try {
    const userQuery = "SELECT username, email FROM users WHERE user_id = ?";
    const user = db.prepare(userQuery).get(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/mazes/:userId", authenticateToken, (req, res) => {
  const { userId } = req.params;
  if (userId != req.userToken.userId) {
    res.status(500).json({ message: "Cannot view other's mazes" });
  }
  try {
    const mazesQuery = `
      SELECT maze_id, maze_name , rows, cols, created_at FROM mazes WHERE user_id = ? ORDER BY created_at DESC
    `;
    const mazes = db.prepare(mazesQuery).all(userId);

    res.status(200).json(mazes);
  } catch (error) {
    console.error("Error fetching mazes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/load-maze/:id", authenticateToken, (req, res) => {
  const mazeId = req.params.id;

  try {
    const mazeQuery = `SELECT * FROM mazes WHERE  maze_id = ?`;

    const maze = db.prepare(mazeQuery).all(mazeId);

    res.status(200).json(maze[0]);
  } catch (e) {
    console.error("Error getting maze", e);
    res
      .status(500)
      .json({ message: "This maze is not asigned to your account" });
  }
});

router.delete("/maze/:id", authenticateToken, (req, res) => {
  const mazeId = req.params.id;
  const userId = req.userToken.userId;

  try {
    const mazeCheckQuery = `SELECT * FROM mazes WHERE maze_id = ? AND user_id = ?`;
    const maze = db.prepare(mazeCheckQuery).get(mazeId, userId);

    if (!maze) {
      return res
        .status(403)
        .json({
          message:
            "This maze is not assigned to your account or does not exist.",
        });
    }

    const deleteQuery = `DELETE FROM mazes WHERE maze_id = ?`;
    const result = db.prepare(deleteQuery).run(mazeId);

    if (result.changes > 0) {
      res.status(200).json({ message: "Maze deleted successfully." });
    } else {
      res.status(500).json({ message: "Failed to delete the maze." });
    }
  } catch (e) {
    console.error("Error deleting maze:", e);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the maze." });
  }
});

module.exports = router;
