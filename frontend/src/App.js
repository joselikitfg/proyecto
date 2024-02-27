import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function ItemList({ items, onDelete }) {
  return (
    <div>
      <h1>Items:</h1>
      <ul>
        {items.map(item => (
          <li key={item._id}>
            <strong>Nombre:</strong> {item.name} - <strong>Descripcion:</strong> {item.description}
            <button onClick={() => {
              onDelete(item._id);
            }}>Eliminar</button> 
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const API_ENDPOINT = "http://localhost:8082";
      const response = await axios.get(`${API_ENDPOINT}/items`); 
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const API_ENDPOINT = "http://localhost:8082";
      await axios.post(`${API_ENDPOINT}/items`, {
        name: newItemName,
        description: newItemDescription
      });
      // Actualiza la lista de ítems después de agregar uno nuevo
      fetchItems();
      // Limpia los campos del formulario
      setNewItemName('');
      setNewItemDescription('');
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleDeleteItem = async (idObj) => {
    try {
      // Verifica si se recibió un objeto y si contiene la clave "$oid"
      if (!idObj || !idObj["$oid"]) {
        console.error('Error deleting item: Invalid ID');
        return;
      }
      const id = idObj["$oid"]; // Obtiene el ID como una cadenar
  
      const API_ENDPOINT = "http://localhost:8082";
      await axios.delete(`${API_ENDPOINT}/items/${id}`);
      // Actualiza la lista de ítems después de eliminar uno
      fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div>
      <ItemList items={items} onDelete={handleDeleteItem} /> {/* Pasa la función handleDeleteItem como prop onDelete al componente ItemList */}
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Nombre del ítem"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción del ítem"
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
        />
        <button type="submit">Agregar ítem</button>
      </form>
    </div>
  );
}

export default App;
