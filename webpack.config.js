const path = require("path");

module.exports = {
  entry: "./src/main/server.js",
  output: {
    filename: "server.js",
    path: path.resolve(__dirname, "dist"),
  },
  target: "node12.19",
};
