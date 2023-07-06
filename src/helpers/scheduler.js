const schedule = require("node-schedule");
const fs = require("fs");
const path = require("path");

const notify1DayBefore = (appointmentDate) => {
  return new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
};

const notify2HoursBefore = (appointmentDate) => {
  return new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
};

const makeUniqueNameForJob = (appointmentDate, patientName, speciality) => {
  return `${patientName}/${appointmentDate}/${speciality}`;
};

const writeToLog = (msg) => {
  console.log(`Writing to ${process.env.NOTIFICATION_LOG} file: ${msg}`);
  fs.appendFile(
    path.resolve(process.env.NOTIFICATION_LOG),
    msg + "\n",
    { flag: "w" },
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
};

function scheduleNotifications(appointmentDate, patientName, speciality) {
  const uniqueName = makeUniqueNameForJob(
    appointmentDate,
    patientName,
    speciality
  );
  const job1 = schedule.scheduleJob(
    uniqueName,
    notify1DayBefore(appointmentDate),
    function () {
      writeToLog(
        `${new Date().toISOString()} | Привет, ${patientName}! Напоминаем, что вы записаны к врачу специальности ${speciality} завтра в ${appointmentDate}!`
      );
    }
  );

  const job2 = schedule.scheduleJob(
    uniqueName,
    notify2HoursBefore(appointmentDate),
    function () {
      writeToLog(
        `${new Date().toISOString()} | Привет, ${patientName}! Через 2 часа (в ${appointmentDate}) у вас прием у врача специальности ${speciality}!`
      );
    }
  );
  return job1, job2;
}

exports.scheduleNotifications = scheduleNotifications;
exports.makeUniqueNameForJob = makeUniqueNameForJob;
exports.schedule = schedule;
