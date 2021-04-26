import './Home.css';
import React from 'react'
import  { Link, Redirect } from 'react-router-dom'
import withUser from "../../store/user/WithUser";

function Home(props) {
  const { role } = props.user;

  const isLoggedIn = () => {
    return !!role;
  }

  const renderCustomTopRowLinks = () => {
    if (!isLoggedIn()) {
      return null;
    }

    switch (role) {
      case "admin":
        return (
          <React.Fragment>
            <Link to="/volunteers" className='link' >
                <button className="buttonFormat volunteer">Manage Volunteers</button>
            </Link>

            <Link to="/announcements" className='link' >
                <button className="buttonFormat announcement">Make an Announcement</button>
            </Link>
          </React.Fragment>
        );
      case "hospital":
        return (
          <>
            <Link to="/orders" className='link' >
                <button className="buttonFormat order">Manage Cape Orders</button>
            </Link>

            <Link to="/announcements" className='link' >
                <button className="buttonFormat announcement">View Announcements</button>
            </Link>
          </>
        );
      case "volunteer":
        return (
          <>
            <Link to="/calendar" className='link' >
                <button className="buttonFormat calendar">Manage Shifts</button>
            </Link>

            <Link to="/announcements" className='link' >
                <button className="buttonFormat announcement">View Announcements</button>
            </Link>
          </>
        );
      default:
        return null;
    }
  }

  const renderCustomBottomRowLinks = () => {
    if (!isLoggedIn()) {
      return null;
    }

    switch (role) {
      case "admin":
        return (
          <div style={{display: 'flex', justifyContent: 'space-around'}}>
            <Link to="/calendar" className='link' >
                <button className="buttonFormat calendar">Manage Calendar</button>
            </Link>
          </div>
        );
      default:
        return null;
    }
  }

  console.log(role);

  return (
    !role ?
      (<Redirect to='/login' />) :
      (
        <div className="Home" style={{paddingLeft: '8%', paddingTop: '90px'}}>
          <h1 className='welcomeMsg'>Welcome, {props.user.displayName}</h1>
          <div className="page-content-container">
            <div className="inner-page-content">
              <div className="top-row-links">
                {renderCustomTopRowLinks()}
              </div>
              {renderCustomBottomRowLinks()}
            </div>
          </div>
        </div>
      )
  );
}

export default withUser(Home);
