import { Auth } from 'aws-amplify';

function signIn(username, password) {
    Auth.signIn(username, password)
        .then(user => console.log('signed in:', user))
        .catch(err => console.error('error signing in:', err));
}
