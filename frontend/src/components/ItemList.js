import React from "react";
import { Link } from "react-router-dom";

function ItemList({ items, deleteItem }) {
  return (
    <div>
      <h1>Lista de Ítems:</h1>
      <ul>
        {items.map((item) => (
          <li key={item._id.$oid}> {/* Asegúrate de que la key también use el valor correcto */}
            <strong>Nombre:</strong> {item.name} - <strong>Descripción:</strong> {item.description}
            {/* Asegúrate de acceder a $oid para el ID */}
            <Link to={`/item/${item._id.$oid}`}>Ver Detalles</Link>
            <button onClick={() => deleteItem(item._id)}>Borrar Ítem</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ItemList;
