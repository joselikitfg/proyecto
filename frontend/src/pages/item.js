import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function ItemList() {
  const [items, setItems] = useState([]);

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

  return (
    <div>
      <h1>Items:</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id}>
            <strong>Nombre:</strong> {item.name} -{" "}
            <strong>Descripción:</strong> {item.description}
            <Link to={`/item/${item._id}`}>Ver detalle</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
