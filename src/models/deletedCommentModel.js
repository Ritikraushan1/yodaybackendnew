const { pool } = require("../config/db");

/**
 * Archive a comment before deleting it
 */
const archiveDeletedComment = async (
  { comment, deletedBy, deleteReason = null },
  client = pool
) => {
  try {
    const query = `
      INSERT INTO deleted_comments (
        comment_id,
        post_id,
        user_id,
        text,
        emoji,
        image_url,
        created_at,
        deleted_by,
        delete_reason
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      ) RETURNING *;
    `;

    const values = [
      comment.comment_id,
      comment.post_id,
      comment.user_id,
      comment.text,
      comment.emoji,
      comment.image_url,
      comment.created_at,
      deletedBy,
      deleteReason,
    ];

    const { rows } = await client.query(query, values);
    return { success: true, deletedComment: rows[0] };
  } catch (err) {
    console.error("❌ Error archiving deleted comment:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to archive deleted comment",
    };
  }
};

/**
 * Get all deleted comments
 */
const getAllDeletedComments = async () => {
  try {
    const query = `
      SELECT *
      FROM deleted_comments
      ORDER BY deleted_at DESC;
    `;
    const { rows } = await pool.query(query);
    return { success: true, deletedComments: rows };
  } catch (err) {
    console.error("❌ Error fetching deleted comments:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch deleted comments",
    };
  }
};

/**
 * Get deleted comments by post
 */
const getDeletedCommentsByPostId = async (postId) => {
  try {
    const query = `
      SELECT *
      FROM deleted_comments
      WHERE post_id = $1
      ORDER BY deleted_at DESC;
    `;
    const { rows } = await pool.query(query, [postId]);
    return { success: true, deletedComments: rows };
  } catch (err) {
    console.error("❌ Error fetching deleted comments by post:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch deleted comments for post",
    };
  }
};

/**
 * Get deleted comments by original owner
 */
const getDeletedCommentsByUserId = async (userId) => {
  try {
    const query = `
      SELECT *
      FROM deleted_comments
      WHERE user_id = $1
      ORDER BY deleted_at DESC;
    `;
    const { rows } = await pool.query(query, [userId]);
    return { success: true, deletedComments: rows };
  } catch (err) {
    console.error("❌ Error fetching deleted comments by user:", err.message);
    return {
      success: false,
      status: 500,
      message: "Failed to fetch deleted comments for user",
    };
  }
};

module.exports = {
  archiveDeletedComment,
  getAllDeletedComments,
  getDeletedCommentsByPostId,
  getDeletedCommentsByUserId,
};
