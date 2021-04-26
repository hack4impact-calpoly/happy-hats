import Amplify, { Auth } from 'aws-amplify';
import awsconfig from '../../aws-exports';
import React, { useState } from 'react';
import './Login.css';
import GoogleSignIn from './GoogleSignIn';
import { withAuthenticator, AmplifySignOut, AmplifyAuthenticator, AmplifySignIn, AmplifySignUp} from '@aws-amplify/ui-react';
import { AuthState, onAuthUIStateChange } from '@aws-amplify/ui-components';

Amplify.configure(awsconfig);

// function Login(props) {
//   const username = useFormInput('');
//   const password = useFormInput('');
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
 
//   // handle button click of login form
//   const handleLogin = () => {
//     props.history.push('/dashboard');
//   }
 
//   return (
//     // <div className="top">
//     //   <h1 className="container">Welcome!</h1>
//     //   <h3 className="container">Please continue to sign in.</h3>
//     //   <div className="container">
//     //     <GoogleSignIn />
//     //   </div>
//     // </div>
//     <div>

// <AmplifyAuthenticator>
//     <AmplifySignIn headerText="My Custom Sign In Header" slot="sign-in" />
//     <AmplifySignUp headerText="My Customer Sign Up Header" slot="sign-up" />

//     <div>
//       My App
//       <AmplifySignOut />
//     </div>
//   </AmplifyAuthenticator>
//   </div>
//   );
// }
 
// const useFormInput = initialValue => {
//   const [value, setValue] = useState(initialValue);
 
//   const handleChange = e => {
//     setValue(e.target.value);
//   }
//   return {
//     value,
//     onChange: handleChange
//   }
// }
 
// // export default Login;
// export default withAuthenticator(Login);
const AuthStateApp = () => {
  const [authState, setAuthState] = React.useState();
  const [user, setUser] = React.useState();

  React.useEffect(() => {
      return onAuthUIStateChange((nextAuthState, authData) => {
          setAuthState(nextAuthState);
          setUser(authData)
      });
  }, []);

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
      <AmplifySignOut>Hello</AmplifySignOut>
    </AmplifyAuthenticator>
  );
}

export default AuthStateApp;