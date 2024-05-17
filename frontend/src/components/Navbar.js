import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";

function Navbar({ onSearch }) {

  const [searchTerm, setSearchTerm] = useState("");
  const { user, signOut } = useAuthenticator();

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(searchTerm);
  };
  
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          SmartTrackApp
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/">
                Inicio
              </a>
            </li>
          </ul>
          <div className="nav">
            <a className="nav-link active" aria-current="page" href="/">
              {" "}
              Sesión iniciada con {user.username}{" "}
            </a>
          </div>

          <form className="d-flex" onSubmit={handleSearch}>
            <input
              className="form-control mr-sm-2"
              type="search"
              placeholder="Búsqueda"
              aria-label="Búsqueda"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-success" type="submit">
              Buscar
            </button>
          </form>
          <button onClick={signOut} className="btn btn-outline-success">
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
