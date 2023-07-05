const mongoose = require("mongoose");
const config = require("config");

// не перегружаем _id
const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  speciality: {
    type: String,
    enum: config.get("specialties"),
    required: true,
  },
  slots: [
    {
      time: { type: Date, required: true },
      // patientId есть <=> слот забронирован (поле isBooked необязательно)
      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Patient",
      },
    },
  ],
});

exports.DoctorModel = mongoose.model("Doctor", DoctorSchema, "doctor");
