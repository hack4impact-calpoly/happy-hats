import './Calendar.css';

import React from "react";
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import capeImg from '../../imgs/cape.png';
import withFetch from '../WithFetch';

const localizer = momentLocalizer(moment);

function EventComp(props) {
  // console.log(props);
  return (
    props.title.includes("title") ? <p>Interesting</p> : XEventComp(props)
  );
}

function XEventComp(props) {
  return (
    <p>Other</p>
  );
}

function CapeOrderEvent(props) {
  return (
    <p class="text-center m-0">CAPE ORDER</p>
  );
}

function CapeHeaderComponent(props) {
  return (
    <div style={{position: "relative"}}>
      <img style={{position: 'absolute', left: '10px'}} width="20" alt="Cape order" src={capeImg} />
      <header>{props.label}</header>
    </div>
  );
}

const eventUser = {
  messages: {
    showMore: total => (
      <div
        style={{ cursor: 'pointer' }}
        onMouseOver={e => {
          e.stopPropagation();
          e.preventDefault();
        }}
      >{`+${total} more`}
      </div>
    ),
  },
}

class Calendar extends React.Component {
  getCorrectCalendarByAccount() {
    switch (this.props.accountType) {
      case 'hospital': {
        return {
          components: {
            event: CapeOrderEvent,
            month: {
              dateHeader: CapeHeaderComponent
            }
          },
        };
      }
      case 'admin': {
        return {
          components: {
            event: EventComp,
            month: {
              dateHeader: CapeHeaderComponent
            }
          },
          ...eventUser,
        };
      }
      case 'volunteer': {
        return {
          components: {
            event: EventComp,
          },
          ...eventUser,
        };
      }
      default: {
        console.log('Invalid account type!');
        return {};
      }
    }
  }

  render() {
    const events = this.props.data;
    const whereToStart = new Date();
    console.log('temp');
    whereToStart.setHours(whereToStart.getHours() - 5);
    return (
      <main>
        <BigCalendar
          localizer={localizer}
          defaultDate={new Date()}
          timeslots={2}
          step={20}
          scrollToTime={whereToStart}
          showMultiDayTimes={true}
          selectable={true}
          popup={false}
          onSelectSlot={() => console.log('hello')}
          onSelectEvent={(event) => console.log('selected event', event)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh', margin: '1% 2%' }}
          defaultView="month"
          views={["month"]}
          {...this.getCorrectCalendarByAccount()}
          events={events || []}
        />
      </main>
    );
  }
}

const calendarEventFormatter = ({events}) => {
  if (!events) {
    return;
  }
  for (const ev of events) {
    console.log(ev);
    ev.start = new Date(ev.start);
    ev.end = new Date(ev.end);
  }

  return events;
};

export default withFetch(Calendar, 'http://localhost:3001/api/events?event_user=4edd40c86762e0fb12000003', calendarEventFormatter);
