import { fetchAuthSession,getCurrentUser } from 'aws-amplify/auth';

export const getUserRoles = async (token) => {
  try {
    const session = await fetchAuthSession();
    console.log("access token", session.tokens.accessToken)
    
    const groups = session.tokens.accessToken.payload["cognito:groups"]
    console.log("cognito groups:", groups)
    return groups;
  } catch (error) {
    console.error('Invalid token');
    return null;
  }
};