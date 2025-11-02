const {
  addOrUpdateReaction,
  removeReaction,
  getReactionSummary,
  hasUserReacted,
} = require("../models/commentLikeModel");

/**
 * Add or update a reaction to a comment
 * POST /comments/:commentId/react
 * Body: { reaction_type: "like" | "love" | "care" | "haha" | "wow" | "weeping" | "angry" }
 */
const reactToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId; // assuming auth middleware sets req.user
    const { reaction_type } = req.body;

    if (!commentId || !reaction_type) {
      return res
        .status(400)
        .json({ message: "commentId and reaction_type are required" });
    }

    const result = await addOrUpdateReaction(commentId, userId, reaction_type);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    return res.status(200).json({
      message:
        result.action === "added"
          ? "Reaction added"
          : result.action === "updated"
          ? "Reaction updated"
          : "Reaction removed",
      action: result.action,
      data: result.reaction || result.deleted,
    });
  } catch (err) {
    console.error("❌ Error in reactToComment:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Remove a user's reaction from a comment
 * DELETE /comments/:commentId/react
 */
const removeReactionHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await removeReaction(commentId, userId);

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(404).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in removeReactionHandler:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Get all reactions summary for a comment
 * GET /comments/:commentId/reactions
 */
const getReactionsSummaryHandler = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await getReactionSummary(commentId);

    if (result.success) {
      return res.status(200).json({ summary: result.summary });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in getReactionsSummaryHandler:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/**
 * Check if current user has reacted to a comment
 * GET /comments/:commentId/reaction
 */
const hasUserReactedHandler = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    if (!commentId) {
      return res.status(400).json({ message: "commentId is required" });
    }

    const result = await hasUserReacted(commentId, userId);

    if (result.success) {
      return res.status(200).json({
        reacted: result.reacted,
        reaction_type: result.reaction_type,
      });
    } else {
      return res.status(400).json({ message: result.message });
    }
  } catch (err) {
    console.error("❌ Error in hasUserReactedHandler:", err.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  reactToComment,
  removeReactionHandler,
  getReactionsSummaryHandler,
  hasUserReactedHandler,
};
