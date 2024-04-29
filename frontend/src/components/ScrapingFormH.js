import React, { useState, useEffect } from "react";
import axios from "axios";

function ScrapingFormA() {
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState('');
  useEffect(() => {
    console.log("searchTerm ha cambiado:", searchTerm);

  }, [searchTerm]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const termsArray = searchTerm.split(',').map(term => term.trim()).filter(term => term.length > 0);

    try {
      const response = await axios.post("http://localhost:8093/scrape/hipercor", {
        terms: termsArray,
      });

      console.log(response.data);
      setConfirmationMessage(`Scraping finalizado para: ${searchTerm}`);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      setConfirmationMessage('Error al iniciar el scraping.');
    }

    setSearchTerm("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
      <h1 className="mb-3">Scraping</h1>
        <label htmlFor="searchTerm" className="form-label">
          Términos de Búsqueda para scrap Hipercor
        </label>
        <input
          type="text"
          className="form-control"
          id="searchTerm"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Iniciar Scraping
      </button>
      {confirmationMessage && <div className="alert alert-info mt-3">{confirmationMessage}</div>}
    </form>
  );
}

export default ScrapingFormA;
