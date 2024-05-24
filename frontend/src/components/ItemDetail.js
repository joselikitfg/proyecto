import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./ItemDetail.css";

function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString("es-ES");
}

function formatPrice(price) {
  return price.replace(/(\d),(\d\d)\u00a0\u20ac.*/, '$1,$2 €)');
}

function ItemDetail() {
  const { pname } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        console.log("Fetching item with pname:", pname); 
        const response = await axios.get(`https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/item/name/${pname}`);
        if (response.status === 200) {
          setItem(response.data);
        } else {
          throw new Error(`Item not found: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching item details:", error);
      }
    };
    fetchItem();
  }, [pname]);

  const handleBack = () => {
    navigate('/');
    window.location.reload();
  };

  const handleDelete = async () => {
    try {
      const encodedPname = encodeURIComponent(pname);
      await axios.delete(`https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items/${encodedPname}`);
      navigate('/');
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (!item) {
    return <div className="container mt-5">Cargando...</div>;
  }

  return (
    <div className="container mt-5 d-flex justify-content-center">
      <div className="card p-4" style={{ maxWidth: '600px' }}>
        <h2 className="text-center mb-4">Detalles del Ítem</h2>
        <p><strong>Nombre:</strong> {item.pname}</p>
        <p><strong>Precio por unidad:</strong> {formatPrice(item.price_per_unit)}</p>
        <p><strong>Precio total:</strong> {item.total_price}</p>
        <p><strong>Fecha de obtención:</strong> {formatDate(item.timestamp)}</p>
        {item.image_url && <img src={item.image_url} alt={`Imagen de ${item.pname}`} className="img-fluid mb-3 item-image" />}
        <div className="d-flex justify-content-between">
          <button onClick={handleBack} className="btn btn-secondary">Volver</button>
          <button onClick={handleDelete} className="btn btn-danger">Borrar Ítem</button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;