import './DayInformation.css';

import { getAMPMTimeRange, getDayMonthDateStr } from '../../../utility/date-time';
import { useEffect, useState } from 'react';

function DayEvent(props) {
  return (
    <li key={props.index}>
      <p>{getAMPMTimeRange(props.event.start, props.event.end)}</p>
      <button onClick={() => props.handleClickOpen(props.event)}>Event: {props.event.title}</button>
    </li>
  );
}

function sortEvents(events) {
  const newEvents = [...events];
  newEvents.sort((a, b) => {
    return a.start?.getTime() - b.start?.getTime();
  });

  return newEvents;
}

function DayInformation(props) {
  const { events, date } = props;

  const [sortedEvents, setSortedEvents] = useState(events);

  useEffect(() => {
    setSortedEvents(sortEvents(events));
  }, [events]);

  return (
    <section className="day-box">
      <h4>{getDayMonthDateStr(date)}</h4>
      {events?.length > 0 ?
        sortedEvents.map((ev, ind) => {
          return <DayEvent key={ind} event={ev} index={ind} handleClickOpen={props.onEventSelected} />
        }) :
      "No events on this day!"}
    </section>
  );
}

export default DayInformation;
