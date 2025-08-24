const express = require("express");
const router = express.Router();

const {
  registerUser,
  resendOtp,
  verifyOtpController,
} = require("../controllers/authController");

// Example: GET /api/auth
router.post("/register", registerUser);

router.post("/resend-otp", resendOtp);

router.post("/verify-otp", verifyOtpController);

module.exports = router;
