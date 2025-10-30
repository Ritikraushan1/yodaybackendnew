// controllers/userProfileController.js
const { deleteUserById } = require("../models/authModel");
const {
  findUserProfileById,
  createUserProfile,
  updateUserProfileById,
  deleteUserProfileById,
} = require("../models/userProfileModel");

const getSelfUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ comes from authMiddleware
    const user_profile = await findUserProfileById(userId);

    if (!user_profile.success) {
      return res.status(500).json({
        success: false,
        message: user_profile.message || "Something went wrong",
      });
    }

    return res.status(200).json({
      success: true,
      update_profile: !user_profile.user,
      profile: user_profile.user || null,
    });
  } catch (err) {
    console.error("❌ Error in getSelfUserProfile:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getUserProfileById = async (req, res) => {
  try {
    const { id } = req.params; // ✅ comes from authMiddleware
    const user_profile = await findUserProfileById(id);

    if (!user_profile.success) {
      return res.status(500).json({
        success: false,
        message: user_profile.message || "Something went wrong",
      });
    }
    if (!user_profile.user) {
      return res.status(500).json({
        success: false,
        message: "Profile Not Found",
      });
    }

    return res.status(200).json({
      success: true,
      profile: user_profile.user || null,
    });
  } catch (err) {
    console.error("❌ Error in getSelfUserProfile:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ comes from authMiddleware
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update profile",
      });
    }

    // check if user profile exists (optional)
    const user_profile = await findUserProfileById(userId);

    if (!user_profile.success) {
      return res.status(500).json({
        success: false,
        message: user_profile.message || "Something went wrong",
      });
    }

    if (!user_profile.user) {
      const updated_data = await createUserProfile({
        ...data,
        id: userId, // ensure ID is always included
      });

      return res.status(200).json({
        success: true,
        message: "Profile created successfully",
        profile: updated_data.user,
      });
    } else {
      const updated_data = await updateUserProfileById(userId, {
        ...data,
      });
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        profile: updated_data.user,
      });
    }
  } catch (err) {
    console.error("❌ Error in updateUserProfile:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    // check if profile exists
    const user_profile = await findUserProfileById(userId);
    if (!user_profile.success) {
      return res.status(500).json({
        success: false,
        message:
          user_profile.message || "Something went wrong while checking profile",
      });
    }

    // delete user first
    const delete_user = await deleteUserById(userId);
    if (!delete_user.success) {
      return res.status(500).json({
        success: false,
        message: delete_user.message || "Failed to delete user",
      });
    }

    // if profile exists, delete profile as well
    if (user_profile.user) {
      const delete_user_profile = await deleteUserProfileById(userId);

      if (!delete_user_profile.success) {
        return res.status(500).json({
          success: false,
          message:
            delete_user_profile.message || "Failed to delete user profile",
        });
      }
    }

    // ✅ Both succeeded
    return res.status(200).json({
      success: true,
      message: "Account Deletion Successful",
    });
  } catch (error) {
    console.error("❌ Error in deleteUser:", error.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = {
  getSelfUserProfile,
  getUserProfileById,
  updateUserProfile,
  deleteUser,
};
