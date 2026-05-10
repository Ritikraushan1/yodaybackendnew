const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getSelfUserProfile,
  getUserProfileById,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");
const {
  blockUserHandler,
  unblockUserHandler,
  getBlockedUsersHandler,
  checkBlockStatusHandler,
} = require("../controllers/userBlockController");

router.get("/profile", authMiddleware, getSelfUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/profile", authMiddleware, deleteUser);
router.get("/profile/:id", authMiddleware, getUserProfileById);

// User Block Routes
router.post("/block", authMiddleware, blockUserHandler);
router.post("/unblock", authMiddleware, unblockUserHandler);
router.get("/blocked-list", authMiddleware, getBlockedUsersHandler);
router.get("/block-status/:userId", authMiddleware, checkBlockStatusHandler);

module.exports = router;

