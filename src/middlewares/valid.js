const { body, validationResult } = require("express-validator");
const config = require("config");

// отсеиваем невалидные тела запросов, чтобы не отлавливать их дальше в цепочке middlewares

const catchErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  next();
};

const patientRegister = [
  body("name").isString().withMessage("Name must be a string!"),
  body("surname").isString().withMessage("Surname must be a string!"),
  body("phone").isString().withMessage("Phone must be a string!"),
  body("email").isString().withMessage("Email must be a string!"),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10,
    })
    .custom((value, { req }) => value === req.body.repeatPassword)
    .withMessage("Passwords do not match!"),
];

const doctorRegister = [
  ...patientRegister,
  body("speciality")
    .isIn(config.get("specialties"))
    .withMessage("Invalid doctor's speciality!"),
];

const login = [
  body("email").isString().withMessage("Email must be a string!"),
  body("password").isString().withMessage("Password must be a string!"),
];

const patientSlot = [];

const doctorSlot = [];

exports.catchErrors = catchErrors;
exports.patientRegister = patientRegister;
exports.doctorRegister = doctorRegister;
exports.login = login;
exports.patientSlot = patientSlot;
exports.doctorSlot = doctorSlot;
