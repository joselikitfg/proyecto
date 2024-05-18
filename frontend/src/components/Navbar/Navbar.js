import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from "@aws-amplify/ui-react";
import styled from 'styled-components';

import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';

const AvatarContainer = styled.div`
  position: relative;
  cursor: pointer;
  margin-left: 20px;
`;

const AvatarImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 90px; /* Ajustado para el nuevo tamaño del avatar */
  right: 0;
  background-color: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px; /* Ancho aumentado */
  
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    right: 10px;
    border-width: 0 10px 10px 10px;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
`;

const UserName = styled.p`
  margin: 0;
  padding: 0;
  font-weight: bold;
`;

const AppVersion = styled.p`
  margin: 0;
  padding: 0;
  color: gray;
  font-size: 0.8em;
`;

const MenuItem = styled.a`
  margin-top: 10px;
  padding: 5px 10px;
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
  width: 100%;
  text-align: center;

  &:hover {
    background-color: #f0f0f0;
    border-radius: 5px;
  }
`;

const Avatar = ({ userName, appVersion, onSignOut, onUserDetails }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AvatarContainer onClick={() => setIsOpen(!isOpen)}>
      <AvatarImage src="https://avataaars.io/?avatarStyle=Circle&topType=Hat&accessoriesType=Kurt&facialHairType=BeardLight&facialHairColor=Black&clotheType=BlazerSweater&eyeType=Dizzy&eyebrowType=RaisedExcited&mouthType=Default&skinColor=Light" alt="avatar" />
      {isOpen && (
        <DropdownMenu>
          <UserName>{userName}</UserName>
          <AppVersion>{appVersion}</AppVersion>
          <MenuItem onClick={onUserDetails}>User Details</MenuItem>
          <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
        </DropdownMenu>
      )}
    </AvatarContainer>
  );
};

const SearchForm = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form className="d-flex" onSubmit={handleSearchSubmit}>
      <input
        className="form-control me-2"
        type="search"
        placeholder="Buscar productos"
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button className="btn btn-outline-success" type="submit">Buscar</button>
    </form>
  );
};

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthenticator();
  const { state: userState, dispatch: userDispatch } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  
  const appVersion = "v1.0.0";

  const myCustomSignOutHandler = async () => {
    try {
      userDispatch({ type: 'SIGN_OUT' });
      cartDispatch({ type: 'CLEAR_ALL_ITEMS' });
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const searchTerm = e.target.elements.search.value.trim();
    onSearch(searchTerm);
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };

  const handleUserDetails = () => {
    navigate('/user-details');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">SmartTrackApp</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">Inicio</a>
            </li>
          </ul>
          <SearchForm onSearch={handleSearch} />
          <Avatar userName={user.username} appVersion={appVersion} onSignOut={myCustomSignOutHandler} onUserDetails={handleUserDetails} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
