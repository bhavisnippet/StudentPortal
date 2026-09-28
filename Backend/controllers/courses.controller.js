const User = require("../models/user");
const Course = require("../models/course");

// Create Course
exports.createCourse = async (req, res) => {
  const {
    title,
    description,
    category,
    duration,
    price,
    thumbnail,
    teacherId,
  } = req.body;

  try {
    // 1. Validate required fields
    if (!title || !description || !category || !duration) {
      return res.status(400).json({
        message: "Title, description, category and duration are required",
      });
    }

    // 2. Check duplicate course title
    const titleExists = await Course.findOne({ title });
    if (titleExists) {
      return res.status(400).json({
        message: "Course title already exists",
      });
    }

    if (teacherId) {
      const teacher = await User.findById(teacherId);
      // Teacher doesn't exist
      if (!teacher) {
        return res.status(404).json({
          message: "Teacher not found",
        });
      }

      // User exists but is not a teacher
      if (teacher.role !== "teacher") {
        return res.status(400).json({
          message: "Selected user is not a teacher",
        });
      }

      // Teacher exists but is inactive
      if (teacher.status !== "Active") {
        return res.status(400).json({
          message: "Teacher is inactive",
        });
      }
    }

    // 4. Create course
    const course = await Course.create({
      title,
      description,
      category,
      duration,
      price: price || 0,
      thumbnail,
      teacherId,
      status: "Draft",
      createdBy: req.user.id,
    });

    // 5. Success response
    return res.status(201).json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// View Courses
exports.viewCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Update Course
exports.updateCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // 1. Find the course
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // 2. Get update data
    const {
      title,
      description,
      category,
      duration,
      price,
      thumbnail,
      teacherId,
    } = req.body;

    // 3. Check duplicate title
    if (title && title !== existingCourse.title) {
      const titleExists = await Course.findOne({
        title,
        _id: { $ne: courseId },
      });

      if (titleExists) {
        return res.status(400).json({
          message: "Course title already exists",
        });
      }
    }

    // 4. Validate teacher if teacherId is provided
    if (teacherId) {
      const teacher = await User.findById(teacherId);

      if (!teacher) {
        return res.status(404).json({
          message: "Teacher not found",
        });
      }

      if (teacher.role !== "teacher") {
        return res.status(400).json({
          message: "Selected user is not a teacher",
        });
      }

      if (teacher.status !== "Active") {
        return res.status(400).json({
          message: "Teacher is inactive",
        });
      }

      existingCourse.teacherId = teacherId;
    }

    // 5. Update allowed fields
    if (title) existingCourse.title = title;
    if (description) existingCourse.description = description;
    if (category) existingCourse.category = category;
    if (duration) existingCourse.duration = duration;
    if (price !== undefined) existingCourse.price = price;
    if (thumbnail !== undefined) existingCourse.thumbnail = thumbnail;

    // 6. Save course
    await existingCourse.save();

    // 7. Response
    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course: existingCourse,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // 1. Find the course and delete
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

//Publish Course
exports.publishCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const existingCourse = await Course.findById(courseId);
    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (existingCourse.teacherId == null) {
      return res.status(400).json({
        message: "Course must have an assigned teacher",
      });
    }

    const teacher = await User.findById(existingCourse.teacherId);

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not exist",
      });
    }

    if (teacher.role !== "teacher") {
      return res.status(400).json({
        message: "Assigned teacher is not a Techer",
      });
    }

    if (teacher.status !== "Active") {
      return res.status(400).json({
        message: "Assigned teacher is inactive",
      });
    }

    if (existingCourse.status === "Published")
      return res.status(400).json({
        message: "Course is already published",
      });

    existingCourse.status = "Published";
    await existingCourse.save();
    res.status(200).json({
      message: "Course Published successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

// Archive Course
exports.archiveCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const existingCourse = await Course.findById(courseId);

    if (!existingCourse) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (existingCourse.status === "Archived") {
      return res.status(400).json({
        message: "Course already archived",
      });
    }

    if (existingCourse.status !== "Published") {
      return res.status(400).json({
        message: "Only published courses can be archived",
      });
    }

    existingCourse.status = "Archived";
    await existingCourse.save();
    res.status(200).json({
      message: "Course Archived successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
