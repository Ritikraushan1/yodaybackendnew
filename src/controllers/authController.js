const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const {
  findUserByMobile,
  registerNewUser,
  findUserByFacebookId,
  registerFacebookUser,
  updateFacebookUser,
  findUserById,
} = require("../models/authModel");
const {
  findUserProfileById,
  createUserProfile,
} = require("../models/userProfileModel");
const { sendOtp, verifyOtp } = require("../utils/otpUtil");
const { generateToken } = require("../utils/jwtUtil");
const axios = require("axios");

const registerUser = async (req, res) => {
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
    console.error("error message", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong on our side. Please try again later.",
    });
  }
};

const resendOtp = async (req, res) => {
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

const refreshTokenController = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token without throwing error
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ login_again: true, message: "Token expired" });
      } else {
        return res
          .status(401)
          .json({ login_again: true, message: "Invalid token" });
      }
    }

    // Check if user still exists
    const { success, user, status, message } = await findUserById(
      decoded.userId
    );
    if (!user) {
      return res
        .status(401)
        .json({ login_again: true, message: "User not found" });
    }

    // Generate new token
    const newToken = await generateToken(user.id);

    return res.status(200).json({
      success: true,
      id: user.id,
      token: newToken,
      login_again: false,
    });
  } catch (err) {
    console.error("Error in refreshTokenController:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const facebookLoginController = async (req, res) => {
  try {
    const { access_token, device_info } = req.body;

    // 🔹 Step 1: Validate request
    if (!access_token) {
      return res
        .status(400)
        .json({ success: false, message: "Facebook access token is required" });
    }

    // 🔹 Step 2: Verify token with Facebook Graph API
    const fbResponse = await axios.get("https://graph.facebook.com/me", {
      params: {
        fields: "id,name,email,picture",
        access_token,
      },
    });

    const fbUser = fbResponse.data;

    if (!fbUser.id) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Facebook token" });
    }

    // 🔹 Step 3: Find user in DB by Facebook ID
    let { user } = await findUserByFacebookId(fbUser.id);

    if (!user) {
      // 🆕 Case A: New user → register
      const registerResult = await registerFacebookUser({
        facebook_id: fbUser.id,
        facebook_token: access_token,
        email_id: fbUser.email || null,
        ...device_info,
      });

      if (!registerResult.success) {
        return res.status(500).json({
          success: false,
          message: "Failed to register Facebook user",
        });
      }

      user = registerResult.user;

      // Create profile for the new user
      await createUserProfile({
        id: user.id,
        name: fbUser.name,
        email: fbUser.email || null,
        avatar: fbUser.picture?.data?.url || null,
        mobile_number: "",
        type: "user",
      });
    } else {
      // 🔄 Case B: Existing user → update token & device info
      const updateResult = await updateFacebookUser(fbUser.id, {
        facebook_token: access_token,
        ...device_info,
      });

      if (!updateResult.success) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to update Facebook user" });
      }

      user = updateResult.user;
    }

    // 🔹 Step 4: Generate JWT
    const token = await generateToken(user.id);

    // 🔹 Step 5: Fetch user profile
    let user_profile = await findUserProfileById(user.id);

    if (!user_profile.user) {
      // Profile doesn’t exist → create one using Facebook data
      await createUserProfile({
        id: user.id,
        name: fbUser.name,
        email: fbUser.email || null,
        avatar: fbUser.picture?.data?.url || null,
        mobile_number: "",
        type: "user",
      });

      user_profile = await findUserProfileById(user.id);
    }

    // 🔹 Step 6: Response
    return res.status(200).json({
      success: true,
      id: user.id,
      token,
      update_profile: !user_profile, // true if no profile found
      profile: user_profile?.user,
    });
  } catch (err) {
    console.error(
      "❌ Facebook login error:",
      err.response?.data || err.message
    );
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  resendOtp,
  verifyOtpController,
  facebookLoginController,
  refreshTokenController,
};
