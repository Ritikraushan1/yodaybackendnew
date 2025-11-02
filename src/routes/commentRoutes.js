const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");

// 🗨️ Comment CRUD
const {
  addCommentHandler,
  addReplyHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} = require("../controllers/commentController");

// 🚨 Comment Reports
const {
  createReportHandler,
  getReportsByCommentHandler,
} = require("../controllers/commentReportsController");

// 💬 Comment Reactions
const {
  reactToComment,
  removeReactionHandler,
  getReactionsSummaryHandler,
  hasUserReactedHandler,
} = require("../controllers/commentLikesController");

// 📝 Create & manage comments
router.post("/", authMiddleware, addCommentHandler);
router.post("/reply", authMiddleware, addReplyHandler);
router.get("/post/:postCode", authMiddleware, getCommentsHandler);
router.put("/:commentId", authMiddleware, updateCommentHandler);
router.delete("/:commentId", authMiddleware, deleteCommentHandler);

// ❤️ Comment reactions (like/love/haha/etc.)
router.post("/:commentId/react", authMiddleware, reactToComment); // Add or update reaction
router.delete("/:commentId/react", authMiddleware, removeReactionHandler); // Remove reaction
router.get("/:commentId/reactions", authMiddleware, getReactionsSummaryHandler); // Get summary (counts)
router.get("/:commentId/reaction", authMiddleware, hasUserReactedHandler); // Get user’s reaction

// 🚩 Report comments
router.post("/:commentId/report", authMiddleware, createReportHandler);
router.get("/:commentId/reports", authMiddleware, getReportsByCommentHandler);

module.exports = router;
