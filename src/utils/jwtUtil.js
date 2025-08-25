const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // payload
    process.env.JWT_SECRET, // secret key from .env
    { expiresIn: "7d" } // token expiry: 7 days
  );
};

const verifyToken = (token) => {
  try {
    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If valid, return the decoded payload (e.g., { userId, iat, exp })
    return { valid: true, expired: false, decoded };
  } catch (error) {
    return {
      valid: false,
      expired: error.name === "TokenExpiredError",
      decoded: null,
    };
  }
};

module.exports = { generateToken, verifyToken };
