import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';



function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const API_ENDPOINT = "http://localhost:8082";
        const response = await axios.get(`${API_ENDPOINT}/items`); 
        console.log(response);
        setItems(response.data);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    }

    fetchItems();
  }, []);

  return (
    <div>
      <h1>Items:</h1>
      <ul>
        {items.map(item => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
