const mongoose = require("mongoose");

// не перегружаем _id
const PatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phone: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  appointments: [
    {
      time: { type: Date, required: true },
      doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Doctor",
      },
    },
  ],
});

exports.PatientModel = mongoose.model("Patient", PatientSchema, "patient");
