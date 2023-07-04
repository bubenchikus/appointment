const express = require("express");
const dotenv = require("dotenv");
const patientQueries = require("./src/queries/patientQueries.js");
const mongoose = require("mongoose");

dotenv.config();

mongoose
  .connect(process.env.MONGODB_APPOINTMENT)
  .then(() => console.log("Succesfully connected to DB..."))
  .catch((err) => console.log("Connection to DB failed!", err));

const app = express();

app.use(express.json());

app.post("/login", patientQueries.login);
app.post("/register", patientQueries.register);
app.post("/book", patientQueries.book);

app.listen(process.env.PORT, (err) => {
  if (err) return console.log(err);
  console.log(`Server is OK and running on port ${process.env.PORT}...`);
});
