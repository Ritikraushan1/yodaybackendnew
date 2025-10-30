const { getAdminByEmail } = require("../models/adminModel");

const STATIC_OTP = "123456";

exports.showLogin = (req, res) => {
  res.render("admin/login.njk", { title: "Admin Login", step: "email" });
};

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

    // Move to OTP step
    res.render("admin/login.njk", {
      email: admin.email,
      title: "Verify OTP",
      message: `Use static OTP: ${STATIC_OTP}`,
      step: "otp",
    });
  } catch (err) {
    console.error("Error in handleLogin:", err);
    res.status(500).send("Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (otp === STATIC_OTP) {
    const admin = await getAdminByEmail(email);

    if (admin) {
      req.session.admin = admin;
      return res.redirect("/admin/dashboard");
    }
  }

  res.render("admin/login.njk", {
    email,
    error: "Invalid OTP",
    title: "Verify OTP",
    step: "otp",
  });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
};
