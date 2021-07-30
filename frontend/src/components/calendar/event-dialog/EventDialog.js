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
import { Button as BootstrapButton } from "react-bootstrap";
import { makeStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
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
import { Accordion, AccordionSummary } from "@material-ui/core";
import ExpandMore from '@material-ui/icons/ExpandMore'


const useStyles = makeStyles({
  paper: {
    width: "40%",
  },
});

function SignupStatus({ userSignedUp, currentUserInEvent }) {
  let signupStatus;

  if (userSignedUp && currentUserInEvent) {
    if (currentUserInEvent.approved && currentUserInEvent.decisionMade) {
      signupStatus = 'APPROVED';
    } else if (!currentUserInEvent.approved && currentUserInEvent.decisionMade) {
      signupStatus = 'REJECTED';
    } else {
      signupStatus = 'PENDING';
    }
  } else {
    signupStatus = 'Not signed up';
  }

  return (
    <p class="signup-status">Your sign up status: {signupStatus}</p>
  );
}

function CompletedHoursNotice({ completed, completedStatusSet }) {
  return (
    <p class="font-italic m-0">Hours marked as (in)completed: {completed ? 'YES' : (completedStatusSet ? 'NO' : 'UNSET')}</p>
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
    user,
    eventEditor,
    handleClose,
    eventFinished,
    signupAvailable,
    dailyEvents,
    updateEvent,
  } = props;

  const approveCompletedHours = async () => {
    let resp;

    try {
      resp = await RequestPayloadHelpers.makeRequest(
        `event/${event._id}/approve-scheduled-hours`,
        "POST",
        {},
        getAuthHeaderFromSession(user.cognitoSession),
        true
      );

      if (!resp || !resp.newEvent) {
        alert("error occurred. try again later");
        alert(resp.message);
        return;
      }
    } catch (err) {
      console.log(err);
      return;
    }

    eventTransformer(resp.newEvent);
    props.eventEditor(resp.newEvent);
    props.updateEvent(resp.newEvent);
  };

  const userSignUpJSX = userSignedUp && signupAvailable && (
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

      const currentUserInEvent = event?.volunteers?.find(v => v.volunteer?.id && v.volunteer?.id === user?.otherUserInfo?._id);

      let tooltipTitle;
      let tooltipError = true;
      if (event?.adminFinished) {
        tooltipTitle = "Event hours after already been approved and distributed!";
      } else {
        tooltipError = false;
        tooltipTitle =
          "This will look at all approved volunteers and set their scheduled hours for this event to completed.";
      }

      return (
        <React.Fragment>
          <h4>
            {getAMPMTimeRange(event.start, event.end)} on{" "}
            {getDayMonthDateStr(event.start)}
          </h4>

          <p>{event.description}</p>

          <div class="d-flex w-100 justify-content-center">
            {userSignUpJSX}
            {eventFinished &&
              <Tooltip title={tooltipTitle}>
                <span id="completed-hours-approval">
                  {" "}
                  {/* Hack to get tooltip to display when button is disabled */}
                  <BootstrapButton
                    disabled={tooltipError}
                    style={{
                      margin: "5% 0",
                      backgroundColor: "#004AAC",
                      color: "white",
                      textDecoration: "none !important",
                      borderRadius: "25px",
                      border: "none"
                    }}
                    onClick={() => approveCompletedHours()}
                  >
                    Distribute Completed Hours
                  </BootstrapButton>
                </span>
              </Tooltip>}
          </div>
          {userSignedUp && (
            <SignupStatus currentUserInEvent={currentUserInEvent} userSignedUp={userSignedUp} />
          )}
          {eventFinished && userSignedUp && currentUserInEvent && currentUserInEvent.approved && (
            <p class="signup-status">NOTE: Your scheduled hours for this event {currentUserInEvent.completed ? 'HAVE' : 'HAVE NOT'} been approved</p>
          )}
          <Accordion
            style={{ padding: "5px", backgroundColor: "#FFFCEF", color: "#004AAC" }}
            sx={{
              '&:before': {
                display: 'none',
              }}}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <h6>Pending ({pending?.length || 0})</h6>
            </AccordionSummary>

            {pending?.map((volunteer, index) => {
              return (
                <PendingVolunteerInfo
                  user={user}
                  volunteers={event.volunteers}
                  setVolunteers={setVolunteers}
                  key={index}
                  user={user}
                  event={event}
                  volunteer={volunteer}
                  event={event}
                />
              );
            })}
          </Accordion>
          <Accordion
            style={{ padding: "5px", backgroundColor: "#FFFCEF", color: "#004AAC" }}
            sx={{
              '&:before': {
                display: 'none',
              }}}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <h6>Approved ({approved?.length || 0})</h6>
            </AccordionSummary>
            {approved?.map((volunteer, index) => {
              return (
                <ApprovedVolunteerInfo
                  volunteers={event.volunteers}
                  setVolunteers={setVolunteers}
                  key={index}
                  volunteer={volunteer}
                  event={event}
                  eventFinished={eventFinished}
                  user={props.user}
                />
              );
            })}
            <br />
          </Accordion>
          <Accordion
            style={{ padding: "5px", backgroundColor: "#FFFCEF", color: "#004AAC" }}
            sx={{
              '&:before': {
                display: 'none',
              }}}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <h6>Rejected ({rejected?.length || 0})</h6>
            </AccordionSummary>
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
          </Accordion>
        </React.Fragment >
      );
    case USER_ROLES.VOLUNTEER:
      const currentUserInEventVolunteer = event?.volunteers?.find(v => v.volunteer?.id && v.volunteer?.id === user?.otherUserInfo?._id);

      return (
        <React.Fragment>
          <p>
            Default Time Slot: {getAMPMTimeRange(event.start, event.end)} on{" "}
            {getDayMonthDateStr(event.start)}
          </p>

          <p>{event.description}</p>

          <section>
            {userSignUpJSX}

            {userSignedUp && (
              <SignupStatus currentUserInEvent={currentUserInEventVolunteer} userSignedUp={userSignedUp} />
            )}

            {eventFinished && userSignedUp && currentUserInEventVolunteer && currentUserInEventVolunteer.approved && (
              <p class="signup-status">NOTE: Your scheduled hours for this event {currentUserInEventVolunteer.completed ? 'HAVE' : 'HAVE NOT'} been approved</p>
            )}
          <Accordion
            style={{ padding: "5px", backgroundColor: "#FFFCEF", color: "#004AAC" }}
            sx={{
              '&:before': {
                display: 'none',
              }}}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <h6>Volunteers ({event.volunteers?.length || 0})</h6>
            </AccordionSummary>
            {approved?.map((volunteer, index) => {
              return <VolunteerInfo key={index} volunteer={volunteer} />;
            })}
            </Accordion>
          </section>
        </React.Fragment>
      );
    default:
      return null;
  }
}

// ===================  Helper Functions  ======================= //
const isEventFinished = (event) => {
  return event?.end && (new Date()).getTime() > event.end.getTime();
};

const isSignupAvailable = (event) => {
  return event?.start && (new Date()).getTime() < event.start.getTime();
};
// ============================================================= //

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
  const [eventFinished, setEventFinished] = useState(isEventFinished(props.event));
  const [signupAvailable, setSignupAvailable] = useState(isSignupAvailable(props.event));

  useEffect(() => {
    setUserSignedUp(
      event?.volunteers?.some(
        (v) => v.volunteer?.id && v.volunteer?.id === user?.otherUserInfo?._id
      )
    );
  }, [props.event, props.user]);

  useEffect(() => {
    setEventFinished(isEventFinished(props.event));
    setSignupAvailable(isSignupAvailable(props.event));
  }, [props.event]);

  const onClose = () => {
    if (inEventEdit) {
      setInEventEdit(false);
    }
    props.handleClose();
  };

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
      props.updateEvent(resp.newEvent);
      setUserSignedUp(true);
    }
  };

  const editEvent = () => {
    setInEventEdit(true);
  };

  const deleteEvent = async () => {
    try {
      const resp = await RequestPayloadHelpers.makeRequest(
        `event/${event._id}`,
        "DELETE",
        {},
        getAuthHeaderFromSession(user.cognitoSession),
        false
      );

      if (!resp) {
        alert('Could not delete event. Please try again later');
        return;
      }

      props.eventEditor(event, true);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  const showActionBtns = () => {
    return !inEventEdit && !props.newEvent && isUserAdmin(props.user);
  };

  const showEditBtn = () => {
    return showActionBtns() && signupAvailable;
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
  } else if (!signupAvailable) {
    tooltipTitle = "The event is past the start date. You cannot sign up for this event anymore";
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
            className="signup-button"
            disabled={tooltipError}
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
            style={{ position: 'absolute', left: '5%' }}
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
        style={{ fontFamily: "Raleway", fontSize: "30px", color: "#004AAC" }}
        id="event-dialog-title"
      >
        {inEventEdit && <>EDIT:&nbsp;</>}
        {eventTitle}
      </DialogTitle>
      <DialogContent
        style={{ fontFamily: "Raleway", fontSize: "17px", color: "#004AAC" }}
      >
        {showActionBtns() &&
          <div style={{float: "right"}}>
            {(showEditBtn() && <IconButton
              style={{ padding: 0, marginRight: '10px'}}
              aria-label="edit event"
              onClick={editEvent}
            >
              <EditIcon style={{color: "#004AAC"}}/>
            </IconButton>)}
            <IconButton
              style={{ padding: 0 }}
              aria-label="delete event"
              onClick={deleteEvent}
            >
              <DeleteIcon style={{color: "#004AAC"}}/>
            </IconButton>
            </div>}
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
          eventFinished={eventFinished}
          signupAvailable={signupAvailable}
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
  console.log(props.event)
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
        <ThumbUpIcon style={{color: "#004AAC"}}/>
      </IconButton>
      <IconButton
        style={{ padding: 0 }}
        aria-label="reject"
        onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers, props.event, user)
        }
      >
        <ThumbDownIcon style={{color: "#004AAC"}}/>
      </IconButton>
    </li>
  );
}

