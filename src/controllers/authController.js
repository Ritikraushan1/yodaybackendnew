const { v4: uuidv4 } = require("uuid");
const { findUserByMobile, registerNewUser } = require("../models/authModel");
const { sendOtp } = require("../utils/otpUtil");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

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

  // For now, just a mock response
  res.json({ message: "Login logic will go here 🚀" });
};

const resendOtp = (req, res) => {
  console.log("👉 Auth controller login hit");
  console.log("Request body:", req.body);

  // For now, just a mock response
  res.json({ message: "Login logic will go here 🚀" });
};

const verifyOtp = (req, res) => {
  res.json({ message: "Login logic will go here 🚀" });
};

module.exports = { registerUser, resendOtp, verifyOtp };
