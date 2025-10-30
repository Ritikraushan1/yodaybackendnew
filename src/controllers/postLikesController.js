// postLikesController.js
const {
  addOrUpdateReaction,
  removeReaction,
  getReactionCounts,
} = require("../models/postLikesModel");

/**
 * Add a like or dislike to a post
 * POST /posts/:postId/reaction
 * body: { type: 'like' | 'dislike' }
 */
const addReactionHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const { type } = req.body;
    const userId = req.user.userId; // assume auth middleware sets req.user

    if (!postId || !type || !["like", "dislike"].includes(type)) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const isLike = type === "like";

    const result = await addOrUpdateReaction(postId, userId, isLike);

    if (result.success) {
      return res.status(200).json({ reaction: result.reaction });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in addReactionHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Remove a user's reaction from a post
 * DELETE /posts/:postId/reaction
 */
const removeReactionHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId; // assume auth middleware sets req.user

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const result = await removeReaction(postId, userId);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in removeReactionHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

/**
 * Get like and dislike counts for a post
 * GET /posts/:postId/reaction
 */
const getReactionCountsHandler = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const counts = await getReactionCounts(postId);

    if (counts.success) {
      return res.status(200).json(counts);
    } else {
      return res.status(500).json({ message: counts.message });
    }
  } catch (err) {
    console.error("❌ Error in getReactionCountsHandler:", err.message);
    return res.status(500).json({ message: "Try again later" });
  }
};

module.exports = {
  addReactionHandler,
  removeReactionHandler,
  getReactionCountsHandler,
};
