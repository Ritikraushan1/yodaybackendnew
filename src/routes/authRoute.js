const express = require("express");
const router = express.Router();

const {
  registerUser,
  resendOtp,
  verifyOtp,
} = require("../controllers/authController");

// Example: GET /api/auth
router.post("/register", registerUser);

router.post("/resend-otp", resendOtp);

router.post("/verify-otp", verifyOtp);

module.exports = router;
