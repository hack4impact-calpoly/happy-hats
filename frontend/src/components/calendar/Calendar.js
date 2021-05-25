import './Calendar.css';
import React from 'react';
import { findDOMNode } from 'react-dom';
import moment from 'moment';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import capeImg from '../../imgs/cape.png';
import withFetch from '../WithFetch';
import { EventComp } from './event/Event';
import DayInformation from './day-info/DayInformation';
import withEventDialog from './event-dialog/WithEventDialog';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { compareDatesWithoutTime, findNearestWeekday } from '../../utility/date-time';
import withUser from '../../store/user/WithUser';
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

    this.calendarRef = null;

    this.state = {
      currentViewDate: findNearestWeekday(new Date()),
      currentCalendarMonth: new Date().getMonth(),
    };

    this.setCalendarRef = el => {
      this.calendarRef = el ? findDOMNode(el) : el;
    }
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
            dateHeader: CapeHeaderComponent
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
        // onMonthChange: () => console.log('temp2'),
        month: {
          dateHeader: (props) => (
            <AddEvent createNewEvent={() => this.createNewEvent(props.date)} {...props} />
          ),
        },
        ...componentModifications,
      },
      ...generalModifications,
    };
  }

  componentDidMount() {
    this.modifyCalendar();
  }

  componentDidUpdate() {
    this.modifyCalendar();
  }

  modifyCalendar() {
    const calendar = this.calendarRef;
    
    if (!calendar) {
      return;
    }

    // Max 5 days and each event happens on only 1 day
    const afterPercents = 20;
    const baseWidth = 100.0 / 7;

    // Correspond to sunday/saturday 
    const removals = [0, 5];

    // Modify header
    const header = calendar.querySelector('.rbc-month-header');

    if (header.children.length === 7) {
      for (const toRemove of removals) {
        if (header.children.length > toRemove) {
          header.children[toRemove].remove();
        }
      }
    }

    // Need findDOMNode in BigCalendar to run first
    setTimeout(() => {
      const calendarValues = calendar.querySelectorAll('.rbc-month-row');
      for (const row of calendarValues) {
        const dayBgs = row.querySelector('.rbc-row-bg');
        const dateCells = row.querySelectorAll('.rbc-row-content .rbc-row');
        
        // datecells[0] is day number so should be 7
        if (dayBgs.children.length < 7 || dateCells[0].children.length < 7) {
          return;
        }

        for (const toRemove of removals) {
          if (dateCells) {
            if (dateCells[0].children.length > toRemove) {
              dateCells[0].children[toRemove].remove();
            }
          }
          
          if (dayBgs && dayBgs.children.length > toRemove) {
            dayBgs.children[toRemove].remove();
          }
        }
        
        // Restyle some stuff
        for (let k = 1; k < dateCells.length; k++) {
          const dateCellRow = dateCells[k];

          for (let j = 0; j < dateCellRow.children.length; j++) {
            const rowSegmentClassEle = dateCellRow.children[j];
            /* Need to decrease this or remove it */
            let newSize;
            if (j % 7 === 0) {
              // Lol fixing style is fun. Removing stuff above causes fun stuff to fix
              newSize = Math.round(((Number(rowSegmentClassEle.style.maxWidth?.slice(0, -1)) || 0) / baseWidth) - 1) * afterPercents;
            } else {
              newSize = afterPercents;
            }

            const strPercent = `${newSize}%`;

            rowSegmentClassEle.style.maxWidth = strPercent;
            rowSegmentClassEle.style.flexBasis = strPercent;
          }
        }
      }
    }, 0);
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
    this.props.dialogOptions.handleEventDialogOpen(event);
  }

  createNewEvent(day) {
    this.props.dialogOptions.createEvent(day);
  }

  onDrillDown(date) {
    if (date !== this.state.currentViewDate) {
      this.setState({
        currentCalendarMonth: date.getMonth(),
        currentViewDate: date,
      });
    }
  }

  onNavigate(newDate) {
    if (newDate.getMonth() !== this.state.currentCalendarMonth) {
      setTimeout(() => {
        this.setState({
          currentCalendarMonth: newDate.getMonth(),
          currentViewDate: this.state.currentViewDate,
        });
      }, 0);
    }
  }

  render() {
    const events = this.props.fetchedData;
    console.log(events); // Leaving in for now cuz convenient sometimes

    if (this.props.user.role === USER_ROLES.NONE) {
      return null;
    }

    return (
      <main>
        <DayInformation
          date={this.state.currentViewDate}
          events={this.getEventsOnDate(this.state.currentViewDate, events)}
        />
        <BigCalendar
          localizer={localizer}
          defaultDate={new Date()}
          ref={this.setCalendarRef}
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
    ev.start = new Date(ev.start);
    ev.end = new Date(ev.end);
  }

  events.sort((a, b) => {
    return a.start < b.start;
  });

  return events;
};

export default withUser(withEventDialog(withFetch(Calendar, 'events?event_user=4edd40c86762e0fb12000003', {
  formatter: calendarEventFormatter,
  useMock: true,
  withAuth: true,
})));
