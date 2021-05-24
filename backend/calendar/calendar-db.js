const mongoose = require('mongoose');
const { calendarEventSchema, COLLECTION_NAME, CalendarEventTypes } = require('./models/calendar-schema');

/* Create calendar model */
const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema, COLLECTION_NAME);

/* Object containing functions we will use to interact with the DB */
const calendarEventFns = {
    getAllCalendarEvents: async () => {
        // Split right now for easy debugging
        const val = await CalendarEvent.find({}).exec();
        return val;
    },
    getEventsWithFilter: async (filter) => {
        // Split right now for easy debugging and if we want to change it in future
        // to do something more
        const events = await CalendarEvent.find(filter).exec();
        return events;
    },
    saveCalendarEvent: async (calendarEvent) => {
        const newEvent = new CalendarEvent(calendarEvent);
        const savedDoc = await newEvent.save();
        return savedDoc === newEvent;
    },
    deleteCalendarEvent: async (eventId) => {
        const resp = await CalendarEvent.deleteOne({
            _id: eventId,
        });
        return resp?.deletedCount === 1;
    },
    updateCalendarEvent: async (eventId, calendarEvent) => {
        const oldDoc = await CalendarEvent.findOneAndReplace(
            {
                _id: eventId,
            },
            calendarEvent
        );
        return eventId.equals(oldDoc?._id);
    },
};

module.exports = {
    CalendarEvent: CalendarEvent,
    calendarEventFns: calendarEventFns,
}
