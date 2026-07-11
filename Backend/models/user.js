const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    age: {
      type: Number,
      required: false,
      min: 16,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/,
    },

    password: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      minlength: 8,
      select: false, // 🔐 hide password by default
    },
    phone: {
      type: String,
      match: /^[0-9]{10}$/,
    },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    refreshToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: String,
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    emailVerificationToken: String,

    emailVerificationExpires: Date,
  },
  { timestamps: true },
);

// Password Hashing + Salt
userSchema.pre("save", async function () {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, salt);
  user.password = hashedPassword;
});

userSchema.methods.comparePassword = async function (userPassword) {
  try {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);
