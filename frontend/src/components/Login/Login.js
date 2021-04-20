import React, { useState } from 'react';
import './Login.css';
import GoogleSignIn from './GoogleSignIn';
 
function Login(props) {
  const username = useFormInput('');
  const password = useFormInput('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
 
  // handle button click of login form
  const handleLogin = () => {
    props.history.push('/dashboard');
  }
 
  return (
    <div>
      <GoogleSignIn />
    </div>
  );
}
 
const useFormInput = initialValue => {
  const [value, setValue] = useState(initialValue);
 
  const handleChange = e => {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  }
}
 
export default Login;