const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getSelfUserProfile,
  getUserProfileById,
  updateUserProfile,
  deleteUser,
} = require("../controllers/userController");

router.get("/profile", authMiddleware, getSelfUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);
router.delete("/profile", authMiddleware, deleteUser);
router.get("/profile/:id", authMiddleware, getUserProfileById);

module.exports = router;
