const User = require("../models/user");
const jwt = require("jsonwebtoken");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

// REGISTER ✅
exports.register = async (req, res) => {
  try {
    const { name, age, gender, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      name,
      age,
      gender,
      email,
      password,
      phone,
      role,
    });

    await user.save();
    res.status(201).json({
      message: "User registered.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN ✅
exports.login = async (req, res) => {
  try {
    // Receive email and password
    const { email, password } = req.body;
    // Find user by email and password
    const user = await User.findOne({ email }).select("+password");
    // Compare password
    if (!user || !(await user.comparePassword(password))) {
      console.log("Invalid email or password");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    // Check account status
    if (user.status !== "Active") {
      return res.status(401).json({
        error: "Account Blocked",
      });
    }

    // Generate Tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refreshToken in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send acccessToken and refreshToken in Cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send Response
    res.json({
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ME
exports.me = async (req, res) => {
  res.status(200).json({ message: "Hii I'm Protected Route" });
};

// REFRESH TOKEN
exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // ✅ Create new access token
    const newAccessToken = generateAccessToken(user._id);

    // ✅ Store in cookie (IMPORTANT)
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: "Access token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  res.json({ message: "Logged out successfully" });
};
