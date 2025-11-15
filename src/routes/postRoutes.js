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
  getSearchedPostsHandler,
} = require("../controllers/postController");
const {
  addReactionHandler,
  removeReactionHandler,
} = require("../controllers/postLikesController");

router.post("/", ensureAdmin, createPostHandler);
router.get("/", authMiddleware, getAllPostsHandler);
router.get("/search", authMiddleware, getSearchedPostsHandler);
router.get("/:id", authMiddleware, getPostByCodeHandler);
router.put("/:id", authMiddleware, updatePostHandler);
router.get("/:id/delete", ensureAdmin, deletePostHandler);

router.post("/:postId/react", authMiddleware, addReactionHandler);
router.delete("/:postId/react", authMiddleware, removeReactionHandler);

module.exports = router;
