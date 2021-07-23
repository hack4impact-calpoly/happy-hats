const mongoose = require('mongoose');
const { eventVolunteerSchema } = require('../event-volunteers/event-volunteer-schema');
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
    volunteers: { type: [eventVolunteerSchema], required: false, default: [] },
    title: { type: String, required: true },
    description: { type: String, required: false },
    adminFinished: { type: Boolean, required: false, default: false },
},
{
    collection: COLLECTION_NAME,
});

module.exports = {
    CalendarEventTypes,
    calendarEventSchema,
    COLLECTION_NAME,
};
