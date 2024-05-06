
import Amplify from 'aws-amplify';
import config from '../aws-exports';
import React from 'react';
import Auth from '@aws-amplify/auth';

Amplify.configure(config);



function Login() {
  const signIn = () => {
    Auth.federatedSignIn(); 
  }

  return (
    <div>
      <button onClick={signIn}>Sign In</button>
    </div>
  );
}

export default Login;
