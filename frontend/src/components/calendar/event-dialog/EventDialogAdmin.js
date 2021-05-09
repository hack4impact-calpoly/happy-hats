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
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ThumpUpIcon from '@material-ui/icons/ThumbUp';
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
      onEdit={props.handleEdit}
      onDelete={props.handleDelete}
      onThumbUp={props.handleApprove}
      onThumbDown={props.handleReject}
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
            <IconButton style={{ padding: 5 }} aria-label="edit" onClick={props.handleEdit}>
              <EditIcon />
            </IconButton>
            <IconButton style={{ padding: 0 }} aria-label="delete" onClick={props.handleDelete}>
              <DeleteIcon />
            </IconButton>
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
              <h6>Pending ({event.volunteers?.length || 0})</h6>
              {event.volunteers?.map((volunteer, index) => {
                return <VolunteerInfo key={index} volunteer={volunteer} />;
                })}
                <br />
            </section>

            <section>
              <h6>Approved ({event.volunteers?.length || 0})</h6>
              {event.volunteers?.map((volunteer, index) => {
                return <VolunteerInfo key={index} volunteer={volunteer} />;
              })}
              <br />
            </section>

            <section>
              <h6>Rejected ({event.volunteers?.length || 0})</h6>
              {event.volunteers?.map((volunteer, index) => {
                return <VolunteerInfo key={index} volunteer={volunteer} />;
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
