import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await axios.get('http://localhost:5000/items'); 
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
