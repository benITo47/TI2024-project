const Database = require("better-sqlite3");
const path = require("path");

// Path to the SQLite database file
const dbPath = path.join(__dirname, "database/database.db");

// Create or connect to the SQLite database
const db = new Database(dbPath, { verbose: console.log }); // Optional: verbose logs SQL queries

module.exports = db;
