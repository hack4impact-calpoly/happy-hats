/* API Endpoints for calendar */
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { CalendarEventTypes } = require('./models/calendar-schema');
const { isUserApproved } = require("../middleware");

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
  app.get('/api/all-events', isUserApproved, async (req, res) => {
    const events = await MongooseConnector.getAllCalendarEvents();
    res.status(200).json({
      events: events
    });
  });

  /* Main endpoint for retrieving events to be displayed to user */
  app.get('/api/events', isUserApproved, async (req, res) => {
    const eventUserType = req.locals.user.role;
    let events;
    switch (eventUserType) {
      case 'volunteer': {
        events = await MongooseConnector.getEventsWithFilter({
          eventType: CalendarEventTypes.VOLUNTEER,
        });
        break;
      }
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
      default: {
        // In this case something bad happened. The user's account type
        // would be something other than the 3 things above
        res.json(500).json({
          message: 'Unknown event user type found',
        });
        return;
      };
    }

    res.status(200).json({
      events: events,
    });
  });

  app.get('/api/event', isUserApproved, async (req, res) => {
    // still need to figure this out
    res.status(200).json({
      event: {},
    });
  });

  // This will require authentication
  app.post('/api/event/volunteer', isUserApproved, async (req, res) => {
    checkVolunteerEndpointBody(req, res, async (startDate, endDate, eventUser) => {
      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser,
        eventType: CalendarEventTypes.VOLUNTEER,
      };
      const success = await MongooseConnector.saveCalendarEvent(calendarEvent);
      
      checkSuccess(res, success);
    });
  });

  // This will require authentication
  app.put('/api/event/volunteer', isUserApproved, async (req, res) => {
    checkVolunteerEndpointBody(req, res, async (startDate, endDate, eventUser) => {
      const { eventId } = req.body;
      const everythingValidated = await checkResourceAndAuth(res, eventId, req.locals.user.role);
      // We already sent a response
      if (!everythingValidated) {
        return;
      }
      
      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser,
        eventType: CalendarEventTypes.VOLUNTEER,
      };
      const success = await MongooseConnector.updateCalendarEvent(eventObjectId, calendarEvent);
  
      checkSuccess(res, success);
    });
  });

  // This will require authentication
  app.post('/api/event/capeorder', isUserApproved, async (req, res) => {
    checkCapeOrderEndpointBody((req, res, async (startDate, endDate, eventUser) => {
      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser,
        eventType: CalendarEventTypes.CAPE_ORDER,
        allDay: true,
      };
      const success = await MongooseConnector.saveCalendarEvent(calendarEvent);
      
      checkSuccess(res, success);
    }));
  });

  // This will require authentication
  app.put('/api/event/capeorder', isUserApproved, async (req, res) => {
    checkCapeOrderEndpointBody(req, res, async (startDate, endDate, eventUser) => {
      const { eventId } = req.body;
      const everythingValidated = await checkResourceAndAuth(res, eventId, req.locals.user.role);
      // We already sent a response
      if (!everythingValidated) {
        return;
      }
      
      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser,
        eventType: CalendarEventTypes.CAPE_ORDER,
        allDay: true,
      };
      const success = await MongooseConnector.updateCalendarEvent(eventObjectId, calendarEvent);
  
      checkSuccess(res, success);
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
};