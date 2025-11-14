const { getAdminByEmail } = require("../models/adminModel");
const { saveAdminOtp, getLatestAdminOtp } = require("../models/adminOtpModel");
const { sendOtpEmail } = require("../services/emailservice");

// Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show login page
exports.showLogin = (req, res) => {
  res.render("admin/login.njk", { title: "Admin Login", step: "email" });
};

// Handle email submission
exports.handleLogin = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await getAdminByEmail(email);

    if (!admin || admin.status !== "active") {
      return res.render("admin/login.njk", {
        error: "No active admin found",
        title: "Admin Login",
        step: "email",
      });
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes

    // Save OTP in database
    await saveAdminOtp(admin.id, otp, expiresAt);

    // Send OTP Email
    await sendOtpEmail(admin.email, otp);

    // Move to OTP step
    res.render("admin/login.njk", {
      email: admin.email,
      title: "Verify OTP",
      message: "An OTP has been sent to your email.",
      step: "otp",
    });
  } catch (err) {
    console.error("❌ Error in handleLogin:", err);
    res.status(500).send("Server error");
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const admin = await getAdminByEmail(email);
    if (!admin) {
      return res.render("admin/login.njk", {
        email,
        error: "Invalid admin",
        title: "Verify OTP",
        step: "otp",
      });
    }

    // Get latest OTP from DB
    const latestOtp = await getLatestAdminOtp(admin.id);

    if (!latestOtp) {
      return res.render("admin/login.njk", {
        email,
        error: "OTP not found. Please request again.",
        title: "Verify OTP",
        step: "otp",
      });
    }

    const now = new Date();

    // Check OTP validity
    if (
      latestOtp.otp_code === otp &&
      now < new Date(latestOtp.otp_expires_at)
    ) {
      // OTP success → Login admin
      req.session.admin = admin;
      return res.redirect("/admin/dashboard");
    }

    // Invalid or expired OTP
    return res.render("admin/login.njk", {
      email,
      error: "Invalid or expired OTP",
      title: "Verify OTP",
      step: "otp",
    });
  } catch (err) {
    console.error("❌ Error in verifyOtp:", err);
    res.status(500).send("Server error");
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};
