const mongoose = require('mongoose');
const COLLECTION_NAME = 'calendar-events';

// Enum for calendar event types
const CalendarEventTypes = Object.freeze({
    VOLUNTEER: 1,
    CAPE_ORDER: 2,
});
const NUM_CALENDAR_EVENT_TYPES = Object.keys(CalendarEventTypes).length;

const calendarEventSchema = new mongoose.Schema({
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    allDay: { type: Boolean, required: false, default: false },
    eventType: { type: Number, required: true, min: 0, max: NUM_CALENDAR_EVENT_TYPES },
    eventUser: { type: mongoose.ObjectId, required: true },
},
{
    collection: COLLECTION_NAME,
});

module.exports = {
    CalendarEventTypes: CalendarEventTypes,
    calendarEventSchema: calendarEventSchema,
    COLLECTION_NAME: COLLECTION_NAME,
};
