import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from "@aws-amplify/ui-react";

import { useUser } from '../contexts/UserContext';
import { useCart } from '../contexts/CartContext';

function Navbar({ onSearch }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuthenticator();
  const [cognitoGroups, setCognitoGroups] = useState([]);
  const { state: userState, dispatch: userDispatch } = useUser();
  const { state: cartState, dispatch: cartDispatch } = useCart();
  

  const myCustomSignOutHandler = async () => {
    try {
      localStorage.clear(); // Clear all items in localStorage
      // userDispatch({ type: 'SIGN_OUT' });
      cartDispatch({ type: 'CLEAR_ALL_ITEMS' });
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  // useEffect(() => {
  //   const fetchUserGroups = async () => {
  //     try {
  //       setCognitoGroups(groups || []);
  //     } catch (error) {
  //       console.error('Error fetching user groups:', error);
  //     }
  //   };

  //   fetchUserGroups();
  // }, []);

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
          <div className="nav">
            <a className="nav-link active" aria-current="page" href="/">Sesión iniciada con {user.username}</a>
          </div>
          <form className="d-flex" onSubmit={handleSearch}>
            <input className="form-control me-2" type="search" placeholder="Buscar productos" aria-label="Search" name="search" onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="btn btn-outline-success" type="submit">Buscar</button>
          </form>
          <button onClick={myCustomSignOutHandler} className="btn btn-outline-success">Sign out</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
