const { pool } = require("../config/db");

/**
 * Add or update a like/dislike for a post by a user
 * Only one of like/dislike can be true at a time
 * @param {string} postId
 * @param {string} userId
 * @param {boolean} isLike - true if like, false if dislike
 */
const addOrUpdateReaction = async (postId, userId, isLike) => {
  try {
    // First, check if the user already has a reaction
    const checkQuery = `
      SELECT * FROM post_likes
      WHERE post_id = $1 AND user_id = $2
    `;
    const { rows } = await pool.query(checkQuery, [postId, userId]);

    if (rows.length > 0) {
      // Update existing reaction
      const updateQuery = `
        UPDATE post_likes
        SET likes = $1, dislikes = $2, created_at = CURRENT_TIMESTAMP
        WHERE post_id = $3 AND user_id = $4
        RETURNING *;
      `;
      const { rows: updatedRows } = await pool.query(updateQuery, [
        isLike, // likes
        !isLike, // dislikes
        postId,
        userId,
      ]);
      return { success: true, reaction: updatedRows[0] };
    } else {
      // Insert new reaction
      const insertQuery = `
        INSERT INTO post_likes (post_id, user_id, likes, dislikes)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const { rows: insertedRows } = await pool.query(insertQuery, [
        postId,
        userId,
        isLike,
        !isLike,
      ]);
      return { success: true, reaction: insertedRows[0] };
    }
  } catch (err) {
    console.error("❌ Error in addOrUpdateReaction:", err.message);
    return { success: false, message: "Database operation failed" };
  }
};

/**
 * Remove a user's reaction from a post
 * @param {string} postId
 * @param {string} userId
 */
const removeReaction = async (postId, userId) => {
  try {
    const query = `
      DELETE FROM post_likes
      WHERE post_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [postId, userId]);
    if (rows.length === 0) {
      return { success: false, message: "Reaction not found" };
    }
    return { success: true, message: "Reaction removed successfully" };
  } catch (err) {
    console.error("❌ Error in removeReaction:", err.message);
    return { success: false, message: "Database delete failed" };
  }
};

/**
 * Get total like and dislike counts for a post
 * @param {string} postId
 */
const getReactionCounts = async (postId) => {
  try {
    const query = `
      SELECT 
        SUM(CASE WHEN likes = TRUE THEN 1 ELSE 0 END) AS like_count,
        SUM(CASE WHEN dislikes = TRUE THEN 1 ELSE 0 END) AS dislike_count
      FROM post_likes
      WHERE post_id = $1;
    `;
    const { rows } = await pool.query(query, [postId]);
    return {
      success: true,
      like_count: parseInt(rows[0].like_count, 10) || 0,
      dislike_count: parseInt(rows[0].dislike_count, 10) || 0,
    };
  } catch (err) {
    console.error("❌ Error in getReactionCounts:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

/**
 * Get a user's reaction for a specific post
 * @param {string} postId
 * @param {string} userId
 */
const getUserReaction = async (postId, userId) => {
  try {
    const query = `
      SELECT likes, dislikes
      FROM post_likes
      WHERE post_id = $1 AND user_id = $2;
    `;
    const { rows } = await pool.query(query, [postId, userId]);

    if (rows.length === 0) {
      // User has not reacted
      return { success: true, likedByUser: false, dislikedByUser: false };
    }

    const { likes, dislikes } = rows[0];
    return {
      success: true,
      likedByUser: likes,
      dislikedByUser: dislikes,
    };
  } catch (err) {
    console.error("❌ Error in getUserReaction:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

module.exports = {
  addOrUpdateReaction,
  removeReaction,
  getReactionCounts,
  getUserReaction,
};
