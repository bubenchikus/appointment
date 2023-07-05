const { DoctorModel } = require("../mongoModels/doctorModel");

// не показываем уже забронированные слоты
const trimBooked = (doctor) => {
  doctor.slots = doctor.slots.filter(
    (slot) => !slot.toObject().hasOwnProperty("patientId")
  );
  return doctor;
};

const getAllDoctors = async (_, res) => {
  try {
    // не найдено => вернется пустой объект (допустимо)
    const found = await DoctorModel.find();

    const processedFound = found.map((doctor) => trimBooked(doctor));

    res.json(processedFound);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching doctor data failed!",
    });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const found = await DoctorModel.findById(req.params.id);

    if (!found) {
      return res.status(404).json({ msg: "Doctor with this id not found!" });
    }

    res.json(trimBooked(found));
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching doctor data failed!",
    });
  }
};

const getDoctorsBySpecialty = async (req, res) => {
  try {
    const found = await DoctorModel.find({ speciality: req.params.speciality });

    const processedFound = found.map((doctor) => trimBooked(doctor));

    res.json(processedFound);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Fetching doctor data failed!",
    });
  }
};

exports.trimBooked = trimBooked;
exports.getAllDoctors = getAllDoctors;
exports.getDoctorById = getDoctorById;
exports.getDoctorsBySpecialty = getDoctorsBySpecialty;
