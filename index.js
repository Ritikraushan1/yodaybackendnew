require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const { connectDB } = require("./src/config/db");
const apiApp = require("./src/app");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const logStream = fs.createWriteStream(
  path.join(__dirname, "./logs/access.log"),
  { flags: "a" } // append mode
);

app.use(morgan("combined", { stream: logStream }));

connectDB();

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api", apiApp);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
