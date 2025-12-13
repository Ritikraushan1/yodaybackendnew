const express = require("express");
const router = express.Router();
const adminAuthController = require("../controllers/adminAuthController");
const { ensureAdmin } = require("../middlewares/authMiddleware");
const {
  createPostHandler,
  getAllPostsHandler,
  getPostsWithReactions,
} = require("../controllers/postController");
const { getAllPosts, deletePostByCode } = require("../models/postModel");
const {
  getCommentsHandler,
  getAllCommentsForAdmin,
} = require("../controllers/commentController");
const {
  getCommentsByPost,
  deleteCommentById,
} = require("../models/commentModel");
const { getAllUsers } = require("../models/userProfileModel");
const { getAllTickets } = require("../models/ticketModel");
const {
  getAllTicketsHandler,
  getAllTicketsHandlerAdmin,
} = require("../controllers/ticketController");
const {
  getReportedCommentsWithDetails,
} = require("../models/CommentReportsModel");
const { getAllDeletedComments } = require("../models/deletedCommentModel");

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

router.get("/posts/:postCode/comments", requireAdmin, async (req, res) => {
  try {
    const { postCode } = req.params;

    const response = await getAllCommentsForAdmin(postCode);

    if (res.headersSent) return; // avoid double response

    const commentsData = response?.comments || [];
    console.log("response", response);

    res.render("admin/comments.njk", {
      title: `Comments for ${postCode}`,
      user: req.session.admin,
      postCode,
      comments: commentsData,
    });
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    res.render("admin/comments.njk", {
      title: "Comments",
      user: req.session.admin,
      comments: [],
      error: "Failed to load comments",
    });
  }
});

router.get("/posts/:postCode/delete", requireAdmin, async (req, res) => {
  try {
    const { postCode } = req.params;

    const response = await deletePostByCode(postCode);

    if (response.success) {
      return res.status(200).json({
        message: "Posts deleted successfully.",
      });
    }
  } catch (err) {
    console.error("❌ Error fetching comments:", err.message);
    return res.status(500).json({
      message: "Cannot delete posts.",
    });
  }
});

/* ===========================
   📌 USERS MANAGEMENT
   =========================== */
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const response = await getAllUsers();

    res.render("admin/users.njk", {
      title: "All Users",
      user: req.session.admin,
      users: response.users,
    });
  } catch (error) {
    res.render("admin/users.njk", {
      title: "All Users",
      user: req.session.admin,
      users: [],
    });
  }
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

router.get("/comments/reported", requireAdmin, async (req, res) => {
  const result = await getReportedCommentsWithDetails();
  console.log("result ", result);

  if (!result.success) {
    return res.status(result.status || 500).render("admin/comments.njk", {
      title: "Manage Reported Comments",
      error: result.message || "Failed to fetch reported comments",
      comments: [],
    });
  }

  return res.render("admin/comments.njk", {
    title: "Manage Reported Comments",
    comments: result.reportedComments,
  });
});

router.get("/comments/deleted", requireAdmin, async (req, res) => {
  try {
    const result = await getAllDeletedComments();
    console.log("deleted comments result:", result);

    if (!result.success) {
      return res
        .status(result.status || 500)
        .render("admin/deleted-comments.njk", {
          title: "Manage Deleted Comments",
          error: result.message || "Failed to fetch deleted comments",
          comments: [],
        });
    }

    // 🔥 SORT: latest deleted first
    const sortedComments = result.deletedComments.sort(
      (a, b) => new Date(b.deleted_at) - new Date(a.deleted_at)
    );

    return res.render("admin/deleted-comments.njk", {
      title: "Manage Deleted Comments",
      comments: sortedComments,
    });
  } catch (err) {
    console.error("Error fetching deleted comments:", err);

    return res.status(500).render("admin/deleted-comments.njk", {
      title: "Manage Deleted Comments",
      error: "Something went wrong",
      comments: [],
    });
  }
});

router.post("/comments/:commentId/delete", requireAdmin, async (req, res) => {
  try {
    const { commentId } = req.params;
    console.log("admin user", req.session.admin);

    const adminId = req.session.admin.id; // or req.user.id depending on your auth

    const response = await deleteCommentById({
      commentId,
      deletedBy: adminId,
    });

    if (!response.success) {
      return res
        .status(response.status || 400)
        .json({ message: response.message });
    }

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (err) {
    console.error("❌ Admin delete route error:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
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

router.get("/tickets", requireAdmin, async (req, res) => {
  const response = await getAllTicketsHandlerAdmin(req, res);

  if (response) {
    res.render("admin/tickets.njk", {
      title: "All Tickets",
      tickets: response.tickets,
    });
  } else {
    res.render("admin/tickets.njk", {
      title: "All Tickets",
      tickets: [],
    });
  }
});
router.post("/notifications", requireAdmin, (req, res) => {
  // handle send notification logic here
  res.redirect("/admin/notifications");
});

module.exports = router;
