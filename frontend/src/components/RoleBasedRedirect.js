import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const RoleBasedRedirect = () => {
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const { state } = useUser();

  useEffect(() => {
    if (state.loading === false && state.user && !hasRedirected) {
      const roles = state.user.groups;
      console.log(state);

      if (roles.includes('Admin')) {
        navigate('/admin');
      } else if (roles.includes('User')) {
        navigate('/user');
      } else {
        console.log("Vamos a la rai z")
        navigate('/');
      }

      setHasRedirected(true);
    }
  }, [state, hasRedirected, navigate]);
  return null;
};

export default RoleBasedRedirect;
