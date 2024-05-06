// Amplify configuration file (aws-exports.js)
import Amplify from 'aws-amplify';


Amplify.configure(config);

// Login component
import React from 'react';
import { Auth } from 'aws-amplify';

function Login() {
  const signIn = () => {
    Auth.federatedSignIn(); // Esto lanzará la Hosted UI de Cognito
  }

  return (
    <div>
      <button onClick={signIn}>Sign In</button>
    </div>
  );
}

export default Login;
