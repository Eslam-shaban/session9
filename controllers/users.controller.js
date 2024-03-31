const asyncWrapper = require("../middlewares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const User = require("../models/user.model");
const appError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateJWT = require("../utils/generateJWT");

const getAllUsers = asyncWrapper(async (req, res) => {
  // console.log(req.headers);
  const query = req.query;
  // console.log("query", query);

  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;
  const users = await User.find({}, { __v: false, password: false })
    .limit(limit)
    .skip(skip);
  res.json({ status: httpStatusText.SUCCESS, data: { users } });
});

const register = asyncWrapper(async (req, res, next) => {
  // console.log(req.body);
  // console.log("req.file=>", req.file);
  const { firstName, lastName, email, password, role } = req.body;
  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    const err = appError.create(
      "user already exists",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }
  // password hashing
  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role,
    avatar: req.file.filename,
  });
  //generate JWT token
  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role,
  });
  newUser.token = token;
  // console.log(token);
  await newUser.save();
  return res
    .status(201)
    .json({ status: httpStatusText.SUCCESS, data: { user: newUser } });
});
const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email && !password) {
    const err = appError.create(
      "email and password are required",
      400,
      httpStatusText.FAIL
    );
    return next(err);
  }
  const user = await User.findOne({ email: email });
  // console.log(user);
  if (!user) {
    const err = appError.create("user not found", 400, httpStatusText.FAIL);
    return next(err);
  }
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (user && matchedPassword) {
    const token = await generateJWT({
      email: user.email,
      id: user._id,
      role: user.role,
    });

    return res.json({
      status: httpStatusText.SUCCESS,
      data: { token },
    });
  } else {
    const err = appError.create(
      "user not something wrong",
      500,
      httpStatusText.ERROR
    );
    return next(err);
  }
});

module.exports = {
  getAllUsers,
  register,
  login,
};
