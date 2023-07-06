const axios = require("axios");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const makeURL = (path) => {
  return new URL(path, `http://127.0.0.1:${process.env.PORT}`).href;
};

const makeAuthHeader = (token) => {
  return { headers: { authentication: "Bearer " + token } };
};

const infoMsg = (msg) => {
  console.log(`======> ${msg}`);
};

const makeError = (err) => {
  console.log(err.response?.data?.msg || err.response?.msg || "Error!...");
};

const registerPatient = async (data) => {
  const token = await axios
    .post(makeURL("patient/register"), data)
    .catch((err) => makeError(err));
  return token;
};

const registerDoctor = async () => {
  const token = await axios
    .post(makeURL("doctor/register"), {
      name: "Doctor",
      surname: "Doctorovich",
      phone: "+7 (999) 999-99-99",
      email: "doctor@doctor.com",
      password: "7882ijw!!@edso",
      repeatPassword: "7882ijw!!@edso",
      speciality: "pediatrician",
    })
    .catch((err) => makeError(err));
  return token;
};

const getUser = async (user, token) => {
  const res = await axios
    .get(makeURL(`${user}/me`), makeAuthHeader(token))
    .then((res) => res.data)
    .catch((err) => makeError(err));
  return res;
};

const postSlot = async (time, token) => {
  const res = await axios
    .post(makeURL("doctor/slots"), { time: time }, makeAuthHeader(token))
    .then((res) => {
      console.log(res.data.msg);
    })
    .catch((err) => makeError(err));
  return res;
};

const bookSlot = async (time, doctorId, token) => {
  const res = await axios
    .post(
      makeURL("patient/slots"),
      { time: time, doctorId: doctorId },
      makeAuthHeader(token)
    )
    .then((res) => {
      console.log(res.data.msg);
    })
    .catch((err) => makeError(err));
  return res;
};

const cancelSlot = async (token, slotId) => {
  const res = await axios
    .delete(makeURL(`patient/slots/${slotId}`), makeAuthHeader(token))
    .then((res) => {
      console.log(res.data.msg);
    })
    .catch((err) => makeError(err));
};

const deleteUser = async (user, token) => {
  await axios
    .delete(makeURL(`${user}/me`), makeAuthHeader(token))
    .then((res) => {
      console.log(res.data.msg);
    })
    .catch((err) => makeError(err));
};

const curr = new Date();
const curr2Hours = new Date(curr.getTime() + 2 * 60 * 60 * 1000 + 1000);
const currDay = new Date(curr.getTime() + 24 * 60 * 60 * 1000 + 1000);
const dates = [curr, curr2Hours, currDay];

const scenario = async () => {
  try {
    infoMsg("BOOKING SCENARIO:");
    infoMsg("Registering the patient...");
    await registerPatient({
      name: "Patient",
      surname: "Patientovich",
      phone: "+7 (999) 999-99-99",
      email: "patient@patient.com",
      password: "psdoijw!!@edso",
      repeatPassword: "psdoijw!!@edso",
    }).then((data) => {
      this.patient1Data = data.data;
    });

    infoMsg("Registering the doctor...");
    await registerDoctor().then((data) => {
      this.doctorData = data.data;
    });

    infoMsg("Doctor creates a slot (2 hours from now)...");
    await postSlot(dates[1], this.doctorData.token);

    infoMsg("Patient books this slot...");
    await bookSlot(dates[1], this.doctorData._id, this.patient1Data.token);

    infoMsg("Patient tries to book the same slot one more time...");
    await bookSlot(dates[1], this.doctorData._id, this.patient1Data.token);

    infoMsg("Registering another patient...");
    await registerPatient({
      name: "Second",
      surname: "Second",
      phone: "+7 (999) 999-99-96",
      email: "patient@patient2.com",
      password: "psdoijw!!@edso",
      repeatPassword: "psdoijw!!@edso",
    }).then((data) => {
      this.patient2Data = data.data;
    });

    infoMsg("Another patient tries to book the same slot...");
    await bookSlot(dates[1], this.doctorData._id, this.patient2Data.token);

    infoMsg(
      `First patient tries to book the non-exististing slot (1 day from now - ${dates[2]})...`
    );
    await bookSlot(dates[2], this.doctorData._id, this.patient1Data.token);

    infoMsg("Doctor creates this slot and the first patient books it...");
    await postSlot(dates[2], this.doctorData.token);
    await bookSlot(dates[2], this.doctorData._id, this.patient1Data.token);

    infoMsg("Then the first patient cancelles it...");
    await cancelSlot(
      this.patient1Data.token,
      String(
        (
          await getUser("patient", this.patient1Data.token)
        ).appointments.find(
          (a) => new Date(a.time).getTime() === dates[2].getTime()
        )._id
      )
    );

    infoMsg("And the second patient books freed slot...");
    await bookSlot(dates[2], this.doctorData._id, this.patient2Data.token);

    infoMsg("Fetching doctor's data...");
    console.log(await getUser("doctor", this.doctorData.token));
    infoMsg("Fetching first patient's data...");
    console.log(await getUser("patient", this.patient1Data.token));
    infoMsg("Fetching second patient's data...");
    console.log(await getUser("patient", this.patient2Data.token));
  } catch (err) {
    console.log("Scenario failed!");
    console.log(err);
  }
  infoMsg("Cleaning up...");
  await deleteUser("patient", this.patient1Data.token);
  await deleteUser("patient", this.patient2Data.token);
  await deleteUser("doctor", this.doctorData.token);
};

exports.scenario = scenario;