function ApprovedVolunteerInfo(props) {
  const { volunteer, volunteers, setVolunteers, user, eventFinished, event } = props;

  const [completed, setCompleted] = useState(volunteer.completed);
  const [completedStatusSet, setCompletedStatusSet] = useState(!!volunteer.completedStatusSet);

  const updateCompletedHours = async (newCompleteStatus) => {
    try {
      const resp = await RequestPayloadHelpers.makeRequest(
        `event/${event._id}/volunteer/${volunteer.volunteer.id}/update-hours-completed`,
        'PUT',
        {
          newCompleteStatus,
        },
        getAuthHeaderFromSession(user.cognitoSession),
        false
      );

      if (!resp) {
        alert("Could not updated hours completed status! Refresh and try again.");
        return;
      }

      volunteer.completed = newCompleteStatus;
      setCompleted(!!newCompleteStatus);
      setCompletedStatusSet(true);
      let newVolunteers = [...volunteers];
      setVolunteers(newVolunteers);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <li>
      <EventVolunteerInfo volunteer={volunteer} />
      <IconButton
        style={{ padding: 5 }}
        aria-label="reject"
        onClick={() =>
          handleReject(volunteer, volunteers, setVolunteers, event, user)
        }
      >
        <ThumbDownIcon style={{color: "#004AAC"}}/>
      </IconButton>
      {eventFinished && (
        <div class="w-100">
          <CompletedHoursNotice completed={completed} completedStatusSet={completedStatusSet} />
          {completedStatusSet ? (
            <BootstrapButton
              // disabled={tooltipError}
              style={{
                margin: "0 10px",
                backgroundColor: "#004AAC",
                color: "white",
                textDecoration: "none !important",
                border: "none"
              }}
              onClick={() => updateCompletedHours(!completed)}
            >
              {volunteer.completed ? 'Set Incompleted' : 'Set Completed'}
            </BootstrapButton>
          ) : (
            <div>
              <BootstrapButton
                // disabled={tooltipError}
                style={{
                  margin: "0 10px",
                  backgroundColor: "#004AAC",
                  color: "white",
                  textDecoration: "none !important",
                  border: "none"
                }}
                onClick={() => updateCompletedHours(true)}
              >
                Set Completed
              </BootstrapButton>
              <BootstrapButton
                // disabled={tooltipError}
                style={{
                  margin: "0 10px",
                  backgroundColor: "#004AAC",
                  color: "white",
                  textDecoration: "none !important",
                  border: "none"
                }}
                onClick={() => updateCompletedHours(false)}
              >
                Set Incompleted
              </BootstrapButton>
            </div>
          )}
        </div>
      )}
      <br />
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
        <ThumbUpIcon style={{color: "#004AAC"}}/>
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
  console.log(user)
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
