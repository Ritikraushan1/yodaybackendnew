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
  createReportHandler,
  getReportsByCommentHandler,
} = require("../controllers/commentReportsController");

const {
  addLikeHandler,
  deleteLikeHandler,
} = require("../controllers/commentLikesController");

router.post("/", authMiddleware, addCommentHandler);
router.post("/reply", authMiddleware, addReplyHandler);
router.get("/post/:postCode", authMiddleware, getCommentsHandler);
// Likes routes
router.post("/:commentId/like", authMiddleware, addLikeHandler);
router.delete("/:commentId/like", authMiddleware, deleteLikeHandler);

//report comments
router.post("/:commentId/report", authMiddleware, createReportHandler);
router.put("/:commentId", authMiddleware, updateCommentHandler);
router.delete("/:commentId", authMiddleware, deleteCommentHandler);

module.exports = router;
