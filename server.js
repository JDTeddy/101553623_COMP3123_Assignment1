const express = require("express");

const app = express();
const SERVER_PORT = 3000;

// http://localhost:3000/
app.get("/", (req, res) => {
  res.send("<h1>Employee API is running</h1>");
});

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on http://localhost:${SERVER_PORT}/`);
});