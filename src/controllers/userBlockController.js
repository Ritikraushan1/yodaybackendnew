const { findUserById } = require("../models/authModel");
const {
  blockUser,
  unblockUser,
  getBlockedUsers,
  hasBlockedRelation,
} = require("../models/userBlockModel");

/**
 * Handle blocking a user
 */
const blockUserHandler = async (req, res) => {
  try {
    const blockerId = req.user.userId;
    const { blockedId } = req.body;

    if (!blockedId) {
      return res.status(400).json({
        success: false,
        message: "Blocked user ID (blockedId) is required in body",
      });
    }

    if (blockerId === blockedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    // Verify target user exists and is not deleted
    const checkUser = await findUserById(blockedId);
    if (!checkUser.success || !checkUser.user) {
      return res.status(404).json({
        success: false,
        message: "User to be blocked not found or already deleted",
      });
    }

    const result = await blockUser(blockerId, blockedId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to block user",
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message || "User blocked successfully",
      block: result.block || null,
    });
  } catch (err) {
    console.error("❌ Error in blockUserHandler:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Handle unblocking a user
 */
const unblockUserHandler = async (req, res) => {
  try {
    const blockerId = req.user.userId;
    const { blockedId } = req.body;

    if (!blockedId) {
      return res.status(400).json({
        success: false,
        message: "Blocked user ID (blockedId) is required in body",
      });
    }

    const result = await unblockUser(blockerId, blockedId);

    if (!result.success) {
      // If was not blocked, return a 400 or 404
      if (result.message === "User was not blocked") {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to unblock user",
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message || "User unblocked successfully",
    });
  } catch (err) {
    console.error("❌ Error in unblockUserHandler:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Fetch list of blocked users for the authenticated user
 */
const getBlockedUsersHandler = async (req, res) => {
  try {
    const blockerId = req.user.userId;

    const result = await getBlockedUsers(blockerId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || "Failed to fetch blocked users",
      });
    }

    return res.status(200).json({
      success: true,
      blockedUsers: result.blockedUsers || [],
    });
  } catch (err) {
    console.error("❌ Error in getBlockedUsersHandler:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Check if block status exists between current user and target user
 */
const checkBlockStatusHandler = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId: targetUserId } = req.params;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "Target user ID (userId) parameter is required",
      });
    }

    const result = await hasBlockedRelation(currentUserId, targetUserId);

    return res.status(200).json({
      success: true,
      blocked: result.blocked,
      detail: result.detail, // 'blocker', 'blocked', or 'none'
    });
  } catch (err) {
    console.error("❌ Error in checkBlockStatusHandler:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  blockUserHandler,
  unblockUserHandler,
  getBlockedUsersHandler,
  checkBlockStatusHandler,
};
