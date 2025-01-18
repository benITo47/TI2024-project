const db = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "access_secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secret";

const generateTokens = (user) => {
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

  return { accessToken, refreshToken };
};

const invalidateRefreshToken = (userId) => {
  const clearTokenQuery = `
    UPDATE users SET refresh_token = NULL WHERE user_id = ?
  `;
  db.prepare(clearTokenQuery).run(userId);
};

const findUserByRefreshToken = (refreshToken) => {
  const userQuery = "SELECT * FROM users WHERE refresh_token = ?";
  return db.prepare(userQuery).get(refreshToken);
};

const updateRefreshToken = (userId, refreshToken) => {
  const updateQuery = `
    UPDATE users SET refresh_token = ? WHERE user_id = ?
  `;
  db.prepare(updateQuery).run(refreshToken, userId);
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied");

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid Token");
    req.userToken = user;
    next();
  });
};

module.exports = {
  generateTokens,
  invalidateRefreshToken,
  findUserByRefreshToken,
  updateRefreshToken,
  authenticateToken,
};
