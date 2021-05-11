import React from 'react';
import './Navbar.css';
import { Navbar, Nav } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import logo from "../imgs/logo.png";
import awsconfig from '../aws-exports';
import Amplify, { Auth } from 'aws-amplify';
import withUser from '../store/user/WithUser';
Amplify.configure(awsconfig);

async function signOut() {
  try {
      await Auth.signOut();
  } catch (error) {
      console.log('error signing out: ', error);
  }
}

const NavBar = (props) =>{
  const handleSignOut = () => {
    if(props.user && props.user.loggedIn){
      props.modifyUser({userId: -1, role: 'volunteer', displayName: null, loggedIn: false});
      signOut();
      return <Redirect to='/login' />;
    }
    
  }
  return (
    <Navbar expand="md">
      <Navbar.Brand>
        <Link to="/home"><img
          src={logo}
          width="320"
          height="80"
          className="d-inline-block align-top"
          alt="Happy Logo"
        /></Link>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ml-auto">
          <Link className="link-text" onClick={() => handleSignOut()}>
            Signout
          </Link>
          <Link className="link-text" to ="/announcements">
            Announcements
          </Link>
          <Link className="link-text" to="/volunteer">
            Volunteers
          </Link>
          <Link className="link-text" to="/calendar">
            Calendar
          </Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default withUser(NavBar);
