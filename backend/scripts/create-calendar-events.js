require("dotenv").config({
  path: "../.env",
});

const { CalendarEvent } = require("../calendar/calendar-db");
const MongooseConnector = require("../db-helper");
const { getStartOfDay } = require("../calendar/helpers");
const { CalendarEventTypes } = require("../calendar/models/calendar-schema");
const { Types: { ObjectId } } = require("mongoose");

function addTime(date, hours = 0, minutes = 0) {
  const newTime = date.getTime() + hours * 1000 * 3600 + minutes * 1000 * 60;
  const newDate = new Date().setTime(newTime);
  return newDate;
}

MongooseConnector.saveCalendarEventCustom = async (obj) => {
  const newEvent = new CalendarEvent(obj);
  const savedDoc = await newEvent.save();
  return savedDoc;
};

async function setupCalendarEvents(useExistingEvents = true) {
  /* if (!useExistingEvents) {
    await CalendarEvent.deleteMany({});
  } */
  await CalendarEvent.deleteMany({
    eventUser: "60f0494c4b7a31f3a179ba8a"
  });

  const curDate = getStartOfDay(new Date());

  curDate.setTime(curDate.getTime() - (1000 * 3600 * 23.99));

  const event1 = await MongooseConnector.saveCalendarEventCustom({
    start: addTime(curDate, (hours = 10)),
    end: addTime(curDate, (hours = 12)),
    eventUser: "60f0494c4b7a31f3a179ba8a",
    eventType: CalendarEventTypes.VOLUNTEER,
    title: "First test title",
    description: "First test description, it's a little longer",
  });

  const event2 = await MongooseConnector.saveCalendarEventCustom({
    start: addTime(curDate, (hours = 14)),
    end: addTime(curDate, (hours = 16)),
    eventUser: "60f0494c4b7a31f3a179ba8a",
    eventType: CalendarEventTypes.VOLUNTEER,
    title: "Second test title",
    description: "Second test description, a little longer",
  });

  // Now adding some volunteers to this one
  const volunteer1 = {
    // name: "Freddie J",
    start: event2.start,
    end: event2.end,
    approved: true,
    decisionMade: true,
    usingDefaultTimes: true,
    volunteer: {
      id: ObjectId('609b6d3ade638b2b73892519'),
      firstName: 'ben',
      lastName: 'last1',
      email: 'someemail@email.com'
    },
  };

  const volunteer2 = {
    // name: "Freddie J Numero dos",
    start: addTime(event2.start, hours = 1),
    end: event2.end,
    approved: true,
    decisionMade: true,
    usingDefaultTimes: false,
    volunteer: {
      id: ObjectId('60a1dbaede6fa124b6afda14'),
      firstName: 'ben',
      lastName: 'last2',
      email: 'someemail2@email.com'
    },
  };

  const volunteer3 = {
    // name: "Freddie J Numero tres",
    start: addTime(event2.start),
    end: addTime(event2.start, 0, minutes = 30),
    approved: true,
    decisionMade: true,
    usingDefaultTimes: false,
    volunteer: {
      id: ObjectId('60c66ea8d519ea620f739f93'),
      firstName: 'ben',
      lastName: 'last3',
      email: 'someemail3@email.com'
    },
  };

  const volunteer4 = {
    // name: "Freddie J Numero tres",
    start: addTime(event2.start),
    end: addTime(event2.end),
    approved: true,
    decisionMade: true,
    usingDefaultTimes: false,
    volunteer: {
      id: ObjectId('60e47478c70bcc4721756f31'),
      firstName: 'ben',
      lastName: 'last4',
      email: 'someemail4@email.com'
    },
  };

  const volunteer5 = {
    // name: "Freddie J Numero tres",
    start: addTime(event2.start),
    end: addTime(event2.end),
    approved: true,
    decisionMade: true,
    usingDefaultTimes: false,
    volunteer: {
      id: ObjectId('60eca07c7b1135223b686293'),
      firstName: 'ben',
      lastName: 'last5',
      email: 'someemail5@email.com'
    },
  };

  await Promise.all([
    MongooseConnector.addVolunteerToEvent(event2._id, volunteer1),
    MongooseConnector.addVolunteerToEvent(event2._id, volunteer2),
    MongooseConnector.addVolunteerToEvent(event2._id, volunteer3),
    MongooseConnector.addVolunteerToEvent(event2._id, volunteer4),
    MongooseConnector.addVolunteerToEvent(event2._id, volunteer5),
  ]);

  const event3 = await MongooseConnector.saveCalendarEventCustom({
    start: addTime(curDate, (hours = 14)),
    end: addTime(curDate, (hours = 16)),
    eventUser: "60f0494c4b7a31f3a179ba8a",
    eventType: CalendarEventTypes.VOLUNTEER,
    title: "Third test title",
    description: "Third test description, a little longer",
  });

  volunteer3.decisionMade = true;

  await MongooseConnector.addVolunteerToEvent(event3._id, volunteer3);
}

(async () => {
  await MongooseConnector.connect();

  await setupCalendarEvents(false);

  await MongooseConnector.disconnect();
})();
