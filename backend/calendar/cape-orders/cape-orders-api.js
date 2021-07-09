const mongoose = require('mongoose');
const MongooseConnector = require('../../db-helper');
const { Logger } = require("@hack4impact/logger");
const { CalendarEventTypes } = require('../models/calendar-schema');

const {
    checkCapeOrderEndpointBody,
    checkResourceAndAuth,
    checkSuccess,
} = require('../helpers');

module.exports = (app) => {
    // This will require authentication
    app.post('/api/event/capeorder', async (req, res) => {
        checkCapeOrderEndpointBody((req, res, async (startDate, endDate, eventUser) => {
            const calendarEvent = {
                start: startDate,
                end: endDate,
                eventUser: mongoose.Types.ObjectId(eventUser),
                eventType: CalendarEventTypes.CAPE_ORDER,
                allDay: true,
            };
            const success = await MongooseConnector.saveCalendarEvent(calendarEvent);
            
            checkSuccess(res, success);
        }));
    });

    // This will require authentication
    app.put('/api/event/capeorder', async (req, res) => {
        checkCapeOrderEndpointBody(req, res, async (startDate, endDate, eventUser) => {
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
                eventType: CalendarEventTypes.CAPE_ORDER,
                allDay: true,
            };
            const success = await MongooseConnector.updateCalendarEvent(eventObjectId, calendarEvent);
        
            checkSuccess(res, success);
        });
    });
}