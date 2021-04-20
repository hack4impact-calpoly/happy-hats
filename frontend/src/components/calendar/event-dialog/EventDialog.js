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
import { Button as BootstrapButton } from "react-bootstrap";
import CloseIcon from '@material-ui/icons/Close';
import { getAMPMTimeRange, getDayMonthDateStr,getMilitaryTimeFromDate } from '../../../utility/date-time';
import { storeContext } from '../../../store/Store';
import React, { useContext, useState } from 'react';
import CreateEvent, { CustomBasicFormControl } from './create-event/CreateEvent';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';

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

const SetCustomHoursSchema = Yup.object().shape({
  startTime: Yup.string()
    .required('Required')
    .test('start_time_after_end_time', 'Start time must be less than end time', function(value) { // Must NOT be arrow function
      const { endTime } = this.parent;

      if (!endTime) {
        return true;
      }
      return new Date(`01/01/2000 ${value}`).getTime() < new Date(`01/01/2000 ${endTime}`).getTime();
    }),
  endTime: Yup.string()
    .required('Required')
    .test('end_time_after_start_time', 'End time must be after the start time', function(value) { // Must NOT be arrow function
      const { startTime } = this.parent;

      if (!startTime) {
        return true;
      }
      return new Date(`01/01/2000 ${value}`).getTime() > new Date(`01/01/2000 ${startTime}`).getTime();
    }),
});

function CustomHours(props) {
  const [doingRequest, setDoingRequest] = useState(false);

  const makeCustomHourRequest = (fields) => {
    console.log(fields);
  };

  const requestBtnHit = () => {
    if (!doingRequest) {
      setDoingRequest(true);
    }
  };

  const renderForm = (formikProps) => (
    <FormikForm noValidate>
      <CustomBasicFormControl
        size="small"
        title="Start Time"
        required
        type="time"
        name="startTime"
        formikProps={formikProps}
      />
      <CustomBasicFormControl
        size="small"
        title="End Time"
        required
        type="time"
        name="endTime"
        formikProps={formikProps}
      />
      <BootstrapButton type="submit" style={{ margin: '5% 0' }} onClick={(e) => formikProps.handleSubmit(e)}>
        {doingRequest ? "Request" : "Request Custom Hours"}
      </BootstrapButton>
    </FormikForm>
  );

  return (
    <div>
      {doingRequest &&
        <Formik
          enableReinitialize={true}
          initialValues={{
            startTime: getMilitaryTimeFromDate(props.eventStart),
            endTime: getMilitaryTimeFromDate(props.eventEnd),
          }}
          validationSchema={SetCustomHoursSchema}
          onSubmit={values => makeCustomHourRequest(values)}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(props) => renderForm(props)}
        </Formik>
      }
      {!doingRequest && <BootstrapButton type="submit" style={{ margin: '5% 0' }} onClick={() => requestBtnHit()}>
        {doingRequest ? "Request" : "Request Custom Hours"}
      </BootstrapButton>}
    </div>
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

  let tooltipTitle = '';
  if (userSignedUp) {
    tooltipTitle = "You are already signed up!";
  } else if (event.volunteers?.length >= 20) {
    tooltipTitle = "Sorry, 20 volunteers already signed up!";
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
            <Tooltip title={tooltipTitle}>
              <span id="volunteer-sign-up"> {/* Hack to get tooltip to display when button is disabled */}
                <Button disabled={tooltipTitle.length > 0} onClick={signUpUser}>Sign Up</Button>
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
              {userSignedUp && <CustomHours eventStart={event.start} eventEnd={event.end} />}
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
