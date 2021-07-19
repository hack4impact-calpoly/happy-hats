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
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import {
  getAMPMTimeRange,
  getDayMonthDateStr,
} from "../../../utility/date-time";
import React, { useEffect, useState } from "react";
import CreateEvent from "./create-event/CreateEvent";
import { isUserAdmin, USER_ROLES } from "../../../store/user/User";
import {
  getAuthHeaderFromSession,
  RequestPayloadHelpers,
} from "../../../utility/request-helpers";
import { eventTransformer } from "../event/Event";
import CustomHours from "./custom-hours/CustomHours";
import EditEvent from "./edit-event/EditEvent";

const useStyles = makeStyles({
  paper: {
    width: "40%",
  },
});

function EventDialogContent(props) {
  const {
    event,
    userSignedUp,
    pending,
    approved,
    rejected,
    setVolunteers,
    user,
    eventEditor,
    handleClose,
    dailyEvents,
    updateEvent,
  } = props;

  const userSignUpJSX = userSignedUp && (
    <CustomHours
      eventId={event._id}
      user={user}
      eventEditor={eventEditor}
      updateEvent={updateEvent}
      eventStart={event.start}
      eventEnd={event.end}
    />
  );

  switch (user.role) {
    case USER_ROLES.ADMIN:
      // Only admins can make events
      if (props.newEvent) {
        return (
          <CreateEvent
            eventEditor={eventEditor}
            user={user}
            date={event.start}
            handleClose={handleClose}
            dailyEvents={dailyEvents}
          />
        );
      } else if (props.editEvent) {
        return (
          <EditEvent
            eventEditor={eventEditor}
            updateEvent={updateEvent}
            event={event}
            user={user}
            onEditMade={() => props.setInEventEdit(false)}
            date={event.start}
          />
        );
      }

      return (
        <React.Fragment>
          <p>
            Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on{" "}
            {getDayMonthDateStr(event.start)}
          </p>

          <p>{event.description}</p>

          <section>
            {userSignUpJSX}

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
      return (
        <React.Fragment>
          <p>
            Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on{" "}
            {getDayMonthDateStr(event.start)}
          </p>

          <p>{event.description}</p>

          <section>
            {userSignUpJSX}

            <h6>Volunteers ({event.volunteers?.length || 0})</h6>
            {approved?.map((volunteer, index) => {
              return <VolunteerInfo key={index} volunteer={volunteer} />;
            })}
          </section>
        </React.Fragment>
      );
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

  const [userSignedUp, setUserSignedUp] = useState(false);
  const [inEventEdit, setInEventEdit] = useState(false);

  const onClose = () => {
    if (inEventEdit) {
      setInEventEdit(false);
    }
    props.handleClose();
  };

  useEffect(() => {
    setUserSignedUp(
      event?.volunteers?.some(
        (v) => v.volunteer?.id && v.volunteer?.id === user?.otherUserInfo?._id
      )
    );
  }, [props.event, props.user]);

  const signUpUser = async () => {
    if (!userSignedUp) {
      const resp = await RequestPayloadHelpers.makeRequest(
        `event/${event._id}/self-volunteer`,
        "POST",
        {
          start: event.start,
          end: event.end,
        },
        getAuthHeaderFromSession(user.cognitoSession),
        true
      );

      if (!resp || !resp.newEvent) {
        alert("error occurred. try again later");
        return;
      }

      eventTransformer(resp.newEvent);

      props.eventEditor(resp.newEvent);
      setUserSignedUp(true);
      props.updateEvent(resp.newEvent);
    }
  };

  const editEvent = () => {
    setInEventEdit(true);
  };

  const showEditBtn = () => {
    return !inEventEdit && !props.newEvent && isUserAdmin(props.user);
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
    tooltipTitle =
      "This will sign you up with default hours. You can change this later.";
  }

  const eventTitle = props.newEvent ? (
    <React.Fragment>
      New event for: {getDayMonthDateStr(event.start)}
    </React.Fragment>
  ) : (
    <React.Fragment>
      {event.title}
      {!inEventEdit && <Tooltip title={tooltipTitle}>
        <span id="volunteer-sign-up">
          {" "}
          {/* Hack to get tooltip to display when button is disabled */}
          <Button
            disabled={tooltipError}
            variant="outline-primary"
            onClick={signUpUser}
          >
            Sign Up
          </Button>
        </span>
      </Tooltip>}
    </React.Fragment>
  );

  return (
    <Dialog
      classes={{
        paper: classes.paper,
      }}
      open={props.open}
      onClose={onClose}
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
        {inEventEdit &&
          <IconButton
            style={{position: 'absolute', left: '5%' }}
            aria-label="go back"
            onClick={() => setInEventEdit(false)}
          >
            <ArrowBackIcon />
          </IconButton>
        }
        <IconButton
          style={{ padding: 0 }}
          aria-label="close"
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </DialogActions>
      <DialogTitle
        disableTypography={true}
        style={{ fontFamily: "Raleway", fontSize: "25px", color: "#004AAC" }}
        id="event-dialog-title"
      >
        {showEditBtn() &&
          <>
            <IconButton
              style={{ position: 'absolute', 'left': '10px', marginTop: '-2px' }}
              aria-label="edit event"
              onClick={editEvent}
            >
              <EditIcon />
            </IconButton>
          </>}
        {inEventEdit && <>EDIT:&nbsp;</>}
        {eventTitle}
      </DialogTitle>
      <DialogContent
        style={{ fontFamily: "Raleway", fontSize: "17px", color: "#004AAC" }}
      >
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
          editEvent={inEventEdit}
          handleClose={onClose}
          setInEventEdit={setInEventEdit}
          {...props}
        />
      </DialogContent>
    </Dialog>
  );
}

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
        onClick={() =>
          handleApprove(volunteer, volunteers, setVolunteers, props.event, user)
        }
      >
        <ThumbUpIcon />
      </IconButton>
      <IconButton
        style={{ padding: 0 }}
        aria-label="reject"
        onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers, props.event, user)
        }
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
        onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers, props.event, user)
        }
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
        onClick={() =>
          handleApprove(volunteer, volunteers, setVolunteers, props.event, user)
        }
      >
        <ThumbUpIcon />
      </IconButton>
    </li>
  );
}

const adminAction = async (
  volunteer,
  volunteers,
  setVolunteers,
  approved,
  event,
  user
) => {
  const resp = await RequestPayloadHelpers.makeRequest(
    `event/${event._id}/volunteer/approve`,
    "PUT",
    {
      volunteer: volunteer.volunteer.id,
      approved,
    },
    getAuthHeaderFromSession(user.cognitoSession),
    true
  );

  if (!resp) {
    alert("Admin action done failed! Refresh and try again.");
    return;
  }

  volunteer.decisionMade = true;
  volunteer.approved = approved;
  let newVolunteers = [...volunteers];
  setVolunteers(newVolunteers);
};

const handleApprove = async (
  volunteer,
  volunteers,
  setVolunteers,
  event,
  user
) => {
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

export default EventDialog;
