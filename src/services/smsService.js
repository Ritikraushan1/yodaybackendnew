require("dotenv").config();
const axios = require("axios");

async function sendOtpToMobile(otp, mobileNumber) {
  try {
    const url = process.env.SMS_BASE_URL;

    const params = {
      "authentic-key": process.env.SMS_AUTH_KEY,
      senderid: process.env.SMS_SENDER_ID,
      route: process.env.SMS_ROUTE,
      number: mobileNumber,
      message: `Your otp for login in YODAY App is ${otp}. Do not share it with anyone. - YODAY APP`,
      templateid: process.env.SMS_TEMPLATE_ID,
    };

    const response = await axios.post(url, null, { params });

    console.log("SMS API Response:", response.data);

    // 👉 CORRECT SUCCESS CHECK
    if (
      response.data &&
      (response.data.Status === "Success" || response.data.Code === "000")
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    return false;
  }
}

module.exports = { sendOtpToMobile };
