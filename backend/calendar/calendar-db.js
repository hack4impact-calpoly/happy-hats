const mongoose = require('mongoose');
const { calendarEventSchema, COLLECTION_NAME } = require('./models/calendar-schema');

const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema, COLLECTION_NAME);

const calendarEventFns = {
    getAllCalendarEvents: async () => {
        // Split right now for easy debugging
        const val = await CalendarEvent.find({}).exec();
        return val;
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
    findCalendarEventUser: async (eventId) => {
        const val = await CalendarEvent.findById(eventId, 'eventUser').exec();
        return val?.eventUser;
    },
    updateCalendarEvent: async (eventId, calendarEvent) => {
        // Make sure calendarEvent object is OK...
        const newEvent = new CalendarEvent(calendarEvent);
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
