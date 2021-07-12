import './Calendar.css';
import React from 'react';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import capeImg from '../../imgs/cape.png';
import withFetch from '../WithFetch';
import { EventComp, eventTransformer } from './event/Event';
import DayInformation from './day-info/DayInformation';
import withEventDialog from './event-dialog/WithEventDialog';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { compareDatesWithoutTime, findNearestWeekday } from '../../utility/date-time';
import { USER_ROLES } from '../../store/user/User';

const localizer = momentLocalizer(moment);

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

function AddEvent(props) {
  return (
    <div className="d-flex justify-content-between">
      <IconButton className="add-event" aria-label="new event" onClick={() => props.createNewEvent()}>
        <AddIcon style={{ color: 'var(--font-color)' }} />
      </IconButton>
      <button className="date-number" onClick={props.onDrillDown}  role="cell">{props.label}</button>
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
};

class Calendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentViewDate: findNearestWeekday(new Date()),
      currentCalendarMonth: new Date().getMonth(),
      events: this.props?.fetchedData || [],
      eventEditor: null,
    };
  }

  setStateEasy(newState) {
    this.setState({
      ...this.state,
      ...newState,
    });
  }

  eventUpdaterChecker(oldProps, oldState) {
    if (oldProps.fetchedData !== this.props.fetchedData) {

      const eventEditorFn = getRemoveAndAddEventFn(this.props.fetchedData);

      const newFn = (ev) => {
        this.setStateEasy({
          events: eventEditorFn(ev) || [],
        });
      };

      this.setStateEasy({
        events: this.props?.fetchedData,
        eventEditor: newFn,
      });
    }
  }

  componentDidUpdate(oldProps, oldState) {
    this.eventUpdaterChecker(oldProps, oldState);
  }

  customDayPropGetter(date) {
    const base = {
      className: 'day-outline',
    }

    // Best not to question this. Fixes some border radius styling for special backgrounds
    if ((date.getDay() === 1 || date.getDay() === 5) &&
        ((compareDatesWithoutTime(date, new Date()) && date.getMonth() === this.state.currentCalendarMonth &&
          (date.getDay() !== 1 || date.getDate() < 5)) ||
        (date.getMonth() > this.state.currentCalendarMonth))) {
      base.className += ` day-outline-bottom-${date.getDay() === 1 ? 'left' : 'right'}`;
    }

    return base;
  }

  getCorrectCalendarByAccount() {
    let componentModifications;
    let generalModifications;

    switch (this.props.user.role) {
      case USER_ROLES.HOSPITAL: {
        componentModifications = {
          event: CapeOrderEvent,
          month: {
            dateHeader: CapeHeaderComponent
          }
        };
        break;
      }
      case USER_ROLES.ADMIN: {
        componentModifications = {
          event: EventComp,
          month: {
            dateHeader: (props) => (
              <AddEvent createNewEvent={() => this.createNewEvent(props.date)} {...props} />
            ),
          }
        };
        generalModifications = eventUser;
        break;
      }
      case USER_ROLES.VOLUNTEER: {
        componentModifications = {
          event: EventComp,
        };
        generalModifications = eventUser;
        break;
      }
      default: {
        console.log('Invalid account type!');
        return {};
      }
    }

    return {
      components: {
        ...componentModifications,
      },
      ...generalModifications,
    };
  }

  // Assumes start and end date in same day
  // Could be improved with a data structure given time
  getEventsOnDate(date, events) {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    return events.filter(ev => {
      const convertedDate = new Date(ev.start);
      convertedDate.setHours(0, 0, 0, 0); // Go to start of day
      return day.getTime() === convertedDate.getTime();
    });
  }

  onEventSelected(event) {
    this.props.dialogOptions.handleEventDialogOpen(event, this.state.eventEditor);
  }

  createNewEvent(day) {
    this.props.dialogOptions.createEvent(day, this.state.eventEditor, this.getEventsOnDate(day));
  }

  onDrillDown(date) {
    if (date !== this.state.currentViewDate) {
      this.setStateEasy({
        currentCalendarMonth: date.getMonth(),
        currentViewDate: date,
      });
    }
  }

  onNavigate(newDate) {
    if (newDate.getMonth() !== this.state.currentCalendarMonth) {
      setTimeout(() => {
        this.setStateEasy({
          currentCalendarMonth: newDate.getMonth(),
        });
      }, 0);
    }
  }

  render() {
    const events = this.state.events;
    console.log(events); // Leaving in for now cuz convenient sometimes

    if (this.props.user.role === USER_ROLES.NONE) {
      return null;
    }

    return (
      <main>
        <DayInformation
          date={this.state.currentViewDate}
          events={this.getEventsOnDate(this.state.currentViewDate, events)}
          onEventSelected={(event) => this.onEventSelected(event)}
        />
        <BigCalendar
          localizer={localizer}
          defaultDate={new Date()}
          timeslots={2}
          step={20}
          dayPropGetter={(d) => this.customDayPropGetter(d)}
          showMultiDayTimes={true}
          selectable={true}
          popup={false}
          onDrillDown={(d) => this.onDrillDown(d)}
          onView={() => null}
          onNavigate={(d) => this.onNavigate(d)}
          onSelectEvent={(event) => this.onEventSelected(event)}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '80vh', width: '65vw', paddingLeft: '10%', margin: 0, }}
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
    eventTransformer(ev);
  }

  events.sort((a, b) => {
    return a.start?.getTime() < b.start?.getTime();
  });

  return events;
};

const getRemoveAndAddEventFn = (events) => {
  if (!events) {
    return () => null;
  }

  const eventMap = new Map();
  for (const ev of events) {
    eventMap.set(ev._id, ev);
  }

  return (newEvent) => {
    if (!newEvent || !newEvent._id) {
      return [];
    }

    // const prevEvent = eventMap.get(newEvent._id);
    eventMap.set(newEvent._id, newEvent);

    return [...eventMap.values()];
  };
};

export default withFetch(withEventDialog(Calendar), 'events', {
  formatter: calendarEventFormatter,
  useMock: false,
  withAuth: true,
});
