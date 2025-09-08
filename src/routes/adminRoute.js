const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { ensureAdmin } = require("../middlewares/authMiddleware");
const {
  createPostHandler,
  getAllPostsHandler,
  getPostsWithReactions,
} = require("../controllers/postController");
const { getAllPosts } = require("../models/postModel");

// Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.redirect("/admin/login");
}

// Auth routes
router.get("/login", adminAuthController.showLogin);
router.post("/login", adminAuthController.handleLogin);
router.post("/verify", adminAuthController.verifyOtp);
router.get("/logout", adminAuthController.logout);

// Dashboard
router.get("/dashboard", requireAdmin, (req, res) => {
  res.render("admin/dashboard.njk", {
    title: "Admin Dashboard",
    user: req.session.admin,
  });
});

/* ===========================
   📌 POSTS MANAGEMENT
   =========================== */
router.get("/posts", requireAdmin, async (req, res) => {
  try {
    const postData = await getPostsWithReactions(); // Pass search if needed

    res.render("admin/posts.njk", {
      title: "Manage Posts",
      user: req.session.admin,
      posts: postData.success ? postData.posts : [],
    });
  } catch (err) {
    console.error("❌ Error fetching posts:", err.message);
    res.render("admin/posts.njk", {
      title: "Manage Posts",
      user: req.session.admin,
      posts: [],
      error: "Failed to load posts",
    });
  }
});

router.post("/posts", ensureAdmin, createPostHandler);
router.get("/posts/new", requireAdmin, (req, res) => {
  res.render("admin/newPost.njk", { title: "Add New Post" });
});

/* ===========================
   📌 USERS MANAGEMENT
   =========================== */
router.get("/users", requireAdmin, (req, res) => {
  res.render("admin/users.njk", {
    title: "All Users",
    user: req.session.admin,
  });
});
router.get("/users/new", requireAdmin, (req, res) => {
  res.render("admin/newUser.njk", { title: "New User" });
});
router.get("/users/deleted", requireAdmin, (req, res) => {
  res.render("admin/deletedUsers.njk", { title: "Deleted Users" });
});

/* ===========================
   📌 COMMENTS MANAGEMENT
   =========================== */
router.get("/comments", requireAdmin, (req, res) => {
  res.render("admin/comments.njk", { title: "Manage Comments" });
});

/* ===========================
   📌 NOTIFICATIONS
   =========================== */
router.get("/notifications", requireAdmin, (req, res) => {
  res.render("admin/notifications.njk", { title: "Send Notification" });
});
router.post("/notifications", requireAdmin, (req, res) => {
  // handle send notification logic here
  res.redirect("/admin/notifications");
});

module.exports = router;
