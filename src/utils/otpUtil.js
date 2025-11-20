const { v4: uuidv4 } = require("uuid");
const { insertOtpLog, getOtp, markOtpVerified } = require("../models/otpModel");
const { sendOtpToMobile } = require("../services/smsService");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async ({ mobile_number, country_code = "+91" }) => {
  // 👉 FIX: special OTP for specific test number
  const otp = mobile_number === "7632049117" ? "123456" : generateOtp();

  const transaction_id = uuidv4();

  // Insert OTP log in DB
  const result = await insertOtpLog({
    mobile_number,
    country_code,
    otp,
    transaction_id,
  });

  if (!result.success) {
    return {
      status: "failed",
      transaction_id: null,
      otp: null,
      message: "Failed to send OTP. Try again Later",
    };
  }

  const smsSent = await sendOtpToMobile(otp, mobile_number);

  if (!smsSent) {
    return {
      status: "failed",
      transaction_id,
      otp: null,
      message: "Failed to send OTP SMS. Please try again.",
    };
  }

  return { status: "success", transaction_id, otp };
};
const verifyOtp = async ({ transaction_id, mobile_number, otp }) => {
  try {
    // 1. Fetch the pending OTP (including created_at timestamp)
    const otpResult = await getOtp({ transaction_id, mobile_number });

    if (!otpResult.success || !otpResult.data) {
      return {
        status: "failed",
        message: "No pending OTP found or it may have expired.",
      };
    }

    const { otp: storedOtp, created_at } = otpResult.data;

    // 2. Check if OTP expired (1 min = 60,000 ms)
    const now = Date.now();
    const otpAge = now - new Date(created_at).getTime();

    if (otpAge > 60 * 1000) {
      return {
        status: "failed",
        message: "OTP expired. Please request a new one.",
      };
    }

    // 3. Compare OTP
    if (storedOtp !== otp) {
      return {
        status: "failed",
        message: "Invalid OTP. Please try again.",
      };
    }

    // 4. Mark OTP as verified
    const updateResult = await markOtpVerified({
      transaction_id,
      mobile_number,
      otp,
    });

    if (!updateResult.success) {
      return {
        status: "failed",
        message: "Could not verify OTP. It may have already been used.",
      };
    }

    return {
      status: "success",
      message: "OTP verified successfully.",
    };
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return {
      status: "failed",
      message: "An error occurred while verifying OTP.",
    };
  }
};

module.exports = { sendOtp, verifyOtp };
