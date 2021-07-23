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

            const alreadySignedUp = event.volunteers.find(v => eventUser.equals(v.volunteer?.id));
            if (alreadySignedUp) {
                if (alreadySignedUp.decisionMade) {
                    if (alreadySignedUp.approved === true) {
                        res.status(403).json({
                            message: 'Already signed up',
                        });
                        return;
                    } else if ((alreadySignedUp.start && (startDate.getTime() == alreadySignedUp.start)) &&
                        (alreadySignedUp.end && (endDate.getTime() == alreadySignedUp.end))) {
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
            
            checkSuccessFull(res, newEvent, {
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

            const alreadySignedUp = event.volunteers.find(v => volunteerId.equals(v.volunteer.id));
            if (!alreadySignedUp) {
                res.status(404).json({
                    message: 'Volunteer not signed up for event',
                });
                return;
            }

            if ((alreadySignedUp.decisionMade && (alreadySignedUp.approved === approved)) ||
                ((alreadySignedUp.approved === approved) && alreadySignedUp.usingDefaultTimes)) {
                res.status(200).json({
                    message: 'Already has same approval status',
                });
                return;
            }

            const newEvent = await MongooseConnector.approveCustomEventHours(eventId, volunteerId, approved);
            
            checkSuccessFull(res, newEvent, {
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
            const { firstName, lastName, email } = req.locals.user;
            const newVolunteer = volunteerEvent ? {
                firstName,
                lastName,
                email,
                id: eventUser,
            } : volunteerEvent.volunteer;

            const volunteer = {
                start: startDate,
                end: endDate,
                usingDefaultTimes,
                approved: eventUserRole === 'admin' || usingDefaultTimes,
                volunteer: newVolunteer,
                decisionMade: eventUserRole === 'admin' || usingDefaultTimes,
            };

            let newEvent;
            if (!volunteerEvent) {
                newEvent = await MongooseConnector.addVolunteerToEvent(eventId, volunteer);
            } else {
                newEvent = await MongooseConnector.setCustomHoursForEvent(eventId, eventUser, volunteer);
            }
            
            checkSuccessFull(res, newEvent, {
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

        if (volunteerEvent.completed === newCompleteStatus) {
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

        const helperList = [[volunteerId, timeBetween]];
        const success = await MongooseConnector.updateHoursAsComplete(eventId, helperList, newCompleteStatus);

        checkSuccess(res, success);
    });
}