/* API Endpoints for calendar */
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { Logger } = require("@hack4impact/logger");
const { CalendarEventTypes } = require('./models/calendar-schema');
const eventVolunteerApi = require('./event-volunteers/event-volunteer-api');
const { isUserAuthenticated } = require("../middleware");

const confirmValidDate = (date, compDate = Date.now()) => {
  date = +date;
  return !!date && (new Date(date) >= compDate);
};

const confirmValidObjectId = (objectId) => {
  return !!objectId && mongoose.isValidObjectId(objectId);
};

const getStartOfDay = (date) => {
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
};

const checkSuccess = (res, val) => {
  if (!val) {
    res.status(500).json({
      message: 'Database error',
    });
    return;
  }

  res.status(200).json({
    successful: val,
  });
};

const checkResourceAndAuth = async (res, eventId, userRole) => {
  if (!confirmValidObjectId(eventId)) {
    res.status(400).json({
      message: 'Required body not included or malformed',
    });
    return false;
  }

  if (userRole !== 'admin') {
    res.status(401).json({
      message: 'Insufficient role for resource',
    });
    return false;
  }

  return true;
};

const checkVolunteerEndpointBody = (req, res, onSuccess) => {
  const { start, end } = req.body;
  const eventUser = req.locals.user._id;

  if (!confirmValidDate(start) || !confirmValidObjectId(eventUser) || !confirmValidDate(end)) {
    res.status(400).json({
      message: 'Required body not included or malformed',
    });
    return;
  }

  const startDate = new Date(+start);
  const endDate = new Date(+end);

  if (startDate >= endDate) {
    res.status(400).json({
      message: 'Start date must come before end date',
    });
    return;
  }

  onSuccess(startDate, endDate, mongoose.Types.ObjectId(eventUser));
};

const checkCapeOrderEndpointBody = (req, res, onSuccess) => {
  const { start } = req.body;
  const eventUser = req.locals.user._id;

  if (!confirmValidDate(start, getStartOfDay(Date.now())) || !confirmValidObjectId(eventUser)) {
    res.status(400).json({
      message: 'Required body not included or malformed',
    });
    return;
  }

  // Set start and end date to full day
  const startDate = getStartOfDay(+start);
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  onSuccess(startDate, endDate, eventUser);
};

module.exports = (app) => {
  app.get('/api/all-events', isUserAuthenticated, async (req, res) => {
    const events = await MongooseConnector.getAllCalendarEvents();
    res.status(200).json({
      events: events
    });
  });

  /* Main endpoint for retrieving events to be displayed to user */
  app.get('/api/events', isUserAuthenticated, async (req, res) => {
    const eventUserType = req.locals.user.role;
    let events;
    switch (eventUserType) {
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
        break;}
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
  app.post('/api/event', isUserAuthenticated, async (req, res) => {
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
  app.delete('/api/event', isUserAuthenticated, async (req, res) => {
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
