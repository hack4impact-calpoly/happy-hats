/* API Endpoints for calendar */
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { Logger } = require("@hack4impact/logger");
const { CalendarEventTypes } = require('./models/calendar-schema');
const eventVolunteerApi = require('./event-volunteers/event-volunteer-api');
const { isUserAuthenticated, isUserApproved, isUserAdmin } = require("../middleware");
const {
  checkEventChangeEndpointBody,
  onInvalidUserInput,
  confirmValidObjectId,
  checkSuccess,
  checkSuccessFull,
  checkResourceAndAuth
} = require('./helpers');

// ================  Data  ======================
const validEventCreationRoles = new Set(['admin']);
// ==============================================

module.exports = (app) => {
  app.get('/api/all-events', isUserApproved, async (req, res) => {
    const events = await MongooseConnector.getAllCalendarEvents();
    res.status(200).json({
      events: events
    });
  });

  /* Main endpoint for retrieving events to be displayed to user */
  app.get('/api/events', isUserApproved, async (req, res) => {
    const eventUserRole = req.locals.user.role;
    let events;
    switch (eventUserRole) {
      case 'volunteer':
      case 'admin':
        events = await MongooseConnector.getEventsWithFilter({
          eventType: CalendarEventTypes.VOLUNTEER,
        });
        break;
      
      case 'hospital': {
        // TODO
        break;
      }
      case 'admin': {
        events = await MongooseConnector.getEventsWithFilter({
          eventType: CalendarEventTypes.VOLUNTEER,
        });
        break;
      }
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

  app.get('/api/event/:eventId', isUserAuthenticated, async (req, res) => {
    let { eventId } = req.params;

    if (!confirmValidObjectId(eventId)) {
      onInvalidUserInput(res);
      return;
    }

    const eventUserRole = req.locals.user.role;
    let event;

    switch (eventUserRole) {
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
  });

  // This will require authentication
  app.post('/api/event', isUserAdmin, async (req, res) => {
    Logger.log("POST: Creating Calendar Event...");

    checkEventChangeEndpointBody(req, res, true, async (startDate, endDate, eventUser) => {
      const { title, description } = req.body;

      if (!title) {
        onInvalidUserInput(res);
        return;
      }

      if (!validEventCreationRoles.has(req.locals.user.role)) {
        res.status(403).json({
          message: 'Only admins can create events',
        });
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
      const eventCreated = await MongooseConnector.saveCalendarEvent(calendarEvent);
      
      checkSuccessFull(res, !!eventCreated, {
        newEvent: eventCreated,
      }, 201);
    });
  });

  // This will require authentication
  app.delete('/api/event', isUserApproved, async (req, res) => {
    const { eventId } = req.body;

    const everythingValidated = await checkResourceAndAuth(res, eventId, req.locals.user.role);
    // We already sent a response
    if (!everythingValidated) {
      return;
    }

    const success = await MongooseConnector.deleteCalendarEvent(mongoose.Types.ObjectId(eventId));

    checkSuccess(res, success);
  });

  eventVolunteerApi(app);

};
