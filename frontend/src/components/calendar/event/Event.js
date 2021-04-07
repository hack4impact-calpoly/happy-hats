import './Event.css';

export function EventComp(props) {
  return props.title.includes("title") ? <p className="event-month-view">Interesting</p> : XEventComp(props);
}

function XEventComp(props) {
  return <p>Other</p>;
}
