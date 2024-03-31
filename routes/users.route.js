const express = require("express");
const router = express.Router();
const userController = require("../controllers/users.controller");
const verifyToken = require("../middlewares/verifyToken");
const appError = require("../utils/appError");

const multer = require("multer");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("FILE", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const fileType = file.mimetype.split("/")[0];
  if (fileType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("file must be an image", 400), false);
  }
};
const upload = multer({
  storage: diskStorage,
  fileFilter,
});

// const upload = multer({ dest: "/uploads" });

router.route("/").get(verifyToken, userController.getAllUsers);

router
  .route("/register")
  .post(upload.single("avatar"), userController.register);

router.route("/login").post(userController.login);

module.exports = router;
