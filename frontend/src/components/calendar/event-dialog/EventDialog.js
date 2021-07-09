import "./EventDialog.css";

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Button,
  Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Button as BootstrapButton } from "react-bootstrap";
import CloseIcon from "@material-ui/icons/Close";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import {
  getAMPMTimeRange,
  getDayMonthDateStr,
  getMilitaryTimeFromDate,
} from "../../../utility/date-time";
import React, { useState } from "react";
import CreateEvent, {
  CustomBasicFormControl,
} from "./create-event/CreateEvent";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { USER_ROLES } from "../../../store/user/User";
import { getAuthHeaderFromSession, RequestPayloadHelpers } from "../../../utility/request-helpers";
import { eventTransformer } from "../event/Event";

const useStyles = makeStyles({
  paper: {
    width: "40%",
  },
});

function EventVolunteerInfo({ volunteer }) {
  return (
    <>
      {`${volunteer?.volunteer?.firstName} ${volunteer?.volunteer?.lastName}: `}
      <span className="volunteer-time">
        {getAMPMTimeRange(volunteer.start, volunteer.end)}
      </span>
    </>
  );
}

function PendingVolunteerInfo(props) {
  const { volunteer, volunteers, setVolunteers, user } = props;

  return (
    <li>
      <EventVolunteerInfo volunteer={volunteer} />
      <IconButton
        style={{ padding: 5 }}
        aria-label="approve"
        onClick={() => handleApprove(volunteer, volunteers, setVolunteers, props.event, user)}
      >
        <ThumbUpIcon />
      </IconButton>
      <IconButton
        style={{ padding: 0 }}
        aria-label="reject"
        onClick={() => handleReject(volunteer, volunteers, setVolunteers, props.event, user)}
      >
        <ThumbDownIcon />
      </IconButton>
    </li>
  );
}

function ApprovedVolunteerInfo(props) {
  const { volunteer, volunteers, setVolunteers, user } = props;

  return (
    <li>
      <EventVolunteerInfo volunteer={volunteer} />
      <IconButton
        style={{ padding: 5 }}
        aria-label="reject"
        onClick={() => handleReject(volunteer, volunteers, setVolunteers, props.event, user)}
      >
        <ThumbDownIcon />
      </IconButton>
    </li>
  );
}

function RejectedVolunteerInfo(props) {
  const { volunteer, volunteers, setVolunteers, user } = props;

  return (
    <li>
      <EventVolunteerInfo volunteer={volunteer} />
      <IconButton
        style={{ padding: 5 }}
        aria-label="approve"
        onClick={() => handleApprove(volunteer, volunteers, setVolunteers, props.event, user)}
      >
        <ThumbUpIcon />
      </IconButton>
    </li>
  );
}

const adminAction = async (volunteer, volunteers, setVolunteers, approved, event, user) => {
  const resp = await RequestPayloadHelpers.makeRequest('event/volunteer/approve', 'PUT', {
    eventId: event._id,
    volunteer: volunteer.volunteer.id,
    approved,
  }, getAuthHeaderFromSession(user.cognitoSession), true);

  if (!resp) {
    alert('Admin action done failed! Refresh and try again.');
    return;
  }

  volunteer.decisionMade = true;
  volunteer.approved = approved;
  let newVolunteers = [...volunteers];
  setVolunteers(newVolunteers);
};

const handleApprove = async (volunteer, volunteers, setVolunteers, event, user) => {
  adminAction(volunteer, volunteers, setVolunteers, true, event, user);
};

const handleReject = (volunteer, volunteers, setVolunteers, event, user) => {
  adminAction(volunteer, volunteers, setVolunteers, false, event, user);
};

function VolunteerInfo(props) {
  const { volunteer } = props;
  console.log(volunteer);

  return (
    <li>
      <EventVolunteerInfo volunteer={volunteer} />
    </li>
  );
}

