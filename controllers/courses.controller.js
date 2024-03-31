// Second way to create courses
const { validationResult } = require("express-validator");
const Course = require("../models/course.model");
const httpStatusText = require("../utils/httpStatusText");
const asyncWrapper = require("../middlewares/asyncWrapper");
const appError = require("../utils/appError");

// -------- ex2 with async wrapper --------
const getAllCourses = asyncWrapper(async (req, res) => {
  const query = req.query;
  // console.log("query", query);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
});

const getCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId, { __v: false });
  if (!course) {
    const error = appError.create("not found course", 404, httpStatusText.FAIL);
    return next(error);
  }
  return res.json({ status: httpStatusText.SUCCESS, data: { course } });
});

const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatusText.FAIL);
    return next(error);
  }
  const newCourse = new Course(req.body);
  await newCourse.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { course: newCourse } }); // 201: Created successfully
});
const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;

  const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
    new: true,
  });

  return res.json({
    status: httpStatusText.SUCCESS,
    data: { course: updatedCourse },
  });
});
const deleteCourse = asyncWrapper(async (req, res, next) => {
  const result = await Course.deleteOne({ _id: req.params.courseId });

  if (result.deletedCount === 0) {
    const error = appError.create("Course not found", 404, httpStatusText.FAIL);
    return next(error);
  }

  // Document was deleted successfully
  return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

// -------- ex1 without middleware --------
/*
const getAllCourses = async (req, res) => {
  // Get all courses from DB using Course model
  const query = req.query;
  console.log("query", query);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { courses } });
};
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId, { __v: false });
    if (!course) {
      return res
        .status(404) // not found
        .json({ status: httpStatusText.FAIL, data: { course: null } });
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { course } });
  } catch (err) {
    return res.status(400).json({
      //bad request
      status: httpStatusText.ERROR,
      data: null,
      message: err.message,
      code: 400,
    });
  }
};
const addCourse = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, data: errors.array() }); //bad request
  }
  const newCourse = new Course(req.body);
  await newCourse.save();
  res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { course: newCourse } }); // 201: Created successfully
};
const updateCourse = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    // const updatedCourse = await Course.updateOne({ _id: courseId },{$set: { ...req.body },});
    const updatedCourse = await Course.findByIdAndUpdate(courseId, req.body, {
      new: true,
    });
    return res.json({
      status: httpStatusText.SUCCESS,
      data: { course: updatedCourse },
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: httpStatusText.FAIL, message: error.message });
  }
};
const deleteCourse = async (req, res) => {
  // await Course.deleteOne({ _id: req.params.courseId });
  // res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
  try {
    const result = await Course.deleteOne({ _id: req.params.courseId });

    if (result.deletedCount === 0) {
      // No document was deleted, indicating that the provided ID doesn't exist
      return res.status(404).json({
        status: httpStatusText.FAIL,
        message: "Course not found",
      });
    }

    // Document was deleted successfully
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
  } catch (error) {
    // Handle other errors such as database errors
    return res
      .status(500)
      .json({ status: httpStatusText.ERROR, message: error.message });
  }
};
*/
module.exports = {
  getAllCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
