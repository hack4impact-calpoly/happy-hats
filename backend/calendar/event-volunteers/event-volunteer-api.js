const MongooseConnector = require('../../db-helper');
const { Types: { ObjectId } } = require('mongoose');
const { Logger } = require("@hack4impact/logger");
const { CalendarEventTypes } = require('../models/calendar-schema');

const {
    withEventChangeAndEventId,
    checkResourceAndAuth,
    checkSuccess,
    checkEventChangeEndpointBody,
    onInvalidEventId,
    getEventUserType,
    confirmValidObjectId,
    onInvalidUserInput,
} = require('../helpers');

// ================  Data  ======================
const validVolunteeringRoles = new Set(['volunteer', 'admin']);
const validHourApprovalRoles = new Set(['admin']);
// ==============================================

// Assume eventId is mongoose object ID
const checkAndRetrieveEvent = async (eventId, res) => {
    const event = await MongooseConnector.findCalendarEventById(eventId);
    if (!event) {
        onInvalidEventId(res);
        return null;
    }

    return event;
};

const userSelectedDefaultTime = (startDate, endDate, event) => {
    return event && startDate.getTime() === event.start.getTime() &&
        endDate.getTime() === event.end.getTime();
};

module.exports = (app) => {
    // This will require authentication
    app.post('/api/event/volunteer', async (req, res) => {
        withEventChangeAndEventId(req, res, false, async (startDate, endDate, eventUser, eventId) => {
            const eventUserType = getEventUserType();
            
            if (!validVolunteeringRoles.has(eventUserType)) {
                res.status(403).json({
                    message: 'Insufficient role for joining an event',
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

            // Make sure volunteer actually exists
            if (!checkVolunteerExistence(eventUser, res)) {
                return;
            }

            const alreadySignedUp = event.volunteers.find(v => eventUser.equals(v.volunteer));
            if (alreadySignedUp) {
                if (alreadySignedUp.decisionMade) {
                    if (alreadySignedUp.approved) {
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
                }
            }

            const usingDefaultTimes = userSelectedDefaultTime(startDate, endDate, event);

            const volunteer = {
                start: startDate,
                end: endDate,
                usingDefaultTimes,
                approved: eventUserType === 'admin' || usingDefaultTimes,
                volunteer: eventUser,
                decisionMade: false,
            };

            const success = await MongooseConnector.addVolunteerToEvent(eventId, volunteer);
            
            checkSuccess(res, success);
        });
    });

    // This will require authentication
    app.put('/api/event/volunteer/approve', async (req, res) => {
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

            const eventUserType = getEventUserType();
            if (!validVolunteeringRoles.has(eventUserType)) {
                res.status(403).json({
                    message: 'Insufficient role for joining an event',
                });
                return;
            }

            const event = await checkAndRetrieveEvent(eventId, res);
            if (!event) {
                return;
            }

            const alreadySignedUp = event.volunteers.find(v => volunteerId.equals(v.volunteer));
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

            const success = await MongooseConnector.approveCustomEventHours(eventId, volunteerId, approved);
            
            checkSuccess(res, success);
        });
    });

    // This will require authentication
    app.post('/api/event/volunteer/custom-hours', async (req, res) => {
        withEventChangeAndEventId(req, res, true, async (startDate, endDate, eventUser, eventId) => {
            const eventUserType = getEventUserType();
            if (!validHourApprovalRoles.has(eventUserType)) {
                res.status(403).json({
                    message: 'Invalid role permissions to approve hours',
                });
                return;
            }

            const event = await checkAndRetrieveEvent(eventId, res);
            if (!event) {
                return;
            }

            const volunteerEvent = event.volunteers.find(v => volunteerId.equals(v.volunteer));
            if (volunteerEvent && volunteerEvent.usingDefaultTimes) {
                res.status(404).json({
                    message: 'Volunteer has',
                });
                return;
            }

            const usingDefaultTimes = userSelectedDefaultTime(startDate, endDate, event);
            if (usingDefaultTimes) {
                res.status(200).json({
                    message: 'No need to request ',
                });
                return;
            }

            const newVolunteerEvent = {
                start: startDate,
                end: endDate,
                usingDefaultTimes,
                approved: eventUserType === 'admin' || usingDefaultTimes,
                volunteer: eventUser,
                decisionMade: false,
            };

            const success = await MongooseConnector.approveCustomEventHours(eventId, volunteerId, approved);

            checkSuccess(res, success);
        });
    });

    // This will require authentication
    app.put('/api/event/volunteer', async (req, res) => {
        checkEventChangeEndpointBody(req, res, false, async (startDate, endDate, eventUser) => {
            const { eventId } = req.body;
            const everythingValidated = await checkResourceAndAuth(res, eventId, eventUser);
            // We already sent a response
            if (!everythingValidated) {
                return;
            }
            
            const calendarEvent = {
                start: startDate,
                end: endDate,
                eventUser: eventUserObjectId,
                eventType: CalendarEventTypes.VOLUNTEER,
            };
            const success = await MongooseConnector.updateCalendarEvent(eventObjectId, calendarEvent);
        
            checkSuccess(res, success);
        });
    });
}