import './Event.css';

export function EventComp(props) {
  return <p className="event-month-view">{props.title}</p>;
}

export function eventTransformer(ev) {
  ev.start = new Date(ev.start);
  ev.end = new Date(ev.end);

  for (const vol of ev.volunteers) {
    vol.start = new Date(vol.start);
    vol.end = new Date(vol.end);
  }
}
