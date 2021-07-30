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
  onInvalidEventId,
  withEventChangeAndEventId,
  checkAndRetrieveEvent,
  hoursBetween,
} = require('./helpers');

// ================  Data  ======================
const validEventCreationRoles = new Set(['admin']);
// ==============================================

module.exports = (app) => {
  app.get('/api/all-events', isUserApproved, async (req, res) => {
    Logger.log("GET: All calendar events...")
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

  app.put('/api/event/:eventId', isUserAdmin, async (req, res) => {
    Logger.log("PUT: Changing Calendar Event...");

    withEventChangeAndEventId(req, res, true, async (startDate, endDate, eventUser, eventId) => {
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

      const event = await checkAndRetrieveEvent(eventId, res);
      if (!event) {
        return;
      }

      if (event.volunteers && event.volunteers.length > 0 && (startDate || endDate)) {
        if (startDate.getTime() !== event.start.getTime() || endDate.getTime() !== event.end.getTime()) {
          onInvalidUserInput(res, 'Cannot give start/end time')
          return;
        }
      }

      const calendarEvent = {
        ...event,
        start: startDate,
        end: endDate,
        title: title,
        description: description,
      };

      const eventCreated = await MongooseConnector.updateCalendarEvent(eventId, calendarEvent);

      checkSuccessFull(res, !!eventCreated, {
        newEvent: eventCreated,
      }, 200);
    });
  });

  // This will require authentication
  app.delete('/api/event/:eventId', isUserAdmin, async (req, res) => {
    Logger.log("DELETE: Deleting Calendar Event...");

    let eventId = req.params.eventId;

    if (!confirmValidObjectId(eventId)) {
      onInvalidUserInput(res);
      return;
    }

    eventId = mongoose.Types.ObjectId(eventId);

    if (!validEventCreationRoles.has(req.locals.user.role)) {
      res.status(403).json({
        message: 'Only admins can create events',
      });
      return;
    }

    const event = await checkAndRetrieveEvent(eventId, res);
    if (!event) {
      return;
    }

    const success = await MongooseConnector.deleteCalendarEvent(eventId);

    checkSuccess(res, success);
  });

  app.post('/api/event/:eventId/approve-scheduled-hours', isUserAdmin, async (req, res) => {
    Logger.log("POST: Approving all hours of event...");

    let eventId = req.params.eventId;

    if (!confirmValidObjectId(eventId)) {
      onInvalidUserInput(res);
      return;
    }

    eventId = mongoose.Types.ObjectId(eventId);

    const event = await checkAndRetrieveEvent(eventId, res);
    if (!event) {
      return;
    }

    if (event.adminFinished) {
      return res.status(403).json({
        message: 'Event has already been marked as finished and hours approved',
      });
    }

    const defaultHoursBetween = hoursBetween(event.end, event.start);

    const volunteerIdAndHours = event.volunteers?.filter(v => v.approved && v.decisionMade && !v.completed && !v.completedStatusSet)?.map((v) => {
        let timeBetween;
        if (v.usingDefaultTimes) {
          timeBetween = defaultHoursBetween;
        } else if (v.start && v.end) {
          timeBetween = hoursBetween(v.end, v.start);
        } else {
          return null;
        }

        return [v.volunteer.id, timeBetween];
    }).filter(arr => !!arr);

    const newEvent = await MongooseConnector.addCompletedHoursForVolunteers(eventId, volunteerIdAndHours);

    checkSuccessFull(res, !!newEvent, {
      newEvent,
    }, 200);
  });

  eventVolunteerApi(app);
};
