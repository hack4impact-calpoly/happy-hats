import React from 'react';
import Amplify from 'aws-amplify';
import awsconfig from '../../aws-exports';
import { Redirect } from "react-router-dom";
import './Login.css';
import { AmplifySignOut, AmplifyAuthenticator, AmplifySignIn, AmplifySignUp} from '@aws-amplify/ui-react';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';
import withUser from '../../store/user/WithUser';
import logo from "../../imgs/logo.png";

Amplify.configure(awsconfig);

const Login = (props) => {
  const [authState, setAuthState] = React.useState();

  React.useEffect(() => {
      return onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          console.log(authData)
          props.modifyUser({...authData, role: 'volunteer', loggedIn: true});
      });
  }, []);
  console.log(props.user);
  if(props.user && props.user.loggedIn){
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
        ]} />
        <AmplifySignOut/>
      </AmplifyAuthenticator>
    </div>

  );
}

export default withUser(Login);