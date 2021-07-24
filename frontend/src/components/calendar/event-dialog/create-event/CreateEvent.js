import './CreateEvent.css';

import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../../../utility/request-helpers';
import { getTopOfDay, getAdjustedTimeFromDate } from '../../../../utility/date-time';
import { eventTransformer } from '../../event/Event';
import EventForm from '../event-form/EventForm';

const timeSlotToStartEndMap = new Map([
  ['10AM - 12PM', {
    start: (date) => getAdjustedTimeFromDate(date, 10),
    end: (date) => getAdjustedTimeFromDate(date, 12),
  }],
  ['12PM - 2PM', {
    start: (date) => getAdjustedTimeFromDate(date, 12),
    end: (date) => getAdjustedTimeFromDate(date, 14),
  }],
  ['12PM - 3PM', {
    start: (date) => getAdjustedTimeFromDate(date, 12),
    end: (date) => getAdjustedTimeFromDate(date, 15),
  }],
  ['1PM - 3PM', {
    start: (date) => getAdjustedTimeFromDate(date, 13),
    end: (date) => getAdjustedTimeFromDate(date, 15),
  }],
  ['Custom', {
    start: (date, dateStr) => getAdjustedTimeFromDate(date, ...dateStr.split(':')),
    end: (date, dateStr) => getAdjustedTimeFromDate(date, ...dateStr.split(':')),
  }],
]);

function CreateEvent(props) {
  const { date } = props;
  const startOfDayDate = getTopOfDay(date);

  const createEvent = async (values) => {
    try {
      let start, end;
      if (values.timeSlot !== 'Custom') {
        start = timeSlotToStartEndMap.get(values.timeSlot).start(startOfDayDate);
        end = timeSlotToStartEndMap.get(values.timeSlot).end(startOfDayDate);
      } else {
        start = timeSlotToStartEndMap.get(values.timeSlot).start(startOfDayDate, values.startTime);
        end = timeSlotToStartEndMap.get(values.timeSlot).end(startOfDayDate, values.endTime);
      }

      const event = {
        start,
        end,
        title: values.title,
        description: values.description,
      };

      const resp = await RequestPayloadHelpers.makeRequest('event', 'POST', event,
        getAuthHeaderFromSession(props.user.cognitoSession), true);
      
      if (!resp || !resp.newEvent) {
        alert('Create event failed. Please try again later!');
        return;
      }

      eventTransformer(resp.newEvent);
      props.eventEditor(resp.newEvent);
      props.handleClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <EventForm
      onSubmit={createEvent}
      buttonText="Create Event"
    />
  );
}

export default CreateEvent;
