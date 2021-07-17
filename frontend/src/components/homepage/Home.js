import "./Home.css";
import React from "react";
import { Link } from "react-router-dom";
import withUser from "../../store/user/WithUser";
import VolunteerInfoForm from "../InfoForm/VolunteerInfoForm";
import { isUserApproved, isUserFullySignedUp } from "../../store/user/User";

function Home(props) {
  const { role } = props.user;

  const renderCustomTopRowLinks = () => {
    if (!isUserFullySignedUp(props.user)) {
      return <VolunteerInfoForm />;
    }

    if (!isUserApproved(props.user)) {
      return (
        <div className="waitContainer">
          <h3>Please wait to be approved by an administrator!</h3>
        </div>
      );
    }

    switch (role) {
      case "admin":
        return (
          <React.Fragment>
            <Link to="/volunteers" className="link">
              <button className="buttonFormat volunteer">
                Manage Volunteers
              </button>
            </Link>

            <Link to="/announcements" className="link">
              <button className="buttonFormat announcement">
                Make an Announcement
              </button>
            </Link>
          </React.Fragment>
        );
      case "volunteer":
        return (
          <>
            <Link to="/calendar" className="link">
              <button className="buttonFormat calendar">
                View and Manage Shifts
              </button>
            </Link>

            <Link to="/announcements" className="link">
              <button className="buttonFormat announcement">
                View Announcements
              </button>
            </Link>
          </>
        );

      default:
        return (
          <p>Please wait to be approved by an admin</p>
        );
    }
  };

  const renderCustomBottomRowLinks = () => {
    if (!isUserFullySignedUp(props.user) || !isUserApproved(props.user)) {
      return null;
    }

    switch (role) {
      case "admin":
        return (
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Link to="/calendar" className="link">
              <button className="buttonFormat calendar">Manage Calendar</button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  };

  const renderWelcomeMessage = () => {
    if (props.user.otherUserInfo === undefined) {
      return <h1 className="welcomeMsg">Welcome to Happy Hats!</h1>;
    } else if (props.user.otherUserInfo.firstName === "") {
      return <h1 className="welcomeMsg">Welcome to Happy Hats!</h1>;
    } else {
      return (
        <h1 className="welcomeMsg">
          Welcome, {props.user.otherUserInfo.firstName}!
        </h1>
      );
    }
  };

  return (
    <div className="Home" style={{ paddingLeft: "8%", paddingTop: "90px" }}>
      {renderWelcomeMessage()}
      <div className="page-content-container">
        <div className="inner-page-content">
          <div className="top-row-links">{renderCustomTopRowLinks()}</div>
          {renderCustomBottomRowLinks()}
        </div>
      </div>
    </div>
  );
}

export default withUser(Home);
