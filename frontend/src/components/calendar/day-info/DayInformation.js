import './DayInformation.css';

import { getAMPMTimeRange, getDayMonthDateStr } from '../../../utility/date-time';

function DayEvent(props) {
  return (
    <li key={props.index}>
      <p>{getAMPMTimeRange(props.event.start, props.event.end)}</p>
      <button onClick={() => props.handleClickOpen(props.event)}>Event: {props.event.title}</button>
    </li>
  );
}

function DayInformation(props) {
  const { events, date } = props;

  return (
    <section className="day-box">
      <h4>{getDayMonthDateStr(date)}</h4>
      {events?.length > 0 ?
        events.map((ev, ind) => {
          return <DayEvent key={ind} event={ev} index={ind} handleClickOpen={props.onEventSelected} />
        }) :
      "No events on this day!"}
    </section>
  );
}

export default DayInformation;
