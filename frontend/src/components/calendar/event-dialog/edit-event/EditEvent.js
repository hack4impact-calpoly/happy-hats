import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../../../utility/request-helpers';
import { getTopOfDay, getAdjustedTimeFromDate, getHoursMinutesStr } from '../../../../utility/date-time';
import { eventTransformer } from '../../event/Event';
import EventForm, { getTimeSlotFromEvent } from '../event-form/EventForm';

const timeSlotToStartEndMap = new Map([
  ['10AM - 12PM', {
    start: (date) => getAdjustedTimeFromDate(date, 10),
    end: (date) => getAdjustedTimeFromDate(date, 12),
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

function EditEvent(props) {
  const { date } = props;
  const startOfDayDate = getTopOfDay(date);

  const editEvent = async (values) => {
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

      const resp = await RequestPayloadHelpers.makeRequest(`event/${props.event._id}`, 'PUT', event,
        getAuthHeaderFromSession(props.user.cognitoSession), true);
      
      if (!resp || !resp.newEvent) {
        alert('Edit event failed. Please try again later!');
        return;
      }

      eventTransformer(resp.newEvent);
      props.eventEditor(resp.newEvent);
      props.updateEvent(resp.newEvent);
      props.onEditMade();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <EventForm
      onSubmit={editEvent}
      initialValues={{
        ...props.event,
        startTime: getHoursMinutesStr(props.event.start),
        endTime: getHoursMinutesStr(props.event.end),
        timeSlot: getTimeSlotFromEvent(props.event),
      }}
      buttonText="Edit Event"
      disableTime={props.event?.volunteers && props.event.volunteers.length > 0}
    />
  );
}

export default EditEvent;
