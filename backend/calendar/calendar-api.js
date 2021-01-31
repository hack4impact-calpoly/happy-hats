// API Endpoints for calendar
const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');
const { CalendarEventTypes } = require('./models/calendar-schema');

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

const checkResourceAndAuth = async (res, eventId, eventUser) => {
  if (!confirmValidObjectId(eventId)) {
    res.status(400).json({
      message: 'Required body not included or malformed',
    });
    return false;
  }

  const eventUserObjectId = mongoose.Types.ObjectId(eventUser);
  const eventObjectId = mongoose.Types.ObjectId(eventId);
  const retrievedUserObjectId = await MongooseConnector.findCalendarEventUser(eventObjectId);

  if (!retrievedUserObjectId) {
    res.status(404).json({
      message: 'Event not found',
    });
    return false;
  }
  
  // Confirm person deleting this is one who made it
  // TEMPORARY until clarified. Just proof of conect I suppose for now
  if (!retrievedUserObjectId || !eventUserObjectId.equals(retrievedUserObjectId)) {
    res.status(401).json({
      message: 'Authorization denied',
    });
    return false;
  }

  return true;
};

const checkVolunteerEndpointBody = (req, res, onSuccess) => {
  const { start, end, eventUser } = req.body;
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

    onSuccess(startDate, endDate, eventUser);
};

const checkCapeOrderEndpointBody = (req, res, onSuccess) => {
  const { start, eventUser } = req.body;
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
  app.get('/api/events', async (req, res) => {
    const events = await MongooseConnector.getAllCalendarEvents();
    res.status(200).json({
      events: events
    });
  });

  app.get('/api/event', async (req, res) => {
    // Not sure what to do here
    res.status(200).json({
      event: {},
    });
  });

  // This will require authentication
  app.post('/api/event/volunteer', async (req, res) => {
    checkVolunteerEndpointBody(req, res, async (startDate, endDate, eventUser) => {
      const calendarEvent = {
        start: startDate,
        end: endDate,
        eventUser: mongoose.Types.ObjectId(eventUser),
        eventType: CalendarEventTypes.VOLUNTEER,
      };
      const success = await MongooseConnector.saveCalendarEvent(calendarEvent);
      
      checkSuccess(res, success);
    });
  });

  // This will require authentication
  app.put('/api/event/volunteer', async (req, res) => {
    checkVolunteerEndpointBody(req, res, async (startDate, endDate, eventUser) => {
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
};