const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
  getAllPostsHandler,
  getPostByCodeHandler,
} = require("../controllers/postController");

router.post("/", authMiddleware, createPostHandler);
router.get("/", authMiddleware, getAllPostsHandler);
router.get("/:id", authMiddleware, getPostByCodeHandler);
router.put("/:id", authMiddleware, updatePostHandler);
router.delete("/:id", authMiddleware, deletePostHandler);

module.exports = router;
