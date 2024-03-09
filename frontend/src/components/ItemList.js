import React from "react";
import { Link } from "react-router-dom";

function ItemList({ items, deleteItem }) {
  return (
    <div>
      <h1>Lista de Ítems:</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id.$oid}>
            <strong>Nombre:</strong> {item.name} - <strong>Precio:</strong> {item.price}
            <Link to={`/item/${item._id.$oid}`}>Ver Detalles</Link>
            <button onClick={() => deleteItem(item._id.$oid)}>Borrar Ítem</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
