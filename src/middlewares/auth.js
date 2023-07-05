const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next, accountType) => {
  const token = (req.headers.authentication || "").replace(/Bearer\s?/, "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      if (decoded.accountType !== accountType) {
        return res
          .status(403)
          .json({ msg: "Your account type has no access to this resource!" });
      }
      req.body.userId = decoded.userId;
      next();
    } catch (err) {
      return res.status(403).json({ msg: "User verification failed!" });
    }
  } else {
    return res
      .status(403)
      .json({ msg: "You have no access to this resource!" });
  }
};

const checkPatientAuth = (req, res, next) => {
  checkAuth(req, res, next, "patient");
};

const checkDoctorAuth = (req, res, next) => {
  checkAuth(req, res, next, "doctor");
};

exports.checkPatientAuth = checkPatientAuth;
exports.checkDoctorAuth = checkDoctorAuth;
