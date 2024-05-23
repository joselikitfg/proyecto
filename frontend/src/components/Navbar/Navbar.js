import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from "@aws-amplify/ui-react";
import styled from 'styled-components';

import { useUser } from '../../contexts/UserContext';
import { useCart } from '../../contexts/CartContext';
import Avatar from './Avatar';



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
          <Avatar userName={user.username} appVersion={appVersion} onSignOut={myCustomSignOutHandler} onUserDetails={handleUserDetails} />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
