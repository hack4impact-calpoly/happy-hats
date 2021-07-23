require("dotenv").config({
    path: "../.env",
});

const MongooseConnector = require('../db-helper');
const { CalendarEvent } = require("../calendar/calendar-db");

(async () => {
    await MongooseConnector.connect();
    console.log(await CalendarEvent.updateMany({}, {$set: {allDay: true}}));
    await MongooseConnector.disconnect();
})();