const MongooseConnector = require('../../db-helper');
const { Types: { ObjectId } } = require('mongoose');
const { Logger } = require("@hack4impact/logger");

const {
    withEventChangeAndEventId,
    checkAndRetrieveEvent,
    confirmValidObjectId,
    onInvalidUserInput,
    checkSuccessFull,
    hoursBetween,
    checkSuccess,
} = require('../helpers');
const { isUserApproved, isUserAdmin } = require('../../middleware');

// ================  Data  ======================
const validVolunteeringRoles = new Set(['volunteer', 'admin']);
const validHourApprovalRoles = new Set(['admin']);
// ==============================================

const userSelectedDefaultTime = (startDate, endDate, event) => {
    return event && startDate.getTime() === event.start.getTime() &&
        endDate.getTime() === event.end.getTime();
};

module.exports = (app) => {
    // This will require authentication
    app.post('/api/event/:eventId/self-volunteer', isUserApproved, async (req, res) => {
        withEventChangeAndEventId(req, res, false, async (startDate, endDate, eventUser, eventId) => {
            if (!eventUser?.equals(req.locals.user?._id)) {
                res.status(400).json({
                    message: 'Volunteering someone else',
                });
                return;
            }

            const eventUserFullInfo = await MongooseConnector.getUser(eventUser);
            if (!eventUserFullInfo) {
                res.status(404).json({
                    message: 'User couldn\'t be found',
                });
                return;
            }
            const eventUserRole = eventUserFullInfo.role;
            
            if (!validVolunteeringRoles.has(eventUserRole)) {
                res.status(403).json({
                    message: 'Insufficient role for joining an event',
                });
                return;
            }

            if (!req.locals.user?.firstName || !req.locals.user?.lastName) {
                res.status(400).json({
                    message: 'User must have a firstname/lastname filled out',
                });
                return;
            }

            const event = await checkAndRetrieveEvent(eventId, res);
            if (!event) {
                return;
            }

            if (!startDate) {
                startDate = event.start;
            }
            if (!endDate) {
                endDate = event.end;
            }

            if (startDate >= endDate) {
                res.status(400).json({
                    message: 'Start date must be before end date',
                });
                return;
            }

            if ((new Date()).getTime() >= event.start) {
                return res.status(403).json({
                    message: 'The event is past the start time. No one may sign up anymore',
                });
            }

            // TODO: add check here where if user has been rejected for CUSTOM hours and is signing up for default ones, it deletes rejected request and makes a new one

            const volunteerEvent = event.volunteers.find(v => eventUser.equals(v.volunteer?.id));
            if (volunteerEvent) {
                if (volunteerEvent.decisionMade) {
                    if (volunteerEvent.approved === true) {
                        res.status(403).json({
                            message: 'Already signed up',
                        });
                        return;
                    } else if ((volunteerEvent.start && (startDate.getTime() == volunteerEvent.start)) &&
                        (volunteerEvent.end && (endDate.getTime() == volunteerEvent.end))) {
                        res.status(403).json({
                            message: 'Invalid times given. Those times have already been rejected',
                        });
                        return;
                    }
                } else {
                    res.status(403).json({
                        message: 'Already signed up without being approved/disapproved',
                    });
                    return;
                }
            }

            const usingDefaultTimes = userSelectedDefaultTime(startDate, endDate, event);
            if (!usingDefaultTimes) {
                return res.status(400).json({
                    message: 'Must use default hours upon initial signup',
                });
            }

            const volunteer = {
                start: startDate,
                end: endDate,
                usingDefaultTimes,
                approved: eventUserRole === 'admin' || usingDefaultTimes,
                volunteer: {
                    firstName: eventUserFullInfo.firstName,
                    lastName: eventUserFullInfo.lastName,
                    email: eventUserFullInfo.email,
                    id: eventUser,
                },
                decisionMade: eventUserRole === 'admin' || usingDefaultTimes,
            };

            const newEvent = await MongooseConnector.addVolunteerToEvent(eventId, volunteer);

            const hoursBetweenTimes = hoursBetween(event.end, event.start);
            const success = await MongooseConnector.addScheduledHoursToVolunteer(volunteer.volunteer.id, hoursBetweenTimes);
            checkSuccessFull(res, newEvent && success, {
                newEvent
            });
        });
    });

    // This will require authentication
    app.put('/api/event/:eventId/volunteer/approve', isUserAdmin, async (req, res) => {
        withEventChangeAndEventId(req, res, false, async (startDate, endDate, eventUser, eventId) => {
            let volunteerId = req.body.volunteer;
            const approved = req.body.approved;

            if (approved !== true && approved !== false) {
                onInvalidUserInput(res);
                return;
            }

            if (!confirmValidObjectId(volunteerId)) {
                onInvalidUserInput(res);
                return;
            }
            volunteerId = ObjectId(volunteerId);

            const eventUserRole = req.locals.user?.role;
            if (!validHourApprovalRoles.has(eventUserRole)) {
                res.status(403).json({
                    message: 'Insufficient role for approving an event',
                });
                return;
            }

            const event = await checkAndRetrieveEvent(eventId, res);
            if (!event) {
                return;
            }

            const volunteerEvent = event.volunteers.find(v => volunteerId.equals(v.volunteer.id));
            if (!volunteerEvent) {
                res.status(404).json({
                    message: 'Volunteer not signed up for event',
                });
                return;
            }

            if ((volunteerEvent.decisionMade && (volunteerEvent.approved === approved)) ||
                ((volunteerEvent.approved === approved) && volunteerEvent.usingDefaultTimes)) {
                res.status(200).json({
                    message: 'Already has same approval status',
                });
                return;
            }

            const newEvent = await MongooseConnector.approveCustomEventHours(eventId, volunteerId, approved);

            let success = true;
            if (!volunteerEvent.completedStatusSet) {
                const customHours = hoursBetween(volunteerEvent.end, volunteerEvent.start);
                if (approved) {
                    success = await MongooseConnector.addScheduledHoursToVolunteer(volunteerId, customHours);
                } else if (volunteerEvent.decisionMade) {
                    success = await MongooseConnector.addScheduledHoursToVolunteer(volunteerId, -1 * customHours);
                }
            }
            
            checkSuccessFull(res, newEvent && success, {
                newEvent
            });
        });
    });

    // This will require authentication
    app.post('/api/event/:eventId/volunteer/custom-hours', isUserApproved, async (req, res) => {
        Logger.log('POST: Custom hours');

        withEventChangeAndEventId(req, res, true, async (startDate, endDate, eventUser, eventId) => {
            const eventUserRole = req.locals.user.role;

            const event = await checkAndRetrieveEvent(eventId, res);
            if (!event) {
                return;
            }

            if ((new Date()).getTime() >= event.start) {
                return res.status(403).json({
                    message: 'The event is past the start time. No one may sign up anymore',
                });
            }

            const usingDefaultTimes = userSelectedDefaultTime(startDate, endDate, event);

            const volunteerEvent = event.volunteers.find(v => eventUser.equals(v.volunteer?.id));
            if (!volunteerEvent) {
                return res.status(403).json({
                    message: 'Must sign up for the event before requesting custom hours',
                });
            }

            const newVolunteer = volunteerEvent.volunteer;
            const volunteer = {
                start: startDate,
                end: endDate,
                usingDefaultTimes,
                approved: eventUserRole === 'admin' || usingDefaultTimes,
                volunteer: newVolunteer,
                decisionMade: eventUserRole === 'admin' || usingDefaultTimes,
            };

            let newEvent = await MongooseConnector.setCustomHoursForEvent(eventId, eventUser, volunteer);

            let hoursAdjustment = 0;
            if (volunteer.approved && volunteerEvent.approved) {
                // User was approved before and is still approved but hours is changing
                hoursAdjustment = hoursBetween(volunteer.start, volunteer.end) -
                                    hoursBetween(volunteerEvent.start, volunteerEvent.end);
            } else if (!volunteer.approved && volunteerEvent.approved) {
                // User needs their scheduled hours removed since they will now be pending
                hoursAdjustment = -1 * hoursBetween(volunteerEvent.start, volunteerEvent.end);
            } else if (volunteer.approved && !volunteerEvent.approved) {
                // User now just needs to have the new hours scheduled
                hoursAdjustment = hoursBetween(volunteer.start, volunteer.end);
            }
            // If none of the above conditions are true, then the user moved into rejected from pending state

            console.log(`Making scheduled hours adjustment of ${hoursAdjustment}`);
            let success = true;
            if (hoursAdjustment !== 0) {
                success = await MongooseConnector.addScheduledHoursToVolunteer(eventUser, hoursAdjustment);
            }
            
            checkSuccessFull(res, newEvent && success, {
                newEvent
            });
        });
    });

    app.put('/api/event/:eventId/volunteer/:volunteerId/update-hours-completed', isUserAdmin, async (req, res) => {
        Logger.log("PUT: Updating Individual Hour Completion Status...");

        const { newCompleteStatus } = req.body;

        if (newCompleteStatus === null || newCompleteStatus === undefined) {
            onInvalidUserInput(res, 'Completion status missing');
            return;
        }

        let eventId = req.params.eventId;

        if (!confirmValidObjectId(eventId)) {
            onInvalidUserInput(res, 'Bad object ID for eventId');
            return;
        }

        eventId = ObjectId(eventId);

        let volunteerId = req.params.volunteerId;

        if (!confirmValidObjectId(volunteerId)) {
            onInvalidUserInput(res, 'Bad object ID for volunteerId');
            return;
        }

        volunteerId = ObjectId(volunteerId);

        const event = await checkAndRetrieveEvent(eventId, res);
        if (!event) {
            return;
        }

        const volunteerEvent = event.volunteers.find(v => volunteerId.equals(v.volunteer?.id));
        if (!volunteerEvent) {
            return res.status(404).json({
                message: 'Volunteer not signed up for event',
            });
        }

        if (volunteerEvent.completedStatusSet && (volunteerEvent.completed === newCompleteStatus)) {
            return res.status(200).json({
                successful: true,
            });
        }

        const defaultHoursBetween = hoursBetween(event.end, event.start);
        let timeBetween;
        if (volunteerEvent.usingDefaultTimes) {
            timeBetween = defaultHoursBetween;
        } else if (volunteerEvent.start && volunteerEvent.end) {
            timeBetween = hoursBetween(volunteerEvent.end, volunteerEvent.start);
        } else {
            timeBetween = defaultHoursBetween;
        }

        const success = await MongooseConnector.updateHoursAsComplete(eventId,
                                                                    volunteerId,
                                                                    timeBetween,
                                                                    volunteerEvent,
                                                                    newCompleteStatus);

        checkSuccess(res, success);
    });
}