const SetCustomHoursSchema = Yup.object().shape({
  startTime: Yup.string()
    .required("Required")
    .test(
      "start_time_after_end_time",
      "Start time must be less than end time",
      function (value) {
        // Must NOT be arrow function
        const { endTime } = this.parent;

        if (!endTime) {
          return true;
        }
        return (
          new Date(`01/01/2000 ${value}`).getTime() <
          new Date(`01/01/2000 ${endTime}`).getTime()
        );
      }
    ),
  endTime: Yup.string()
    .required("Required")
    .test(
      "end_time_after_start_time",
      "End time must be after the start time",
      function (value) {
        // Must NOT be arrow function
        const { startTime } = this.parent;

        if (!startTime) {
          return true;
        }
        return (
          new Date(`01/01/2000 ${value}`).getTime() >
          new Date(`01/01/2000 ${startTime}`).getTime()
        );
      }
    ),
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
      <BootstrapButton
        type="submit"
        style={{ margin: "5% 0" }}
        onClick={(e) => formikProps.handleSubmit(e)}
      >
        {doingRequest ? "Request" : "Request Custom Hours"}
      </BootstrapButton>
    </FormikForm>
  );

  return (
    <div>
      {doingRequest && (
        <Formik
          enableReinitialize={true}
          initialValues={{
            startTime: getMilitaryTimeFromDate(props.eventStart),
            endTime: getMilitaryTimeFromDate(props.eventEnd),
          }}
          validationSchema={SetCustomHoursSchema}
          onSubmit={(values) => makeCustomHourRequest(values)}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(props) => renderForm(props)}
        </Formik>
      )}
      {!doingRequest && (
        <BootstrapButton
          type="submit"
          style={{ margin: "5% 0" }}
          onClick={() => requestBtnHit()}
        >
          {doingRequest ? "Request" : "Request Custom Hours"}
        </BootstrapButton>
      )}
    </div>
  );
}

function EventDialogContent(props) {
  const {
    event,
    userSignedUp,
    pending,
    approved,
    rejected,
    setVolunteers,
  } = props;

  switch (props.user.role) {
    case USER_ROLES.ADMIN:
      // Only admins can make events
      if (props.newEvent) {
        return <CreateEvent date={event.start} />;
      }

      return (
        <React.Fragment>
          <p>
            Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on{" "}
            {getDayMonthDateStr(event.start)}
          </p>

          <p>{event.description}</p>

          <section>
            <h6>Pending ({pending?.length || 0})</h6>
            {pending?.map((volunteer, index) => {
              return (
                <PendingVolunteerInfo
                  volunteers={event.volunteers}
                  setVolunteers={setVolunteers}
                  key={index}
                  volunteer={volunteer}
                />
              );
            })}
            <br />
          </section>

          <section>
            <h6>Approved ({approved?.length || 0})</h6>
            {approved?.map((volunteer, index) => {
              return (
                <ApprovedVolunteerInfo
                  volunteers={event.volunteers}
                  setVolunteers={setVolunteers}
                  key={index}
                  volunteer={volunteer}
                  event={event}
                  user={props.user}
                />
              );
            })}
            <br />
          </section>

          <section>
            <h6>Rejected ({rejected?.length || 0})</h6>
            {rejected?.map((volunteer, index) => {
              return (
                <RejectedVolunteerInfo
                  volunteers={event.volunteers}
                  setVolunteers={setVolunteers}
                  key={index}
                  volunteer={volunteer}
                  event={event}
                  user={props.user}
                />
              );
            })}
            <br />
          </section>
        </React.Fragment>
      );
    case USER_ROLES.VOLUNTEER:
      <React.Fragment>
        <p>
          Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on{" "}
          {getDayMonthDateStr(event.start)}
        </p>

        <p>{event.description}</p>

        <section>
          <h6>Volunteers ({event.volunteers?.length || 0})</h6>
          {userSignedUp && (
            <CustomHours eventStart={event.start} eventEnd={event.end} />
          )}
          {event.volunteers?.map((volunteer, index) => {
            return <VolunteerInfo key={index} volunteer={volunteer} />;
          })}
        </section>
      </React.Fragment>;
    default:
      return null;
  }
}

