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
      return <div>Cargando...</div>;
    }
  
    return (
      <div>
        <h2>Detalles del Ítem:</h2>
        <p><strong>Nombre:</strong> {item.name}</p>
        <p><strong>Precio:</strong> {item.price}</p>
        {item.image_url && <img src={item.image_url} alt={`Imagen de ${item.name}`} style={{ maxWidth: "100%" }} />}
        <button onClick={handleBack}>Volver a la página principal</button>
        <button onClick={handleDelete}>Borrar Ítem</button>
      </div>
    );
  }
export default ItemDetail;
{/* Muestra la imagen utilizando la URL almacenada en la propiedad 'url' del ítem */}