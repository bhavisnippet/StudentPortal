const express = require("express");
const router = express.Router();
const {
  createTeacher,
  viewTeachers,
  updateTeacher,
  deactivateTeacher,
} = require("../controllers/teacher.controller");

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

router.post("/createTeacher", protect, authorize("admin"), createTeacher);
router.get("/viewteachers", protect, authorize("admin"), viewTeachers);
router.patch(
  "/updateTeacher/:teacherId",
  protect,
  authorize("admin"),
  updateTeacher,
);
router.patch(
  "/deactivateTeacher/:teacherId",
  protect,
  authorize("admin"),
  deactivateTeacher,
);

module.exports = router;
