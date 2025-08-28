const { pool } = require("../config/db");

const addComment = async ({ postCode, userId, text, emoji, imageUrl }) => {
  try {
    if (!postCode || !userId) {
      return { success: false, message: "postCode and userId are required" };
    }

    const query = `
      INSERT INTO comments (post_id, user_id, text, emoji, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      postCode,
      userId,
      text || null,
      emoji || null,
      imageUrl || null,
    ]);
    return { success: true, comment: rows[0] };
  } catch (err) {
    console.error("❌ Error in addComment:", err.message);
    return { success: false, status: 500, message: "Database insert failed" };
  }
};

const addReply = async ({ parentCommentId, userId, text, emoji, imageUrl }) => {
  try {
    if (!parentCommentId || !userId) {
      return {
        success: false,
        message: "parentCommentId and userId are required",
      };
    }

    // Get parent comment's post_id
    const parentQuery = `SELECT post_id FROM comments WHERE comment_id = $1`;
    const { rows: parentRows } = await pool.query(parentQuery, [
      parentCommentId,
    ]);

    if (parentRows.length === 0) {
      return { success: false, message: "Parent comment not found" };
    }

    const postId = parentRows[0].post_id;

    const query = `
      INSERT INTO comments (post_id, user_id, parent_comment_id, text, emoji, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      postId,
      userId,
      parentCommentId,
      text || null,
      emoji || null,
      imageUrl || null,
    ]);
    return { success: true, reply: rows[0] };
  } catch (err) {
    console.error("❌ Error in addReply:", err.message);
    return { success: false, status: 500, message: "Database insert failed" };
  }
};

const getCommentsByPost = async (postCode) => {
  try {
    if (!postCode) {
      return { success: false, message: "postCode is required" };
    }

    // Fetch all comments for the post
    const query = `
      SELECT 
        c.comment_id, 
        c.post_id, 
        c.user_id, 
        c.parent_comment_id, 
        c.text, 
        c.emoji, 
        c.image_url, 
        c.created_at
      FROM comments c
      WHERE c.post_id = $1
      ORDER BY c.created_at;
    `;

    const { rows } = await pool.query(query, [postCode]);

    // Build threaded structure
    const commentsMap = {};
    const rootComments = [];

    rows.forEach((comment) => {
      comment.replies = [];
      commentsMap[comment.comment_id] = comment;

      if (comment.parent_comment_id) {
        // attach to parent
        const parent = commentsMap[comment.parent_comment_id];
        if (parent) {
          parent.replies.push(comment);
        }
      } else {
        // top-level comment
        rootComments.push(comment);
      }
    });

    return { success: true, comments: rootComments };
  } catch (err) {
    console.error("❌ Error in getCommentsByPost:", err.message);
    return { success: false, status: 500, message: "Database query failed" };
  }
};

const updateComment = async ({ commentId, userId, text, emoji, imageUrl }) => {
  try {
    if (!commentId || !userId) {
      return { success: false, message: "commentId and userId are required" };
    }

    const query = `
      UPDATE comments
      SET text = $1,
          emoji = $2,
          image_url = $3,
          created_at = NOW()
      WHERE comment_id = $4 AND user_id = $5
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      text || null,
      emoji || null,
      imageUrl || null,
      commentId,
      userId,
    ]);

    if (rows.length === 0) {
      return { success: false, message: "Comment not found or not authorized" };
    }

    return { success: true, comment: rows[0] };
  } catch (err) {
    console.error("❌ Error in updateComment:", err.message);
    return { success: false, status: 500, message: "Database update failed" };
  }
};

const deleteComment = async ({ commentId, userId }) => {
  try {
    if (!commentId || !userId) {
      return { success: false, message: "commentId and userId are required" };
    }

    const query = `
      DELETE FROM comments
      WHERE comment_id = $1 AND user_id = $2
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [commentId, userId]);

    if (rows.length === 0) {
      return { success: false, message: "Comment not found or not authorized" };
    }

    return { success: true, comment: rows[0] };
  } catch (err) {
    console.error("❌ Error in deleteComment:", err.message);
    return { success: false, status: 500, message: "Database delete failed" };
  }
};

module.exports = {
  addComment,
  addReply,
  getCommentsByPost,
  updateComment,
  deleteComment,
};
