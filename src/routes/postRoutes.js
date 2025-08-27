const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createPostHandler,
  updatePostHandler,
  deletePostHandler,
} = require("../controllers/postController");

router.post("/", authMiddleware, createPostHandler);
router.put("/:id", authMiddleware, updatePostHandler);
router.delete("/:id", authMiddleware, deletePostHandler);

module.exports = router;
