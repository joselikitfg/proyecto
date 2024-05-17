import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { state } = useUser();
  const userGroups = state.user?.groups || [];

  const isAllowed = allowedRoles.some(role => userGroups.includes(role));

  if (!state.user) {
    return <div>Loading...</div>;
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
