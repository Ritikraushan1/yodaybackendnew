const { v4: uuidv4 } = require("uuid");
const { insertOtpLog } = require("../models/otpModel");

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

module.exports = { sendOtp };
