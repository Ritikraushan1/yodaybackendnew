const express = require("express");
const router = express.Router();

const {
  registerUser,
  resendOtp,
  verifyOtpController,
  facebookLoginController,
  refreshTokenController,
} = require("../controllers/authController");

// Example: GET /api/auth
router.post("/register", registerUser);

router.post("/resend-otp", resendOtp);

router.get("/refresh", refreshTokenController);

router.post("/verify-otp", verifyOtpController);

router.post("/facebook-login", facebookLoginController);

module.exports = router;
