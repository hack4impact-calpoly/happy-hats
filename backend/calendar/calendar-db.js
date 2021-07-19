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
        if (savedDoc !== newEvent) {
            return false;
        }
        return savedDoc;
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
    findCalendarEventById: async (eventId) => {
        const val = await CalendarEvent.findById(eventId).exec();
        return val;
    },
    updateCalendarEvent: async (eventId, calendarEvent) => {
        const newDoc = await CalendarEvent.findOneAndReplace(
            {
                _id: eventId,
            },
            calendarEvent,
            {
                new: true,
                lean: true,
            }
        );

        if (!eventId.equals(newDoc?._id)) {
            return false;
        }

        return newDoc;
    },
    addVolunteerToEvent: async (eventId, volunteer) => {
        const updateResult = await CalendarEvent.findByIdAndUpdate(
            eventId,
            {
                $push: {
                    volunteers: volunteer,
                }
            },
            {
                new: true,
                lean: true,
            }
        );
        
        return updateResult;
    },
    setCustomHoursForEvent: async (eventId, volunteerId, eventData) => {
        const updateResult = await CalendarEvent.findOneAndUpdate(
            {
                _id: eventId,
                'volunteers.volunteer.id': volunteerId,
            },
            {
                $set: {
                    'volunteers.$': eventData,
                }
            },
            {
                new: true,
                lean: true,
            }
        );

        return updateResult;
    },
    approveCustomEventHours: async (eventId, volunteerId, approved) => {
        const updateResult = await CalendarEvent.findOneAndUpdate(
            {
                _id: eventId,
                'volunteers.volunteer.id': volunteerId,
            },
            {
                $set: {
                    'volunteers.$.approved': approved,
                    'volunteers.$.decisionMade': true,
                }
            },
            {
                new: true,
                lean: true,
            }
        );

        return updateResult;
    },
};

module.exports = {
    CalendarEvent: CalendarEvent,
    calendarEventFns: calendarEventFns,
}
