// commentLikesModel.js
const { pool } = require("../config/db");

/**
 * Add or update a user's reaction to a comment
 * - Inserts a new reaction if none exists
 * - Updates the reaction if user changes it
 * - Deletes the reaction if the same reaction is clicked again (toggle)
 */
const addOrUpdateReaction = async (commentId, userId, reactionType) => {
  try {
    // Check if user has already reacted
    const checkQuery = `
      SELECT reaction_type 
      FROM comment_likes 
      WHERE comment_id = $1 AND user_id = $2;
    `;
    const { rows: existing } = await pool.query(checkQuery, [
      commentId,
      userId,
    ]);

    if (existing.length > 0) {
      const currentReaction = existing[0].reaction_type;

      // If user taps same reaction → remove (toggle off)
      if (currentReaction === reactionType) {
        const deleteQuery = `
          DELETE FROM comment_likes 
          WHERE comment_id = $1 AND user_id = $2
          RETURNING like_id;
        `;
        const { rows } = await pool.query(deleteQuery, [commentId, userId]);
        return { success: true, action: "removed", deleted: rows[0] };
      }

      // Otherwise → update reaction type
      const updateQuery = `
        UPDATE comment_likes
        SET reaction_type = $3, created_at = NOW()
        WHERE comment_id = $1 AND user_id = $2
        RETURNING like_id, comment_id, user_id, reaction_type, created_at;
      `;
      const { rows } = await pool.query(updateQuery, [
        commentId,
        userId,
        reactionType,
      ]);
      return { success: true, action: "updated", reaction: rows[0] };
    }

    // New reaction
    const insertQuery = `
      INSERT INTO comment_likes (comment_id, user_id, reaction_type)
      VALUES ($1, $2, $3)
      RETURNING like_id, comment_id, user_id, reaction_type, created_at;
    `;
    const { rows } = await pool.query(insertQuery, [
      commentId,
      userId,
      reactionType,
    ]);
    return { success: true, action: "added", reaction: rows[0] };
  } catch (err) {
    console.error("❌ Error in addOrUpdateReaction:", err.message);
    return { success: false, message: "Database operation failed" };
  }
};

/**
 * Get all reactions for a specific comment
 */
const getReactionsByComment = async (commentId) => {
  try {
    const query = `
      SELECT cl.like_id, cl.comment_id, cl.user_id, cl.reaction_type, cl.created_at, 
             u.name AS username
      FROM comment_likes cl
      JOIN user_profiles u ON u.id = cl.user_id
      WHERE cl.comment_id = $1
      ORDER BY cl.created_at ASC;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return { success: true, reactions: rows };
  } catch (err) {
    console.error("❌ Error in getReactionsByComment:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

/**
 * Remove user's reaction from a comment
 */
const removeReaction = async (commentId, userId) => {
  try {
    const query = `
      DELETE FROM comment_likes
      WHERE comment_id = $1 AND user_id = $2
      RETURNING like_id;
    `;
    const { rows } = await pool.query(query, [commentId, userId]);
    if (rows.length === 0)
      return { success: false, message: "No reaction found" };

    return { success: true, message: "Reaction removed successfully" };
  } catch (err) {
    console.error("❌ Error in removeReaction:", err.message);
    return { success: false, message: "Database delete failed" };
  }
};

/**
 * Get total count of each reaction for a comment
 */
const getReactionSummary = async (commentId) => {
  try {
    const query = `
      SELECT reaction_type, COUNT(*) AS count
      FROM comment_likes
      WHERE comment_id = $1
      GROUP BY reaction_type;
    `;
    const { rows } = await pool.query(query, [commentId]);
    return { success: true, summary: rows };
  } catch (err) {
    console.error("❌ Error in getReactionSummary:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

/**
 * Check if user has reacted to a specific comment
 */
const hasUserReacted = async (commentId, userId) => {
  try {
    const query = `
      SELECT reaction_type
      FROM comment_likes
      WHERE comment_id = $1 AND user_id = $2
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [commentId, userId]);
    return {
      success: true,
      reacted: rows.length > 0,
      reaction_type: rows[0]?.reaction_type || null,
    };
  } catch (err) {
    console.error("❌ Error in hasUserReacted:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

module.exports = {
  addOrUpdateReaction,
  getReactionsByComment,
  removeReaction,
  getReactionSummary,
  hasUserReacted,
};
