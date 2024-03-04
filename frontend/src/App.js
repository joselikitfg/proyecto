import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  BrowserRouter,
} from "react-router-dom";
import Item from "./pages/item";

function ItemList({ items, onDelete, onEdit }) {
  return (
    <div>
      <h1>Items:</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <strong>Nombre:</strong> {item.name} -{" "}
            <strong>Descripcion: </strong> {item.description}
            <button
              class="btn"
              onClick={() => {
                onDelete(item._id);
              }}
            >
              {" "}
              Eliminar
            </button>
            <Link className="btn" to={`/item/${item._id}`}>
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const API_ENDPOINT = "http://localhost:8082";
      const response = await axios.get(`${API_ENDPOINT}/items`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      const API_ENDPOINT = "http://localhost:8082";
      await axios.post(`${API_ENDPOINT}/items`, {
        name: newItemName,
        description: newItemDescription,
      });
      // Actualiza la lista de ítems después de agregar uno nuevo
      fetchItems();
      // Limpia los campos del formulario
      setNewItemName("");
      setNewItemDescription("");
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const handleDeleteItem = async (idObj) => {
    try {
      // Verifica si se recibió un objeto y si contiene la clave "$oid"
      if (!idObj || !idObj["$oid"]) {
        console.error("Error deleting item: Invalid ID");
        return;
      }
      const id = idObj["$oid"]; // Obtiene el ID como una cadenar

      const API_ENDPOINT = "http://localhost:8082";
      await axios.delete(`${API_ENDPOINT}/items/${id}`);
      // Actualiza la lista de ítems después de eliminar uno
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleEditItem = async (idObj) => {
    try {
      // Verifica si se recibió un objeto y si contiene la clave "$oid"
      if (!idObj || !idObj["$oid"]) {
        console.error("Error navigating to recipe: Invalid ID");
        return;
      }
      const id = idObj["$oid"]; // Obtiene el ID como una cadena

      // Aquí puedes construir la URL de la página de receta, por ejemplo:
      const recipePageUrl = `/recipe/${id}`;

      // Redirige a la página de la receta
      history.push(recipePageUrl);
    } catch (error) {
      console.error("Error navigating to recipe:", error);
    }
  };

  return (
    <div>
      <div>
        <ItemList
          items={items}
          onDelete={handleDeleteItem}
          onEdit={handleEditItem}
        />
      </div>
      <div>
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

          <Routes>
            <Route path="/item" element={<Item />} />
          </Routes>

      </div>
    </div>
  );
}

export default App;
