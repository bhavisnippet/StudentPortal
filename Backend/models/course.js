const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    price: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    // Relationship with User (Teacher)
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    // Relationship with User (Admin)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model("Course", courseSchema);
