import './EventDialog.css';

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Tooltip
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import { getAMPMTimeRange, getDayMonthDateStr } from '../../../utility/date-time';
import { storeContext } from '../../../store/Store';
import { useContext, useState } from 'react';
import React from 'react';
import CreateEvent from './create-event/CreateEvent';

const useStyles = makeStyles({
  paper: {
    width: '40%',
  },
});

function VolunteerInfo(props) {
  const { volunteer } = props;

  return (
    <li>
      {volunteer.name}: <span className="volunteer-time">{getAMPMTimeRange(volunteer.start, volunteer.end)}</span>
    </li>
  );
}

function EventDialog(props) {
  const { event } = props;
  const classes = useStyles();
  const [{ user }, ] = useContext(storeContext);

  const [userSignedUp, setUserSignedUp] = useState(
    event?.volunteers?.some(v => v.id && v.id === user?.userId) || false,
  );

  const signUpUser = () => {
    if (!userSignedUp) {
      // callSignUp();
      setUserSignedUp(true);
    }
  };

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
            <Tooltip title={userSignedUp ? "You are already signed up!" : ""}>
              <span id="volunteer-sign-up"> {/* Hack to get tooltip to display when button is disabled */}
                <Button disabled={userSignedUp} onClick={signUpUser}>Sign Up</Button>
              </span>
            </Tooltip>
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
              <h6>Volunteers ({event.volunteers?.length || 0})</h6>
              {event.volunteers?.map((volunteer, index) => {
                return <VolunteerInfo key={index} volunteer={volunteer} />;
              })}
            </section>
          </React.Fragment>)
        }
      </DialogContent>
    </Dialog>
  );
}

export default EventDialog;
