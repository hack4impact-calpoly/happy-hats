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
          defaultView: "month",
          views: ["month", "week"],
          components: {
            event: CapeOrderEvent,
            week: {
              header: CapeHeaderComponent
            },
            month: {
              dateHeader: CapeHeaderComponent
            }
          },
        };
      }
      case 'admin': {
        return {
          defaultView: "week",
          views: ["month", "week", "day"],
          components: {
            event: EventComp,
            week: {
              header: CapeHeaderComponent
            },
            month: {
              dateHeader: CapeHeaderComponent
            }
          },
          ...eventUser,
        };
      }
      case 'volunteer': {
        return {
          defaultView: "week",
          views: ["month", "week", "day"],
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
    const { events } = this.props.data;
    const whereToStart = new Date();
    whereToStart.setHours(whereToStart.getHours() - 5);
    return (
      <div>
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
          onSelectEvent={(event) => console.log('seclted event', event)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh', margin: '1% 2%' }}
          {...this.getCorrectCalendarByAccount()}
          events={events || []}
        />
      </div>
    );
  }
}

export default withFetch(Calendar, 'http://localhost:3001/events');
