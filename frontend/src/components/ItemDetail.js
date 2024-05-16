import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


function formatDate(timestamp) {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString("es-ES");
}

function formatPrice(price) {
  return price.replace(/(\d),(\d\d)\u00a0\u20ac.*/, '$1,$2 €');
}

function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
  
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const response = await axios.get(`https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items/${id}`);
          setItem(response.data);
        } catch (error) {
          console.error("Error fetching item details:", error);
        }
      };
      fetchItem();
    }, [id]);
  
    const handleBack = () => {
      navigate('/'); 
      window.location.reload(); 
    };
  
    const handleDelete = async () => {
      try {
        await axios.delete(`https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items/${id}`);
        navigate('/'); 
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    };
  
    if (!item) {
      return <div className="container mt-5">Error al cargar el producto...</div>;
    }
  
    return (
      <div className="container mt-5">
        <h2>Detalles del Ítem:</h2>
        <p><strong>Nombre:</strong> {item.pname}</p>
        <p><strong>Precio por unidad:</strong> {formatPrice(item.price_per_unit)}</p>
        <p><strong>Precio total:</strong> {item.total_price}</p>
        <p> <strong> Fecha de obtención: </strong> {formatDate(item.timestamp)}</p>
        {item.image_url && <img src={item.image_url} alt={`Imagen de ${item.pname}`} className="img-fluid" />}
        <div className="mt-3">
          <button onClick={handleBack} className="btn btn-secondary me-2">Volver a la página principal</button>
          <button onClick={handleDelete} className="btn btn-danger">Borrar Ítem</button>
        </div>
      </div>
    );
}
export default ItemDetail;
