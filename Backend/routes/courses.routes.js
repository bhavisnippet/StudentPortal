const express = require("express");
const router = express.Router();
const {
  createCourse,
  viewCourses,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
} = require("../controllers/courses.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.post("/createCourse", protect, authorize("admin"), createCourse);
router.get("/viewCourses", protect, authorize("admin"), viewCourses);
router.patch(
  "/updateCourse/:courseId",
  protect,
  authorize("admin"),
  updateCourse,
);
router.patch(
  "/deleteCourse/:courseId",
  protect,
  authorize("admin"),
  deleteCourse,
);
router.patch(
  "/publishCourse/:courseId",
  protect,
  authorize("admin"),
  publishCourse,
);

router.patch(
  "/archiveCourse/:courseId",
  protect,
  authorize("admin"),
  archiveCourse,
);
module.exports = router;
