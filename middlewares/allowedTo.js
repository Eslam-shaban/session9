const appError = require("../utils/appError");

module.exports = (...roles) => {
  //   console.log("roles", roles);
  return (req, res, next) => {
    // console.log("user role", req.currentUser.role);
    if (!roles.includes(req.currentUser.role)) {
      next(appError.create("this role is not autherized", 401));
    }
    next();
  };
};
