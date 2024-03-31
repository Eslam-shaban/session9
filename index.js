require("dotenv").config();
const express = require("express");
const app = express();
const httpStatusText = require("./utils/httpStatusText");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const url = process.env.MONGO_URL;
mongoose.connect(url).then(() => console.log("db Connected!"));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use(cors());
// middleware for body parser in express
app.use(express.json());
// routes
const coureseRouter = require("./routes/courses.route");
app.use("/api/courses", coureseRouter); // url: /api/courses
const usersRouter = require("./routes/users.route");
app.use("/api/users", usersRouter); // url: /api/users

// global middleware for not found router
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: "resourse is not avaliable",
  });
});
// global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    data: null,
    code: error.statusCode || 500,
  });
});

app.listen(process.env.PORT, () => {
  console.log("listening on port: 5000");
});
