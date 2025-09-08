const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  addCommentHandler,
  addReplyHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
} = require("../controllers/commentController");

const {
  addLikeHandler,
  deleteLikeHandler,
} = require("../controllers/commentLikesController");

router.post("/", authMiddleware, addCommentHandler);
router.put("/:commentId", authMiddleware, updateCommentHandler);
router.delete("/:commentId", authMiddleware, deleteCommentHandler);
router.post("/reply", authMiddleware, addReplyHandler);
router.get("/post/:postCode", authMiddleware, getCommentsHandler);

// Likes routes
router.post("/:commentId/like", authMiddleware, addLikeHandler);
router.delete("/:commentId/like", authMiddleware, deleteLikeHandler);

module.exports = router;
