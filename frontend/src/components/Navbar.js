import React from 'react';
import './Navbar.css';
import { Navbar, Nav } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import logo from "../imgs/logo.png";
import {AmplifySignOut} from '@aws-amplify/ui-react';
import awsconfig from '../aws-exports';
import Amplify, { Auth, AmplifyAuthenticator } from 'aws-amplify';
import Login from "./Login/Login";
import withUser from '../store/user/WithUser';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';
import Button from 'react-bootstrap/Button'

Amplify.configure(awsconfig);

async function signOut() {
  try {
      await Auth.signOut();
  } catch (error) {
      console.log('error signing out: ', error);
  }
}

const NavBar = (props) =>{

  const [loggedIn, updateLoggedIn] = React.useState(true);

  const handleSignOut = () => {
    console.log(props.user)

    // if(props.user && props.user.loggedIn){

    //   console.log(props.user.loggedIn);
    //   props.user.loggedIn = false;
    //   console.log(props.user.loggedIn);
    //   signOut();
    //   updateLoggedIn(false);
    //   //return <Redirect to='/calendar' />;
    // }
    // props.modifyUser({userId: -1, role: 'volunteer', displayName: null, loggedIn: false});
  }
  return (
    // loggedIn ? <Redirect to='/login' /> :
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
          <Button onClick={() => handleSignOut()}>
            Signout
          </Button>
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
