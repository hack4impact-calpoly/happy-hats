/* API Endpoints for calendar */
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { Logger } = require("@hack4impact/logger");
const { CalendarEventTypes } = require('./models/calendar-schema');
const eventVolunteerApi = require('./event-volunteers/event-volunteer-api');
const capeOrdersApi = require('./cape-orders/cape-orders-api');

const {
  checkResourceAndAuth,
  checkSuccess,
  checkEventChangeEndpointBody,
  onInvalidEventId,
  onInvalidUserInput,
  getEventUserType,
} = require('./helpers');

// ================  Data  ======================
const validEventCreationRoles = new Set(['admin']);
// ==============================================

module.exports = (app) => {
  app.get('/api/all-events', async (req, res) => {
    const events = await MongooseConnector.getAllCalendarEvents();
    res.status(200).json({
      events: events
    });
  });

  /* Main endpoint for retrieving events to be displayed to user */
  app.get('/api/events', async (req, res) => {
    const eventUserType = getEventUserType();
    let events;
    switch (eventUserType) {
      case 'volunteer':
      case 'admin':
        events = await MongooseConnector.getEventsWithFilter({
          eventType: CalendarEventTypes.VOLUNTEER,
        });
        break;
      case 'hospital':
        res.status(403).json({
          message: 'Hospitals do not need access to normal calendar events',
        });
        break;
      default:
        // In this case something bad happened. The user's account type
        // would be something other than the 3 things above
        res.json(500).json({
          message: 'Unknown event user type found',
        });
        return;
    }

    res.status(200).json({
      events: events,
    });
  });

  app.get('/api/event/:eventId', async (req, res) => {
    let { eventId } = req.params;

    if (!confirmValidObjectId(eventId)) {
      onInvalidUserInput(res);
      return;
    }

    const eventUserType = getEventUserType();
    let event;

    switch (eventUserType) {
      case 'volunteer':
      case 'admin':
        event = await MongooseConnector.getEventsWithFilter({
          eventType: CalendarEventTypes.VOLUNTEER,
          _id: mongoose.Types.ObjectId(eventId),
        });
        break;
      case 'hospital':
        res.status(403).json({
          message: 'Hospitals do not need access to normal calendar events',
        });
        break;
      default:
        // In this case something bad happened. The user's account type
        // would be something other than the 3 things above
        res.json(500).json({
          message: 'Unknown event user type found',
        });
        return;
    }

    if (!event || event.length === 0) {
      onInvalidEventId(res);
      return;
    }

    res.status(200).json({
      event,
    });
  });

  // This will require authentication
  app.post('/api/event', async (req, res) => {
    Logger.log("POST: Creating Calendar Event...");

    checkEventChangeEndpointBody(req, res, true, async (startDate, endDate, eventUser) => {
      const { title, description } = req.body;

      if (!title || !description) {
        onInvalidUserInput(res);
        return;
      }

      if (!validEventCreationRoles.has(getEventUserType())) {
        res.status(403).json({
          message: 'Only admins can create events',
        });
        return;
      }

      const conflictingEvents = await MongooseConnector.getEventsWithFilter({
        start: {
          $lte: endDate,
        },
        end: {
          $gte: startDate,
        }
      });

      if (conflictingEvents && conflictingEvents.length > 0) {
        onInvalidUserInput(res, 'Start date and end date overlap with another event');
        return;
      }

      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser: eventUser,
        eventType: CalendarEventTypes.VOLUNTEER,
        title: title,
        description: description,
      };
      const success = await MongooseConnector.saveCalendarEvent(calendarEvent);
      
      checkSuccess(res, success, 201);
    });
  });

  // This will require authentication
  app.delete('/api/event', async (req, res) => {
    const { eventId, eventUser } = req.body;
    const everythingValidated = await checkResourceAndAuth(res, eventId, eventUser);
      // We already sent a response
      if (!everythingValidated) {
        return;
      }

    const success = await MongooseConnector.deleteCalendarEvent(eventObjectId);

    checkSuccess(res, success);
  });

  eventVolunteerApi(app);
  capeOrdersApi(app);
};