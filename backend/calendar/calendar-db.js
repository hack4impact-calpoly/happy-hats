const { default: Logger } = require('@hack4impact/logger');
const mongoose = require('mongoose');
const { volunteerFns } = require('../volunteer/volunteer-db');
const { calendarEventSchema, COLLECTION_NAME } = require('./models/calendar-schema');

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
    deleteVolunteerFromEvent: async (eventId, volunteerId) => {
        const updateResult = await CalendarEvent.findByIdAndUpdate(
            eventId, 
            {
                $pull: {
                    volunteers: {
                       volunteer: volunteerId
                    }
                }
            }, 
            { 
                safe: true, 
                multi:true 
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
    addCompletedHoursForVolunteers: async (eventId, volunteerIdAndHours) => {
        if (volunteerIdAndHours && volunteerIdAndHours.length > 0) {
            const [successIds, failIds] = await volunteerFns.addCompletedHoursToVolunteers(volunteerIdAndHours);

            if (failIds.length > 0) {
                Logger.error(`[ERROR]: Failed to update hours on event ${eventId} for volunteers ${failIds}`);
            }

            if (successIds.length > 0) {
                try {
                    const res = await CalendarEvent.findByIdAndUpdate(
                        eventId,
                        {
                            $set: {
                                'volunteers.$[v].completed': true,
                            }
                        },
                        {
                            new: true,
                            lean: true,
                            arrayFilters: [ { 'v.volunteer.id': { $in: successIds }, } ],
                        }
                    ).exec();

                    const successIdsSet = new Set(successIds.map(s => String(s)));
                    const filteredSuccessVolunteers = res?.volunteers?.filter(v => {
                        return v.completed && successIdsSet.has(String(v.volunteer.id));
                    });

                    if (!res ||
                            filteredSuccessVolunteers?.length !== successIdsSet.size) {
                        const filteredFailedVolunteers = res?.volunteers?.filter(v => {
                            return !v.completed && successIdsSet.has(v.volunteer.id);
                        });
                        throw new Error(`Did not set all successful volunteers added hours to (${filteredFailedVolunteers})`);
                    }
                } catch (err) {
                    Logger.err(err);
                    Logger.error(`[ERROR]: Failed to set volunteers as completed on ${eventId} for volunteers ${successIds}`);
                    return false;
                }
            }
        }

        const newEvent = await CalendarEvent.findByIdAndUpdate(
            eventId,
            {
                $set: {
                    adminFinished: true,
                }
            },
            {
                new: true,
                lean: true,
            }
        );

        return newEvent;
    },
    updateHoursAsComplete: async (eventId, helperList, newCompleteStatus) => {
        const vId = helperList[0][0];

        if (!newCompleteStatus) {
            // Invert timeBetween
            helperList[0][1] *= -1;
        }

        const [successIds, failIds] = await volunteerFns.addCompletedHoursToVolunteers(helperList);

        if (successIds.length !== 1 || !helperList[0][0].equals(successIds[0])) {
            Logger.error(`[ERROR]: Did not update the hour completion status for ${vId} correctly for event ${eventId} to ${newCompleteStatus}... failed on setting new hour increment to ${helperList[0][1]}`);
            return false;
        }

        const updateResult = await CalendarEvent.findOneAndUpdate(
            {
                _id: eventId,
                'volunteers.volunteer.id': vId,
            },
            {
                $set: {
                    'volunteers.$.completed': !!newCompleteStatus,
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
