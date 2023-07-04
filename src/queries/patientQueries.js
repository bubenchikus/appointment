const { PatientModel } = require("../mongoModels/patientModel");
const { DoctorModel } = require("../mongoModels/doctorModel");
const universalQueries = require("./ universalQueries");

const register = async (req, res) => {
  try {
    const user = universalQueries.createUser(PatientModel, {
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
      msg: "Registration failed!",
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
      msg: "Authorization failed!",
    });
  }
};

const book = async (req, res) => {
  try {
    const doctor = await DoctorModel.findById(req.body.doctorId).lean();
    const availableTimes = doctor.slots.map((slot) => slot.time);

    if (availableTimes.includes(req.body.slot)) {
      await DoctorModel.updateOne(
        { _id: req.body.doctor_id, "slots.time": req.body.slot },
        { $set: { "slots.$.patientId": req.body.userId } }
      );
    } else {
      res.status(404).json({
        msg: "Slot that you try to book does not exist! Try another.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot booking process failed!",
    });
  }
};

exports.register = register;
exports.login = login;
exports.book = book;
