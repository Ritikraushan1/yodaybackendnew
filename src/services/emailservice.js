const nodemailer = require("nodemailer");

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // e.g. smtp.gmail.com
  port: process.env.EMAIL_PORT || 587, // 587 for TLS
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email to admin
 * @param {string} toEmail
 * @param {string} otpCode
 */
async function sendOtpEmail(toEmail, otpCode) {
  try {
    const mailOptions = {
      from: `"Admin Panel" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Your Admin Login OTP",
      html: `
        <h2>Admin Login Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="letter-spacing: 3px;">${otpCode}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 OTP sent:", info.messageId);
    return true;
  } catch (err) {
    console.error("❌ Error sending OTP email:", err.message);
    return false;
  }
}

module.exports = { sendOtpEmail };
