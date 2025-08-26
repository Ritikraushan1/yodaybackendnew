const { verifyToken } = require("../utils/jwtUtil");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // Token should be in format: "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded.valid) {
      return res
        .status(403)
        .json({ message: "Access Denied.Invalid or expired token." });
    }
    if (decoded.expired) {
      return res.status(403).json({ message: "Access Denied. Expired token." });
    }

    // Attach user info to request (can be used later in controllers)
    req.user = decoded.decoded;

    next(); // go to next middleware or route
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
