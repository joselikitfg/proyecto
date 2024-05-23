import React from 'react';

import { useUser } from '../../contexts/UserContext';

const HomeComponent = () => {

  const { state: userState } = useUser();
  const userGroups = userState.user?.groups || [];

  return (
    <div>
      {JSON.stringify(userState)}
      <h2>Guest Component</h2>
      <p>Accessible by all authenticated users. Guest mode</p>
    </div>
  );
};

export default HomeComponent;