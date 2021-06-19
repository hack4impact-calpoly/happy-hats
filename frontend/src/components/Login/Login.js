import React from 'react';
import Amplify, { Auth } from 'aws-amplify';
import awsconfig from '../../aws-exports';
import { Redirect, useLocation } from "react-router-dom";
import './Login.css';
import { AmplifySignOut, AmplifyAuthenticator, AmplifySignIn, AmplifySignUp } from '@aws-amplify/ui-react';
import { onAuthUIStateChange, AuthState } from '@aws-amplify/ui-components';
import withUser from '../../store/user/WithUser';
import logo from "../../imgs/logo.png";
import { getAuthHeaderFromSession, getJsonResponse, RequestPayloadHelpers } from '../../utility/request-helpers';

Amplify.configure(awsconfig);

const Login = (props) => {
  const location = useLocation();
  const [authState, setAuthState] = React.useState();

  const signInUser = async (authData) => {
    if (!authData || props.user?.loggedIn ||
        authData?.username === props.user?.cognitoSession?.username ||
        authState === AuthState.SignedIn) {
      return;
    }

    console.log('signing in user');
    const response = await getJsonResponse(
      await RequestPayloadHelpers.makeRequest('login', 'POST', {}, getAuthHeaderFromSession(authData))
    );

    if (!response) {
      // alert('Could not successfully login for some reason. Try refreshing');
      console.log('Could not successfully login for some reason. Try refreshing or contacting someone');
      setAuthState(AuthState.SignIn);
      return;
    }

    const { user } = response;

    props.modifyUser({
      loggedIn: true,
      cognitoSession: authData,
      role: user?.role,
      approved: user?.approved,
      otherUserInfo: user,
    });
  };

  React.useEffect(() => {
    console.log('testing use effect');
    if (authState === undefined) {
      Auth.currentAuthenticatedUser().then(authData => {
        setAuthState(AuthState.SignedIn);
        signInUser(authData);
      }).catch(err => {
        setAuthState(AuthState.SignIn);
      });
    }

    return onAuthUIStateChange(async (nextAuthState, authData) => {
      setAuthState(nextAuthState);
      if (nextAuthState !== authState) {
        console.log('next auth stat', nextAuthState);
        console.log('change in auth ui state with data', authData);

        switch (nextAuthState) {
          case "signedin": // NOT signin!!
            signInUser(authData);
            break;
          default:
            break;
        }
      }
    });
  }, [authState]);

  if (AuthState.SignedIn === authState && props.user && props.user.loggedIn) {
    if (location.state?.referrer) {
      return <Redirect to={location.state.referrer} />;
    }

    return <Redirect to='/home' />;
  }

  return (
    <div className="loginContainer">
      <img src={logo} alt="logo" className="logo"/>
    
      <AmplifyAuthenticator usernameAlias="email" >
        <AmplifySignUp
          className="background-customizable"
          slot="sign-up"
          usernameAlias="email"
          headerText="Create Account"
          formFields={[
            {
              type: "email",
              label: "Email *",
              placeholder: "Enter Email",
              required: true,
            },
            {
              type: "password",
              label: "Password *",
              placeholder: "Enter Password",
              required: true,
            }
          ]} 
        />
        <AmplifySignIn 
          slot="sign-in"
          usernameAlias="email" 
          headerText=""
          formFields={[
            {
              type: "email",
              label: "Email *",
              placeholder: "Enter Email",
              required: true,
            },
            {
              type: "password",
              label: "Password *",
              placeholder: "Enter Password",
              required: true,
            }
          ]}
        />
      </AmplifyAuthenticator>
    </div>

  );
}

export default withUser(Login);