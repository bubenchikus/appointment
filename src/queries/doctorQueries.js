const { PatientModel } = require("../mongoModels/patientModel");
const { DoctorModel } = require("../mongoModels/doctorModel");
const universalQueries = require("./ universalQueries");

const getMe = async (req, res) => {
  try {
    const found = universalQueries.getMe(
      DoctorModel,
      req.headers.authorization
    );
    res.json(found);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching doctor data failed!",
    });
  }
};

const getPatient = async (req, res) => {};

const login = async (req, res) => {
  try {
    const loggedIn = await universalQueries.login(DoctorModel, {
      email: req.body.email,
      password: req.body.password,
    });

    if (!loggedIn) {
      return res.status(401).json({
        msg: "Incorrect email or password!",
      });
    } else {
      res.json(loggedIn);
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Doctor authorization failed!",
    });
  }
};

const register = async (req, res) => {
  try {
    const foundByEmail = await DoctorModel.findOne({
      email: req.body.email,
    });
    const foundByPhone = await DoctorModel.findOne({
      email: req.body.phone,
    });
    if (foundByEmail || foundByPhone) {
      return res.status(409).json({
        msg: "Doctor with this email or phone already exists!",
      });
    }

    const user = await universalQueries.createUser(DoctorModel, {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
      speciality: req.body.speciality,
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Doctor registration failed!",
    });
  }
};

const createSlot = () => {
  try {
    const timeBooked = DoctorModel.findOne({ slots: { time: req.body.time } });
    if (timeBooked) {
      return res
        .status(409)
        .json({ msg: "Slot with this time already exists!" });
    }

    const slot = DoctorModel.res.status(slot);
  } catch (err) {}
};

const deleteMe = () => {};

const deleteSlot = () => {};

exports.getMe = getMe;
exports.getPatient = getPatient;
exports.login = login;
exports.register = register;
exports.createSlot = createSlot;
exports.deleteMe = deleteMe;
exports.deleteSlot = deleteSlot;
