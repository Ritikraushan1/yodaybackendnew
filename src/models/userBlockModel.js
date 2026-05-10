const { pool } = require("../config/db");

/**
 * Block another user
 * @param {string} blockerId - UUID of the user initiating the block
 * @param {string} blockedId - UUID of the user being blocked
 * @returns {Promise<object>}
 */
const blockUser = async (blockerId, blockedId) => {
  try {
    if (blockerId === blockedId) {
      return { success: false, message: "You cannot block yourself" };
    }

    const query = `
      INSERT INTO user_blocks (blocker_id, blocked_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [blockerId, blockedId]);
    return { success: true, block: rows[0] };
  } catch (err) {
    // Unique constraint violation code in PostgreSQL is 23505
    if (err.code === "23505") {
      return { success: true, message: "User is already blocked" };
    }
    console.error("❌ Error in blockUser:", err.message);
    return { success: false, message: "Database operation failed" };
  }
};

/**
 * Unblock a user
 * @param {string} blockerId - UUID of the user initiating the unblock
 * @param {string} blockedId - UUID of the user being unblocked
 * @returns {Promise<object>}
 */
const unblockUser = async (blockerId, blockedId) => {
  try {
    const query = `
      DELETE FROM user_blocks
      WHERE blocker_id = $1 AND blocked_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [blockerId, blockedId]);
    if (rows.length === 0) {
      return { success: false, message: "User was not blocked" };
    }
    return { success: true, message: "User unblocked successfully" };
  } catch (err) {
    console.error("❌ Error in unblockUser:", err.message);
    return { success: false, message: "Database operation failed" };
  }
};

/**
 * Check if blockerId has blocked blockedId
 * @param {string} blockerId
 * @param {string} blockedId
 * @returns {Promise<boolean>}
 */
const isUserBlocked = async (blockerId, blockedId) => {
  try {
    const query = `
      SELECT 1 FROM user_blocks
      WHERE blocker_id = $1 AND blocked_id = $2;
    `;
    const { rows } = await pool.query(query, [blockerId, blockedId]);
    return rows.length > 0;
  } catch (err) {
    console.error("❌ Error in isUserBlocked:", err.message);
    return false;
  }
};

/**
 * Check if a block relationship exists between two users in either direction
 * @param {string} userId1
 * @param {string} userId2
 * @returns {Promise<object>} - { blocked: boolean, detail: 'blocker' | 'blocked' | 'none' }
 */
const hasBlockedRelation = async (userId1, userId2) => {
  try {
    const query = `
      SELECT blocker_id, blocked_id FROM user_blocks
      WHERE (blocker_id = $1 AND blocked_id = $2)
         OR (blocker_id = $2 AND blocked_id = $1);
    `;
    const { rows } = await pool.query(query, [userId1, userId2]);
    if (rows.length === 0) {
      return { blocked: false, detail: "none" };
    }

    const first = rows[0];
    if (first.blocker_id === userId1) {
      return { blocked: true, detail: "blocker" }; // userId1 blocked userId2
    } else {
      return { blocked: true, detail: "blocked" }; // userId2 blocked userId1
    }
  } catch (err) {
    console.error("❌ Error in hasBlockedRelation:", err.message);
    return { blocked: false, detail: "error" };
  }
};

/**
 * Get list of blocked users for a specific user
 * @param {string} blockerId
 * @returns {Promise<object>}
 */
const getBlockedUsers = async (blockerId) => {
  try {
    const query = `
      SELECT 
        u.id, 
        u.email_id,
        up.name, 
        up.avatar, 
        up.category, 
        up.description,
        ub.created_at AS blocked_at
      FROM user_blocks ub
      INNER JOIN users u ON ub.blocked_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.id
      WHERE ub.blocker_id = $1 AND u.is_deleted = FALSE
      ORDER BY ub.created_at DESC;
    `;
    const { rows } = await pool.query(query, [blockerId]);
    return { success: true, blockedUsers: rows };
  } catch (err) {
    console.error("❌ Error in getBlockedUsers:", err.message);
    return { success: false, message: "Database query failed" };
  }
};

module.exports = {
  blockUser,
  unblockUser,
  isUserBlocked,
  hasBlockedRelation,
  getBlockedUsers,
};
