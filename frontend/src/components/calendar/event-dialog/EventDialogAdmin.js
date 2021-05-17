import './EventDialog.css';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import { getAMPMTimeRange, getDayMonthDateStr,getMilitaryTimeFromDate } from '../../../utility/date-time';
import { storeContext } from '../../../store/Store';
import React, { useContext, useState } from 'react';
import CreateEvent, { CustomBasicFormControl } from './create-event/CreateEvent';

const useStyles = makeStyles({
  paper: {
    width: '40%',
  },
});

function PendingVolunteerInfo(props) {
  const { volunteer } = props;
  const { volunteers } = props;
  const { setVolunteers } = props;

  return (
    <li>
      {volunteer.name}: <span className="volunteer-time">{getAMPMTimeRange(volunteer.start, volunteer.end)}</span>
      <IconButton style={{ padding: 5 }} aria-label="approve" onClick={() =>
          handleApprove(volunteer, volunteers, setVolunteers)}>
        <ThumbUpIcon />
      </IconButton>
      <IconButton style={{ padding: 0 }} aria-label="reject" onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers)}>
        <ThumbDownIcon />
      </IconButton>
    </li>
  );
}

function ApprovedVolunteerInfo(props) {
    const { volunteer } = props;
    const { volunteers } = props;
    const { setVolunteers } = props;

  return (
    <li>
      {volunteer.name}: <span className="volunteer-time">{getAMPMTimeRange(volunteer.start, volunteer.end)}</span>
      <IconButton style={{ padding: 5 }} aria-label="reject" onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers)}>
        <ThumbDownIcon />
      </IconButton>
    </li>
  );
}

function RejectedVolunteerInfo(props) {
    const { volunteer } = props;
    const { volunteers } = props;
    const { setVolunteers } = props;

  return (
    <li>
      {volunteer.name}: <span className="volunteer-time">{getAMPMTimeRange(volunteer.start, volunteer.end)}</span>
      <IconButton style={{ padding: 5 }} aria-label="approve" onClick={() =>
          handleApprove(volunteer, volunteers, setVolunteers)}>
        <ThumbUpIcon />
      </IconButton>
    </li>
  );
}


const handleApprove = (volunteer, volunteers, setVolunteers) => {
    volunteer.decisionMade = true;
    volunteer.approved = true;
    let newVolunteers = [...volunteers];
    setVolunteers(newVolunteers);
};

const handleReject = (volunteer, volunteers, setVolunteers) => {
    volunteer.decisionMade = true;
    volunteer.approved = false;
    let newVolunteers = [...volunteers];
    setVolunteers(newVolunteers);
};

function EventDialog(props) {
  const { event } = props;
  const classes = useStyles

  const [volunteers, setVolunteers] = useState(event?.volunteers);

  const pending = event?.volunteers?.filter(function(volunteer) {
      return !volunteer.decisionMade;
  });

  const approved = event?.volunteers?.filter(function(volunteer) {
      return volunteer.decisionMade && volunteer.approved;
  });

  const rejected = event?.volunteers?.filter(function(volunteer) {
      return volunteer.decisionMade && !volunteer.approved;
  });

  if (!event) {
    return null;
  }


  return (
    <Dialog
      classes={{
        paper: classes.paper,
      }}
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="event-dialog-title"
      aria-describedby="event-dialog-description"
    >
      <DialogActions>
        <IconButton style={{ padding: 0 }} aria-label="close" onClick={props.handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogTitle id="event-dialog-title">
        {props.newEvent ?
          (<React.Fragment>
            New event for: {getDayMonthDateStr(event.start)}
          </React.Fragment>) :
          (<React.Fragment>
            {event.title}
          </React.Fragment>)
        }
      </DialogTitle>
      <DialogContent>
        {props.newEvent ?
          (<React.Fragment>
            <CreateEvent date={event.start} />
          </React.Fragment>) :
          (<React.Fragment>
            <p>Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on {getDayMonthDateStr(event.start)}</p>

            <p>{event.description}</p>

            <section>
              <h6>Pending ({pending?.length || 0})</h6>
              {pending?.map((volunteer, index) => {
                return <PendingVolunteerInfo volunteers={event.volunteers}
                    setVolunteers={setVolunteers} key={index} volunteer={volunteer}/>;
                })}
                <br />
            </section>

            <section>
              <h6>Approved ({approved?.length || 0})</h6>
              {approved?.map((volunteer, index) => {
                return <ApprovedVolunteerInfo volunteers={event.volunteers}
                    setVolunteers={setVolunteers} key={index} volunteer={volunteer}/>;
              })}
              <br />
            </section>

            <section>
              <h6>Rejected ({rejected?.length || 0})</h6>
              {rejected?.map((volunteer, index) => {
                return <RejectedVolunteerInfo volunteers={event.volunteers}
                    setVolunteers={setVolunteers} key={index} volunteer={volunteer}/>;
              })}
              <br />
            </section>
          </React.Fragment>)
        }
      </DialogContent>
    </Dialog>
  );
}

export default EventDialog;
