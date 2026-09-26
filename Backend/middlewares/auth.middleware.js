const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  try {
    // Check token exists
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check user is active
    if (user.status !== "Active") {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.message,
    });
  }
};
