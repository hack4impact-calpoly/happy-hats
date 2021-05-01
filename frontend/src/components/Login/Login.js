import React from 'react';
import Amplify from 'aws-amplify';
import awsconfig from '../../aws-exports';
import { Redirect } from "react-router-dom";
import './Login.css';
import { AmplifySignOut, AmplifyAuthenticator, AmplifySignIn, AmplifySignUp} from '@aws-amplify/ui-react';
import { onAuthUIStateChange } from '@aws-amplify/ui-components';
import withUser from '../../store/user/WithUser';

Amplify.configure(awsconfig);

const Login = (props) => {
  const [authState, setAuthState] = React.useState();

  React.useEffect(() => {
      return onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          props.modifyUser({...authData, role: 'volunteer', loggedIn: true});
      });
  }, []);
  // if(props.user && props.user.loggedIn){
  //   return <Redirect to='/home' />;
  // }
  return (
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
      headerText="Sign In"
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
    </AmplifyAuthenticator>
  );
}

export default withUser(Login);
