const { v4: uuidv4 } = require("uuid");
const { insertOtpLog, getOtp, markOtpVerified } = require("../models/otpModel");

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async ({ mobile_number, country_code = "+91" }) => {
  const otp = generateOtp();
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

  // TODO: integrate SMS service here
  console.log("👉 OTP ready to send:", otp);

  return { status: "success", transaction_id, otp };
};
const verifyOtp = async ({ transaction_id, mobile_number, otp }) => {
  try {
    // 1. Fetch the pending OTP
    const otpResult = await getOtp({ transaction_id, mobile_number });

    if (!otpResult.success) {
      return {
        status: "failed",
        message: "No pending OTP found or it may have expired.",
      };
    }

    const storedOtp = otpResult.data.otp;

    // 2. Compare
    if (storedOtp !== otp) {
      return {
        status: "failed",
        message: "Invalid OTP. Please try again.",
      };
    }

    // 3. Mark OTP as verified
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
    return {
      status: "failed",
      message: "An error occurred while verifying OTP.",
    };
  }
};

module.exports = { sendOtp, verifyOtp };
