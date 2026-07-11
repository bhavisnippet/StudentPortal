const User = require("../models/user");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

// google callback
exports.google = async (req, res) => {
  const user = req.user;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.redirect("http://localhost:5500/Frontend/Home.html");
};
// REGISTER
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
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    const verifyURL = `${process.env.CLIENT_URL}/api/auth/verify-email?token=${rawToken}`;
    const message = `
      <h2>Email Verification</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verifyURL}">Verify Email</a>
    `;

    await sendEmail(user.email, "Verify Your Email", message);

    res.status(201).json({
      message: "User registered. Please verify your email.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;

    user.emailVerificationToken = undefined;

    user.emailVerificationExpires = undefined;

    await user.save();

    res.redirect("http://localhost:5500/Frontend/index.html");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      console.log("Invalid email or password");
      return res.status(401).json({ error: "Invalid email or password" });
    }
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email first",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

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

    res.json({
      message: "Login successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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
