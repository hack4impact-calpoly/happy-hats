const mongoose = require('mongoose');
const MongooseConnector = require('../db-helper');

const confirmValidCompDate = (date, compDate = Date.now()) => {
  return getDateObject(date) >= compDate;
};

const getDateObject = (date) => {
  numDate = +date;
  if (!!numDate) {
    return new Date(numDate);
  }

  const convAttempt = new Date(date);
  return !isNaN(convAttempt.getTime()) && convAttempt;
};

const confirmValidDate = (date) => {
  return !!getDateObject(date);
};

const confirmValidObjectId = (objectId) => {
  return !!objectId && mongoose.isValidObjectId(objectId);
};

const getStartOfDay = (date) => {
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);
  return dateCopy;
};

const checkSuccess = (res, val, status = 200) => {
  checkSuccessFull(res, val, {
    successful: val,
  }, status);
};

const checkSuccessFull = (res, toCheck, retObj, status = 200) => {
  if (!toCheck) {
    res.status(500).json({
      message: "Database error",
    });
    return;
  }

  return res.status(status).json(retObj);
};

const onInvalidUserInput = (res, message = "Bad given input") => {
  res.status(400).json({
    message,
  });

  return false;
};

const onInvalidEventId = (res) => {
  res.status(404).json({
    message: "Event not found",
  });

  return false;
};

const checkVolunteerExistence = async (v, res) => {
  const vExists = await MongooseConnector.volunteerExists(v);
  if (!vExists) {
    res.status(404).json({
      message: "Volunteer does not exist",
    });
  }

  return vExists;
};

const checkResourceAndAuth = async (res, eventId, eventUser) => {
  if (!confirmValidObjectId(eventId)) {
    res.status(400).json({
      message: "Required body not included or malformed",
    });
    return false;
  }

  const eventUserObjectId = mongoose.Types.ObjectId(eventUser);
  const eventObjectId = mongoose.Types.ObjectId(eventId);
  const retrievedUserObjectId = await MongooseConnector.findCalendarEventUser(
    eventObjectId
  );

  if (!retrievedUserObjectId) {
    onInvalidEventId(res);
    return false;
  }

  // Confirm person deleting this is one who made it
  // TEMPORARY until clarified. Just proof of conect I suppose for now
  if (!eventUserObjectId.equals(retrievedUserObjectId)) {
    res.status(401).json({
      message: "Authorization denied",
    });
    return false;
  }

  return true;
};

const checkEventChangeEndpointBody = (
  req,
  res,
  requiresValidDates,
  onSuccess
) => {
  const { start, end } = req.body;
  const eventUser = req.locals.user?._id;

  const checkDates = requiresValidDates || (!!start && !!end);

  if (
    (checkDates && (!confirmValidDate(start) || !confirmValidDate(end))) ||
    !confirmValidObjectId(eventUser)
  ) {
    onInvalidUserInput(res, "Required body not included or malformed");
    return;
  }

  const startDate = getDateObject(start);
  const endDate = getDateObject(end);

  if (checkDates) {
    if (startDate >= endDate) {
      onInvalidUserInput(res, "Start date must come before end date");
      return;
    }
  }

  onSuccess(startDate, endDate, mongoose.Types.ObjectId(eventUser));
};

const checkAndGetEventId = (req, res, onSuccess) => {
  const eventId = req.params.eventId || req.body.eventId;

  if (!eventId || !confirmValidObjectId(eventId)) {
    onInvalidUserInput(res, 'Invalid object ID');
    return;
  }

  onSuccess(mongoose.Types.ObjectId(eventId));
};

// Assume eventId is mongoose object ID
const checkAndRetrieveEvent = async (eventId, res) => {
  const event = await MongooseConnector.findCalendarEventById(eventId);
  if (!event) {
      onInvalidEventId(res);
      return null;
  }

  return event.toObject();
};

const withEventChangeAndEventId = (req, res, requiresValidDates, onSuccess, roundDates = true) => {
  checkEventChangeEndpointBody(
    req,
    res,
    requiresValidDates,
    async (startDate, endDate, eventUser) => {
      if (roundDates && startDate) {
        startDate = roundToMinute(startDate);
      }
      if (roundDates && endDate) {
        endDate = roundToMinute(endDate);
      }
      checkAndGetEventId(req, res, async (eventId) => {
        onSuccess(startDate, endDate, eventUser, eventId);
      });
    }
  );
};

const checkCapeOrderEndpointBody = (req, res, onSuccess) => {
  const { start, eventUser } = req.body;
  if (
    !confirmValidDate(start, getStartOfDay(Date.now())) ||
    !confirmValidObjectId(eventUser)
  ) {
    res.status(400).json({
      message: "Required body not included or malformed",
    });
    return;
  }

  // Set start and end date to full day
  const startDate = getStartOfDay(+start);
  const endDate = new Date(startDate);
  endDate.setHours(23, 59, 59, 999);

  onSuccess(startDate, endDate, eventUser);
};

const roundToMinute = (date) => {
  // https://stackoverflow.com/questions/10789384/round-a-date-to-the-nearest-5-minutes-in-javascript
  const coeff = 1000 * 60; // 1 minute
  return new Date(Math.floor(date.getTime() / coeff) * coeff);
};

const hoursBetween = (d1, d2) => {
  return Math.abs(Math.round(((d1.getTime() - d2.getTime()) / (1000 * 60 * 60)) * 100) / 100);
};

module.exports = {
  confirmValidCompDate,
  getDateObject,
  getStartOfDay,
  confirmValidDate,
  confirmValidObjectId,
  checkCapeOrderEndpointBody,
  checkAndRetrieveEvent,
  checkAndGetEventId,
  checkVolunteerExistence,
  checkResourceAndAuth,
  checkEventChangeEndpointBody,
  withEventChangeAndEventId,
  onInvalidEventId,
  onInvalidUserInput,
  checkSuccess,
  checkSuccessFull,
  hoursBetween,
};
