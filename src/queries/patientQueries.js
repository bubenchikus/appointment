const { PatientModel } = require("../mongoModels/patientModel");
const { DoctorModel } = require("../mongoModels/doctorModel");
const universalQueries = require("./ universalQueries");

const getMe = async (req, res) => {
  try {
    const found = universalQueries.getMe(
      PatientModel,
      req.headers.authorization
    );
    res.json(found);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching patient data failed!",
    });
  }
};

const login = async (req, res) => {
  try {
    const loggedIn = await universalQueries.login(PatientModel, {
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
      msg: "Patient authorization failed!",
    });
  }
};

const register = async (req, res) => {
  try {
    const foundByEmail = await PatientModel.findOne({
      email: req.body.email,
    });
    const foundByPhone = await PatientModel.findOne({
      email: req.body.phone,
    });
    if (foundByEmail || foundByPhone) {
      return res.status(409).json({
        msg: "Patient with this email or phone already exists!",
      });
    }

    const user = await universalQueries.createUser(PatientModel, {
      name: req.body.name,
      surname: req.body.surname,
      phone: req.body.phone,
      email: req.body.email,
      password: req.body.password,
    });

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Patient registration failed!",
    });
  }
};

const bookSlot = async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.body.doctorId);
    const availableTimes = doctor._doc.slots.map((slot) => slot.time);

    if (availableTimes.includes(req.body.time)) {
      await DoctorModel.updateOne(
        { _id: req.body.doctor_id, "slots.time": req.body.time },
        { $set: { "slots.$.patientId": req.body.userId } }
      );
    } else {
      res.status(404).json({
        msg: "Slot that you try to book does not exist! Try another one.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot booking process failed!",
    });
  }
};

const deleteMe = (req, res) => {};

const cancelSlot = (req, res) => {};

exports.getMe = getMe;
exports.login = login;
exports.register = register;
exports.bookSlot = bookSlot;
exports.deleteMe = deleteMe;
exports.cancelSlot = cancelSlot;
