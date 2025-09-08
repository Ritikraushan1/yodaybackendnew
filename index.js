require("dotenv").config();
const express = require("express");
const nunjucks = require("nunjucks");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");
const { connectDB } = require("./src/config/db");
const apiApp = require("./src/app");
const adminRoute = require("./src/routes/adminRoute");

const app = express();

const env = nunjucks.configure("views", {
  autoescape: true,
  express: app,
  watch: process.env.NODE_ENV !== "production",
});

env.addFilter("formatDate", (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
});

// Tell Express to use nunjucks as the template engine
app.set("view engine", "njk");
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 60 * 1000, // 30 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure cookies in prod
    },
  })
);

const logStream = fs.createWriteStream(
  path.join(__dirname, "./logs/access.log"),
  { flags: "a" } // append mode
);

app.use(morgan("combined", { stream: logStream }));

connectDB();

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running fine" });
});

// app.get("/admin", (req, res) => {
//   res.render("admin/dashboard.njk", {
//     title: "Admin Dashboard",
//     user: { name: "Admin User", role: "Superadmin" },
//   });
// });

app.use("/api", apiApp);
app.use("/admin", adminRoute);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
