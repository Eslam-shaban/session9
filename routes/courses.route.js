const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courses.controller");
const { validationSchema } = require("../middlewares/validationSchema");
const verifyToken = require("../middlewares/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middlewares/allowedTo");
// CRUD (Create / Read / Update / Delete)

router
  .route("/")
  .get(verifyToken, courseController.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.MANAGER),
    validationSchema(),
    courseController.addCourse
  );

router
  .route("/:courseId")
  .get(courseController.getCourse)
  .patch(courseController.updateCourse)
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    courseController.deleteCourse
  );

module.exports = router;
