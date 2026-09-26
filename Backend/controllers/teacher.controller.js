const User = require("../models/user");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateTokens");

// Create Teacher
exports.createTeacher = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: "teacher",
    });
    res.status(201).json({
      success: true,
      message: "Teacher created successfully.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// View Teachers
exports.viewTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).select(
      "_id name email status createdAt",
    );
    res.status(200).json({ success: true, teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// Update Teacher
exports.updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const { name, email, status } = req.body;
    // 1. Find teacher
    const teacher = await User.findById(teacherId);
    //  2 Teacher exists?
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher Not Exists" });
    }
    // 3. Email already used by another user?
    if (email && email !== teacher.email) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }
    // 4. Update only allowed fields
    if (name) teacher.name = name;
    if (email) teacher.email = email;
    if (status) teacher.status = status;
    // 5. Save
    await teacher.save();
    // 6. Response
    res
      .status(200)
      .json({ success: true, message: "Teacher updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
// Delete Teacher
exports.deactivateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    // 1. Find teacher
    const teacher = await User.findById(teacherId);
    //  2. Teacher exists?
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher Not Exists" });
    }
    // 3. Check Already inactive
    if (teacher.status == "Inactive") {
      return res.status(400).json({
        message: "Teacher is already inactive.",
      });
    }
    // 4. Set stauts inactive
    teacher.status = "Inactive";
    // 5. Save teacher
    await teacher.save();
    // 6. Response
    res.status(200).json({
      success: true,
      message: "Teacher deactivated successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
