const { PatientModel } = require("../mongoModels/patientModel");
const { DoctorModel } = require("../mongoModels/doctorModel");
const universalQueries = require("./ universalQueries");
const { trimBooked } = require("./openQueries");
const {
  scheduleNotifications,
  makeUniqueNameForJob,
  schedule,
} = require("../helpers/scheduler");

const getMe = async (req, res) => {
  try {
    const found = await PatientModel.findById(req.body.userId);
    if (!found) {
      return res.status(404).json({ msg: "User data not found!" });
    }
    res.json(universalQueries.trimUselessProps(found._doc));
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
    } else res.json(loggedIn);
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
    const availableTimes = trimBooked(doctor)._doc.slots.map((slot) =>
      slot.time.getTime()
    );

    var parsedTime = req.body.time;

    if (availableTimes.includes(parsedTime.getTime())) {
      await DoctorModel.findOneAndUpdate(
        {
          _id: req.body.doctorId,
          "slots.time": parsedTime.getTime(),
        },
        { $set: { "slots.$.patientId": req.body.userId } }
      );

      const patient = await PatientModel.findOneAndUpdate(
        {
          _id: req.body.userId,
        },
        {
          $push: {
            appointments: {
              doctorId: req.body.doctorId,
              time: parsedTime.getTime(),
            },
          },
        }
      );

      // планировщик уведомдений
      scheduleNotifications(
        parsedTime,
        patient._doc.name,
        doctor._doc.speciality
      );
    } else {
      return res.status(404).json({
        msg: "Slot for this time is not available!",
      });
    }

    res.json({ msg: `Slot for ${req.body.time} successfully booked!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot booking process failed!",
    });
  }
};

const deleteMe = async (req, res) => {
  try {
    const deleted = await PatientModel.findByIdAndDelete(req.body.userId);
    res.json({ msg: `Patient ${deleted._id} successfully deleted!` });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "User deletion failed!",
    });
  }
};

const cancelSlot = async (req, res) => {
  try {
    const toDelete = (
      await PatientModel.findById(req.body.userId)
    ).appointments.find((ap) => ap._id.toString() === req.params.id);

    if (!toDelete) {
      return res
        .status(404)
        .json({ msg: "Appointments with this id are not found!" });
    }

    const patient = await PatientModel.findByIdAndUpdate(req.body.userId, {
      $pull: { appointments: { _id: req.params.id } },
    });

    const doctor = await DoctorModel.findOneAndUpdate(
      {
        _id: toDelete.doctorId,
        "slots.time": toDelete.time,
      },
      { $unset: { "slots.$.patientId": 1 } }
    );

    const uniqueName = makeUniqueNameForJob(
      toDelete.time,
      patient._doc.name,
      doctor._doc.speciality
    );
    // отмена уведомлений
    schedule.scheduledJobs[uniqueName].cancel();

    res.json({
      msg: `Appointment for ${patient._doc.name} on ${toDelete.time} successfully cancelled!`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Slot booking process failed!",
    });
  }
};

exports.getMe = getMe;
exports.login = login;
exports.register = register;
exports.bookSlot = bookSlot;
exports.deleteMe = deleteMe;
exports.cancelSlot = cancelSlot;
