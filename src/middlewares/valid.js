const { body, validationResult } = require("express-validator");
const config = require("config");

// отсеиваем невалидные тела запросов, чтобы не отлавливать их дальше в цепочке middlewares

const catchValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  next();
};

const patientRegister = [
  body("name").isString().withMessage("User's name must be a string!"),
  body("surname"),
  body("phone"),
  body("email"),
  body("password")
    .isLength({
      min: 6,
    })
    .withMessage("Password must be at least 6 symbols length!")
    .custom((value, { req }) => value !== req.body.repeatPassword)
    .withMessage("Passwords do not match!"),
];

const doctorRegister = [
  ...patientRegisterValidation,
  body("speciality")
    .isIn(config.get("specialities"))
    .withMessage("Invalid doctor's speciality!"),
];

exports.catchValidationErrors = catchValidationErrors;
exports.patientRegister = patientRegister;
exports.doctorRegister = doctorRegister;
