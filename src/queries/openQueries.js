const { DoctorModel } = require("../mongoModels/doctorModel");
const { trimUselessProps } = require("./ universalQueries");

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

    const processedFound = found.map((doctor) =>
      trimUselessProps(trimBooked(doctor._doc))
    );

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

    res.json(trimUselessProps(trimBooked(found._doc)));
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

    const processedFound = found.map((doctor) =>
      trimUselessProps(trimBooked(doctor._doc))
    );

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
