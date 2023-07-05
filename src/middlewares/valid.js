const { body, query, validationResult } = require("express-validator");
const config = require("config");

// отсеиваем невалидные по формату тела запросов, чтобы не отлавливать их дальше в цепочке middlewares

const catchErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }
  next();
};

const patientRegister = [
  body("name")
    .isString()
    .withMessage("Name must be a string!")
    .not()
    .isEmpty()
    .withMessage("Invalid empty name!"),
  body("surname")
    .isString()
    .withMessage("Surname must be a string!")
    .not()
    .isEmpty()
    .withMessage("Invalid empty surname!"),
  body("phone").isString().withMessage("Phone must be a string!"),
  body("email").isEmail().withMessage("Invalid email format!"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long!")
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
  body("email", "Invalid email format!").isEmail(),
  body("password").isString().withMessage("Password must be a string!"),
];

const slot = [
  body("time").isISO8601().withMessage("Invalid time format!").toDate(),
];

const idLength = config.get("userIdLength");

const patientSlot = [
  ...slot,
  body("doctorId", "Invalid doctor id format!")
    .optional()
    .isString()
    .isLength({ min: idLength, max: idLength }),
];

const doctorSlot = [
  ...slot,
  body("patientId", "Invalid patient id format!")
    .optional()
    .isString()
    .isLength({ min: idLength, max: idLength }),
];

const querySpecialty = [
  query("specialty")
    .isIn(config.get("specialties"))
    .withMessage("Invalid doctor's speciality!"),
];
const queryId = [
  query("id", "Invalid id format!").isLength({ min: idLength, max: idLength }),
];

exports.catchErrors = catchErrors;
exports.patientRegister = patientRegister;
exports.doctorRegister = doctorRegister;
exports.login = login;
exports.patientSlot = patientSlot;
exports.doctorSlot = doctorSlot;
exports.querySpecialty = querySpecialty;
exports.queryId = queryId;
