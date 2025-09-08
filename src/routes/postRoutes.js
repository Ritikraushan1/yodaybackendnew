const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  ensureAdmin,
} = require("../middlewares/authMiddleware");
const {
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  getAllPostsHandler,
  getPostByCodeHandler,
} = require("../controllers/postController");
const {
  addReactionHandler,
  removeReactionHandler,
} = require("../controllers/postLikesController");

router.post("/", ensureAdmin, createPostHandler);
router.get("/", authMiddleware, getAllPostsHandler);
router.get("/:id", authMiddleware, getPostByCodeHandler);
router.put("/:id", authMiddleware, updatePostHandler);
router.delete("/:id", authMiddleware, deletePostHandler);

router.post("/:postId/react", authMiddleware, addReactionHandler);
router.delete("/:postId/react", authMiddleware, removeReactionHandler);

module.exports = router;
