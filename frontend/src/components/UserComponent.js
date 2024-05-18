import React from 'react';
import SearchBar from './SearchBar';

const UserComponent = () => {

  const handleSearch = (searchTerm) => {
    console.log('Buscar:', searchTerm);
    
  };

  return (
    <div>
      <h2>User Page</h2>
      <p>Accessible by Users and Admins</p>

      <SearchBar onSearch={handleSearch}/>
    </div>
  );
};

export default UserComponent;