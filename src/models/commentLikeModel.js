// commentLikesModel.js
const { pool } = require("../config/db");

/**
 * Add a like to a comment
 * @param {UUID} commentId
 * @param {UUID} userId
 */
const addLike = async (commentId, userId) => {
  try {
    const query = `
      INSERT INTO comment_likes (comment_id, user_id)
      VALUES ($1, $2)
      RETURNING like_id, comment_id, user_id, created_at;
    `;
    const { rows } = await pool.query(query, [commentId, userId]);
    return { success: true, like: rows[0] };
  } catch (err) {
    // Handle unique constraint violation (already liked)
    if (err.code === "23505") {
      return { success: false, message: "User has already liked this comment" };
    }
    console.error("❌ Error in addLike:", err.message);
    return { success: false, message: "Database insert failed" };
  }
};

/**
 * Get all likes for a comment
 * @param {UUID} commentId
 */
const getLikesByComment = async (commentId) => {
  try {
    const query = `
      SELECT cl.like_id, cl.comment_id, cl.user_id, cl.created_at, u.name AS username
      FROM comment_likes cl
      JOIN user_profiles u ON u.id = cl.user_id
      WHERE cl.comment_id = $1
      ORDER BY cl.created_at ASC;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return { success: true, likes: rows };
  } catch (err) {
    console.error("❌ Error in getLikesByComment:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

/**
 * Delete a like by comment_id and user_id
 * @param {UUID} commentId
 * @param {UUID} userId
 */
const deleteLike = async (commentId, userId) => {
  try {
    const query = `
      DELETE FROM comment_likes
      WHERE comment_id = $1 AND user_id = $2
      RETURNING like_id;
    `;
    const { rows } = await pool.query(query, [commentId, userId]);

    if (rows.length === 0) {
      return { success: false, message: "Like not found" };
    }

    return { success: true, message: "Like deleted successfully" };
  } catch (err) {
    console.error("❌ Error in deleteLike:", err.message);
    return { success: false, message: "Database delete failed" };
  }
};

const getLikeCount = async (commentId) => {
  try {
    const query = `
      SELECT COUNT(*) AS like_count
      FROM comment_likes
      WHERE comment_id = $1;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return { success: true, like_count: parseInt(rows[0].like_count, 10) };
  } catch (err) {
    console.error("❌ Error in getLikeCount:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

module.exports = {
  addLike,
  getLikesByComment,
  deleteLike,
  getLikeCount,
};
