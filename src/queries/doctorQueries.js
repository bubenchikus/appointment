const { PatientModel } = require("../mongoModels/patientModel");
const { DoctorModel } = require("../mongoModels/doctorModel");
const universalQueries = require("./ universalQueries");

const getMe = async (req, res) => {
  try {
    const found = await DoctorModel.findById(req.body.userId);
    if (!found) {
      return res.status(404).json({ msg: "User data not found!" });
    }
    res.json(universalQueries.trimUselessProps(found._doc));
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching doctor data failed!",
    });
  }
};

const getPatient = async (req, res) => {
  try {
    const me = await DoctorModel.findById(req.body.userId);
    if (!me) {
      return res.status(404).json({ msg: "User data not found!" });
    }

    let patientIds = [];
    me.slots.forEach((slot) => {
      if (slot.toObject().hasOwnProperty("patientId")) {
        patientIds.push(slot.patientId.toString());
      }
    });

    if (!patientIds.includes(req.params.id)) {
      return res.status(403).json({
        msg: `Patient with id ${req.params.id} is not your patient!`,
      });
    }

    const patient = await PatientModel.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ msg: "User data not found!" });
    }

    res.json(universalQueries.trimUselessProps(patient._doc));
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Getting patient data failed!",
    });
  }
};

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
      phone: req.body.phone,
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

const createSlot = async (req, res) => {
  try {
    const timeBooked = await DoctorModel.find({
      "slots.time": req.body.time,
    });
    if (timeBooked.length > 0) {
      return res
        .status(409)
        .json({ msg: "Slot for this time already exists!" });
    }
    const slot = await DoctorModel.findByIdAndUpdate(req.body.userId, {
      $push: { slots: { time: req.body.time } },
    });
    res.json({ msg: `Slot for ${req.body.time} successfully created!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot creation failed!",
    });
  }
};

const deleteMe = async (req, res) => {
  try {
    await DoctorModel.findByIdAndDelete(req.body.userId);
    res.json({ msg: "User successfully deleted!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "User deletion failed!",
    });
  }
};

const deleteSlot = async (req, res) => {
  try {
    await DoctorModel.findByIdAndUpdate(req.body.userId, {
      $pull: { slots: { _id: req.params.id } },
    });
    res.json({ msg: "Slot successfully deleted!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot deletion failed!",
    });
  }
};

exports.getMe = getMe;
exports.getPatient = getPatient;
exports.login = login;
exports.register = register;
exports.createSlot = createSlot;
exports.deleteMe = deleteMe;
exports.deleteSlot = deleteSlot;
