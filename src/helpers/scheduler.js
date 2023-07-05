const schedule = require("node-schedule");

const curr = new Date();
const date = new Date(curr.getTime() + 10 * 1000);
console.log(date);

const job = schedule.scheduleJob(date, function () {
  console.log("The world is going to end today.");
});
