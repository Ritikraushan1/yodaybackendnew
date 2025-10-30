// commentLikesController.js
const { addLike, deleteLike } = require("../models/commentLikeModel");

/**
 * Add a like to a comment
 * POST /comments/:commentId/like
 */
const addLikeHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId; // assuming auth middleware sets req.user

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await addLike(commentId, userId);

    if (result.success) {
      return res.status(200).json({ like: result.like });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in addLikeHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Delete a like from a comment
 * DELETE /comments/:commentId/like
 */
const deleteLikeHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId; // assuming auth middleware sets req.user

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await deleteLike(commentId, userId);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in deleteLikeHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

module.exports = { addLikeHandler, deleteLikeHandler };
