import React from 'react';
import { Auth } from 'aws-amplify';
import Amplify from 'aws-amplify';
import amplifyConfig from './amplify-config';

Amplify.configure(amplifyConfig);

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
