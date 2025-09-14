const express = require("express");
const router = express.Router();

// Import feature routes
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
// API root check
router.get("/", (req, res) => {
  res.json({ message: "API root is working 🚀" });
});

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/posts", postRoutes);
router.use("/comments", commentRoutes);
router.use("/tickets", ticketRoutes);

module.exports = router;
