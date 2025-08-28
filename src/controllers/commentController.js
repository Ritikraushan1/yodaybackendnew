const {
  addComment,
  addReply,
  getCommentsByPost,
  updateComment,
  deleteComment,
} = require("../models/commentModel");

// Add a top-level comment
const addCommentHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { post_code, text, emoji, imageUrl } = req.body;

    if (!post_code) {
      return res.status(400).json({ message: "postCode is required" });
    }

    const createdComment = await addComment({
      postCode: post_code,
      userId,
      text,
      emoji,
      imageUrl,
    });

    if (createdComment.success) {
      return res.status(200).json({ comment: createdComment.comment });
    } else {
      return res.status(500).json({ message: createdComment.message });
    }
  } catch (error) {
    console.error("❌ Error in addCommentHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// Add a reply to a comment
const addReplyHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { parentCommentId, text, emoji, imageUrl } = req.body;

    if (!parentCommentId) {
      return res.status(400).json({ message: "parentCommentId is required" });
    }

    const createdReply = await addReply({
      parentCommentId,
      userId,
      text,
      emoji,
      imageUrl,
    });

    if (createdReply.success) {
      return res.status(200).json({ reply: createdReply.reply });
    } else {
      return res.status(500).json({ message: createdReply.message });
    }
  } catch (error) {
    console.error("❌ Error in addReplyHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// Get all comments for a post (with nested replies)
const getCommentsHandler = async (req, res) => {
  try {
    const { postCode } = req.params;

    if (!postCode) {
      return res
        .status(400)
        .json({ message: "postCode is required in params" });
    }

    const comments = await getCommentsByPost(postCode);

    if (comments.success) {
      return res.status(200).json({ comments: comments.comments });
    } else {
      return res.status(404).json({ message: comments.message });
    }
  } catch (error) {
    console.error("❌ Error in getCommentsHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// Update a comment
const updateCommentHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { commentId } = req.params;
    const { text, emoji, imageUrl } = req.body;

    if (!commentId) {
      return res
        .status(400)
        .json({ message: "commentId is required in params" });
    }

    if (!text && !emoji && !imageUrl) {
      return res.status(400).json({ message: "No update data provided" });
    }

    const updated = await updateComment({
      commentId,
      userId,
      text,
      emoji,
      imageUrl,
    });

    if (!updated.success) {
      return res.status(404).json({ message: updated.message });
    }

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: updated.comment,
    });
  } catch (error) {
    console.error("❌ Error in updateCommentHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

// Delete a comment
const deleteCommentHandler = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { commentId } = req.params;

    if (!commentId) {
      return res
        .status(400)
        .json({ message: "commentId is required in params" });
    }

    const deleted = await deleteComment({ commentId, userId });

    if (!deleted.success) {
      return res.status(404).json({ message: deleted.message });
    }

    return res.status(200).json({
      message: "Comment deleted successfully",
      comment: deleted.comment,
    });
  } catch (error) {
    console.error("❌ Error in deleteCommentHandler:", error.message);
    return res.status(500).json({ message: "Try again later after sometime" });
  }
};

module.exports = {
  addCommentHandler,
  addReplyHandler,
  getCommentsHandler,
  updateCommentHandler,
  deleteCommentHandler,
};
