const { v4: uuidv4 } = require("uuid");
const { findUserByMobile, registerNewUser } = require("../models/authModel");
const { findUserProfileById } = require("../models/userProfileModel");
const { sendOtp, verifyOtp } = require("../utils/otpUtil");
const { generateToken } = require("../utils/jwtUtil");

const registerUser = async (req, res) => {
  console.log("👉 Auth controller login hit");
  console.log("Request body:", req.body);

  const { country_code, mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }
  try {
    const { success, user, status, message } = await findUserByMobile(
      mobile_number
    );

    if (user) {
      const otpResult = await sendOtp({ mobile_number, country_code });

      if (otpResult.status !== "success") {
        return res
          .status(500)
          .json({ success: false, message: otpResult.message });
      }

      return res.status(200).json({
        success: true,
        new_registration: false,
        transaction_id: otpResult.transaction_id,
        otp: otpResult.otp,
        message: `Welcome! An OTP has been sent to ${country_code}-${mobile_number} for verification.`,
      });
    } else {
      const registerResult = await registerNewUser({
        mobile_number,
        country_code,
      });

      if (!registerResult.success) {
        return res.status(registerResult.status).json({
          success: false,
          message: "Failed to register your number. Please try again.",
        });
      }
      const otpResult = await sendOtp({ mobile_number, country_code });

      if (otpResult.status !== "success") {
        return res
          .status(500)
          .json({ success: false, message: otpResult.message });
      }
      return res.status(201).json({
        success: true,
        new_registration: true,
        transaction_id: otpResult.transaction_id,
        otp: otpResult.otp,
        message: `Welcome! An OTP has been sent to ${country_code}-${mobile_number} for verification.`,
      });
    }
  } catch (error) {
    console.log("error message", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our side. Please try again later.",
    });
  }
};

const resendOtp = async (req, res) => {
  console.log("👉 Auth controller login hit");
  console.log("Request body:", req.body);
  const { country_code, mobile_number } = req.body;

  if (!mobile_number) {
    return res.status(400).json({
      success: false,
      message: "Mobile number is required",
    });
  }
  const { success, user, status, message } = await findUserByMobile(
    mobile_number
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "No user found with this mobile number",
    });
  } else {
    const otpResult = await sendOtp({ mobile_number, country_code });

    if (otpResult.status !== "success") {
      return res
        .status(500)
        .json({ success: false, message: otpResult.message });
    }
    return res.status(200).json({
      success: true,
      new_registration: false,
      transaction_id: otpResult.transaction_id,
      otp: otpResult.otp,
      message: `Welcome! An OTP has been sent to ${country_code}-${mobile_number} for verification.`,
    });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { country_code, transaction_id, mobile_number, otp } = req.body;

    // Validate required fields
    if (!transaction_id) {
      return res
        .status(400)
        .json({ status: "failed", message: "transaction_id is required" });
    }
    if (!mobile_number) {
      return res
        .status(400)
        .json({ status: "failed", message: "mobile_number is required" });
    }
    if (!otp) {
      return res
        .status(400)
        .json({ status: "failed", message: "otp is required" });
    }

    // Call service
    const result = await verifyOtp({ transaction_id, mobile_number, otp });

    if (result.status === "failed") {
      return res.status(400).json(result); // validation/OTP failure
    }

    const { success, user, status, message } = await findUserByMobile(
      mobile_number
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user found with this mobile number",
      });
    }

    const token = await generateToken(user.id);

    const user_profile = await findUserProfileById(user.id);
    console.log("user_profile", user_profile);

    let response = {
      status: result?.status,
      message: result?.message,
      id: user.id,
      token: token,
      update_profile: !user_profile.user, // ✅ true if no profile found
      profile: user_profile.user || null,
    };

    return res.status(200).json(response); // OTP verified successfully
  } catch (err) {
    console.error("Error in verifyOtpController:", err);
    return res.status(500).json({
      status: "failed",
      message: "Internal server error while verifying OTP",
    });
  }
};

module.exports = { registerUser, resendOtp, verifyOtpController };
