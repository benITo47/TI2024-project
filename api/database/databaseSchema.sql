
-- Table to store user account information
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    refresh_token TEXT DEFAULT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table to store maze metadata
CREATE TABLE mazes (
    maze_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    maze_name TEXT NOT NULL, -- e.g., 'Maze 1', 'Maze 2'
    rows INTEGER NOT NULL CHECK(rows <= 100),
    cols INTEGER NOT NULL CHECK(cols <= 100),
    start_node TEXT NOT NULL, -- Coordinates of start node (e.g., '5,5')
    target_node TEXT NOT NULL, -- Coordinates of target node (e.g., '10,10')
    data TEXT NOT NULL, -- Flattened 2D maze matrix stored as JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    UNIQUE(user_id, maze_name) -- Each user can have uniquely named mazes
);

