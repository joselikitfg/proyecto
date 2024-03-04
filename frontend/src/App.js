import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await axios.get("http://localhost:8082/items");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8082/items", {
        name: newItemName,
        description: newItemDescription,
      });
      fetchItems();
      setNewItemName("");
      setNewItemDescription("");
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const deleteItem = async (idObj) => {
    try {
      if (!idObj || !idObj["$oid"]) {
        console.error("Error deleting item: Invalid ID");
        return;
      }
      const id = idObj["$oid"]; // Obtiene el ID como una cadenar
      await axios.delete(`http://localhost:8082/items/${id}`);
      fetchItems(); // Actualizar la lista de ítems después de borrar
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <div>
      <div>
        <h1>Agregar ítem</h1>
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
      <div>
        <Router>
          <Routes>
            <Route
              path="/"
              element={<ItemList items={items} setItems={setItems} deleteItem={deleteItem} />}
            />
            <Route path="/item/:id" element={<ItemDetail />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