function EventDialog(props) {
  const { event, user } = props;
  const classes = useStyles();

  const [volunteers, setVolunteers] = useState(event?.volunteers);

  const pending = event?.volunteers?.filter(function (volunteer) {
    return !volunteer.decisionMade;
  });

  const approved = event?.volunteers?.filter(function (volunteer) {
    return volunteer.decisionMade && volunteer.approved;
  });

  const rejected = event?.volunteers?.filter(function (volunteer) {
    return volunteer.decisionMade && !volunteer.approved;
  });

  const [userSignedUp, setUserSignedUp] = useState(
    event?.volunteers?.some((v) => v.volunteer?.id && (v.volunteer?.id === user?.otherUserInfo?._id)) || false
  );

  const signUpUser = async () => {

    if (!userSignedUp) {
      const resp = await RequestPayloadHelpers.makeRequest('event/self-volunteer', 'POST', {
        start: event.start,
        end: event.end,
        eventId: event._id,
      }, getAuthHeaderFromSession(user.cognitoSession), true);

      if (!resp || !resp.newEvent) {
        alert('error occurred. try again later');
        return;
      }

      eventTransformer(resp.newEvent);
      // let resp = { newEvent: { _id: event._id, title: 'hello', volunteers: [], start: new Date(), end: new Date() } };

      props.eventEditor(resp.newEvent);
      setUserSignedUp(true);
      props.updateEvent(resp.newEvent);
    }
  };

  if (!event) {
    return null;
  }

  let tooltipTitle = "";
  let tooltipError = true;
  if (userSignedUp) {
    tooltipTitle = "You are already signed up!";
  } else if (event.volunteers?.length >= 20) {
    tooltipTitle = "Sorry, 20 volunteers already signed up!";
  } else {
    tooltipError = false;
    tooltipTitle = "This will sign you up with default hours. You can change this later.";
  }

  const eventTitle = props.newEvent ? (
    <React.Fragment>
      New event for: {getDayMonthDateStr(event.start)}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {event.title}
      <Tooltip title={tooltipTitle}>
        <span id="volunteer-sign-up">
          {" "}
          {/* Hack to get tooltip to display when button is disabled */}
          <Button disabled={tooltipError} variant="outline-primary" onClick={signUpUser}>
            Sign Up
          </Button>
        </span>
      </Tooltip>
    </React.Fragment>
  );

  return (
    <Dialog
      classes={{
        paper: classes.paper,
      }}
      open={props.open}
      onClose={props.handleClose}
      aria-labelledby="event-dialog-title"
      aria-describedby="event-dialog-description"
      PaperProps={{
        style: {
          margin: "3%",
          borderStyle: "solid",
          borderRadius: "46px",
          borderColor: "#004AAC",
          backgroundColor: "#FFFCEF",
          padding: "30px",
          boxShadow: "-10px 10px 5px #F3D352",
        },
      }}
    >
      <DialogActions>
        <IconButton
          style={{ padding: 0 }}
          aria-label="close"
          onClick={props.handleClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogTitle disableTypography={true} style={{fontFamily: 'Raleway', fontSize:"25px", color: "#004AAC"}} id="event-dialog-title">{eventTitle}</DialogTitle>
      <DialogContent style={{fontFamily: 'Raleway', fontSize:"17px", color: "#004AAC"}}>
        <EventDialogContent
          event={event}
          user={user}
          userSignedUp={userSignedUp}
          rejected={rejected}
          approved={approved}
          pending={pending}
          newEvent={props.newEvent}
          volunteers={volunteers}
          setVolunteers={setVolunteers}
        />
      </DialogContent>
    </Dialog>
  );
}

export default EventDialog;
