import React from "react";
import { Link } from "react-router-dom";

function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString("es-ES");
}

function formatPrice(price) {
  return price.replace(/(\d),(\d\d)\u00a0\u20ac.*/, "$1,$2 €");
}

function ItemList({ items = [], deleteItem }) {
  console.log("Rendering items", items);
  console.log("ItemList --------------------------------");

  return (
    <div className="row row-cols-1 row-cols-md-4 g-4">
      {items.map((item, index) => (
        <div
          key={item._id ? item._id.$oid : index}
          className="col d-flex align-items-stretch custom-card-size"
        >
          <div className="card h-100 d-flex flex-column">
            <img
              src={item.image_url}
              className="card-img-top"
              alt={`Imagen de ${item.pname}`}
            />
            <div className="card-body">
              <h5 className="card-title">{item.pname}</h5>
              <p className="card-text">
                <strong>Precio por unidad:</strong>{" "}
                {formatPrice(item.price_per_unit)})
              </p>
              <p className="card-text">
                <strong>Precio total:</strong> {item.total_price}
              </p>
              <p className="card-text">
                <strong>Fecha de obtención:</strong>{" "}
                {formatDate(item.timestamp)}
              </p>
            </div>
            <div className="mt-auto p-2">
              <Link
                to={`/item/${(item.pid)}`}
                className="btn btn-primary"
              >
                Ver Detalles
              </Link>
              <button
                onClick={() => deleteItem((item.pid))}
                className="btn btn-danger ms-2"
              >
                Borrar Ítem
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ItemList;
