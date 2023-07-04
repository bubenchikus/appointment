import jwt from "jsonwebtoken";

const checkAuth = (req, res, next) => {
  const token = (req.headers.authentication || "").replace(/Bearer\s?/, "");

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET);
      req.body.userId = decoded.userId;
      req.body.accountType = decoded.accountType;
      next();
    } catch (err) {
      return res.status(403).json({ msg: "Verification failed!" });
    }
  } else {
    return res.status(403).json({ msg: "You have no access!" });
  }
};

const checkPatientAuth = (req, res, next) => {};
const checkDoctorAuth = (req, res, next) => {};

exports.checkAuth = checkAuth;
exports.checkPatientAuth = checkPatientAuth;
exports.checkDoctorAuth = checkDoctorAuth;
