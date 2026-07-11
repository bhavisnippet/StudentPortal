const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const {
  register,
  login,
  verifyEmail,
  refreshToken,
  logout,
  google,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  google,
);
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Protected Route
router.get("/protected", protect, (req, res) => {
  console.log(req.cookies);
  res.json({ message: "Hii, I'm Protected Route!" });
});

// Admin Example
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin only route" });
});

// Me route
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json({
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  });
});

module.exports = router;
