const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const patientQueries = require("./src/queries/patientQueries.js");
const doctorQueries = require("./src/queries/doctorQueries.js");
const openQueries = require("./src/queries/openQueries.js");
const validations = require("./src/middlewares/valid.js");
const auth = require("./src/middlewares/auth.js");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_APPOINTMENT)
  .then(() => console.log("Succesfully connected to DB..."))
  .catch((err) => console.log("Connection to DB failed!", err));

const app = express();

app.use(express.json());

//open routes
app.get("/doctors", openQueries.getAllDoctors);
app.get("/doctor/:id", openQueries.getDoctorById);
app.get("/doctor/specialties/:specialty", openQueries.getDoctorsBySpecialty);

// routes for patient user
app.get("/patient/me", auth.checkPatientAuth, patientQueries.getMe);
app.post(
  "/patient/login",
  validations.login,
  validations.catchErrors,
  patientQueries.login
);
app.post(
  "/patient/register",
  validations.patientRegister,
  validations.catchErrors,
  patientQueries.register
);
app.post(
  "/patient/slots",
  auth.checkPatientAuth,
  validations.patientSlot,
  validations.catchErrors,
  patientQueries.bookSlot
);
app.delete("/patient/me", auth.checkPatientAuth, patientQueries.deleteMe);
app.delete(
  "/patient/slots/:id",
  auth.checkPatientAuth,
  patientQueries.cancelSlot
);

//routes for doctor user
app.get("/doctor/me", auth.checkDoctorAuth, doctorQueries.getMe);
app.get("/doctor/patients/:id", auth.checkDoctorAuth, doctorQueries.getPatient);
app.post(
  "/doctor/login",
  validations.login,
  validations.catchErrors,
  doctorQueries.login
);
app.post(
  "/doctor/register",
  validations.doctorRegister,
  validations.catchErrors,
  doctorQueries.register
);
app.post(
  "/doctor/slots",
  auth.checkDoctorAuth,
  validations.doctorSlot,
  validations.catchErrors,
  doctorQueries.createSlot
);
app.delete("/doctor/me", auth.checkDoctorAuth, doctorQueries.deleteMe);
app.delete("/doctor/slots/:id", auth.checkDoctorAuth, doctorQueries.deleteSlot);

app.listen(process.env.PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Server is OK and running on port ${process.env.PORT}...`);
});
