require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");

const server = express();
const PORT = process.env.PORT || 4000;

server.use(cors());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));

server.use("/api", routes);

server.get("/", (req, res) => {
  res.send("You have reached a root directory"); // Response for root directory access
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
