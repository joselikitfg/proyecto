import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function ItemDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
  
    useEffect(() => {
      const fetchItem = async () => {
        try {
          const response = await axios.get(`http://localhost:8082/items/${id}`);
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
        await axios.delete(`http://localhost:8082/items/${id}`);
        navigate('/'); 
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    };
  
    if (!item) {
      return <div className="container mt-5">Cargando...</div>;
    }
  
    return (
      <div className="container mt-5">
        <h2>Detalles del Ítem:</h2>
        <p><strong>Nombre:</strong> {item.name}</p>
        <p><strong>Precio:</strong> {item.price}</p>
        {item.image_url && <img src={item.image_url} alt={`Imagen de ${item.name}`} className="img-fluid" />}
        <div className="mt-3">
          <button onClick={handleBack} className="btn btn-secondary me-2">Volver a la página principal</button>
          <button onClick={handleDelete} className="btn btn-danger">Borrar Ítem</button>
        </div>
      </div>
    );
  }
export default ItemDetail;
