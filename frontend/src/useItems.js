import { useState, useEffect } from 'react';
import axios from 'axios';

const useItems = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState(''); // Estado para la URL de la imagen
  
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        name: newItemName,
        description: newItemDescription,
        url: newItemImageUrl, // Asegúrate de incluir la URL de la imagen
      };
      await axios.post('http://localhost:8082/items', newItem);
      fetchItems(); // Actualiza la lista de ítems después de añadir uno nuevo
      setNewItemName(''); // Restablece el estado del nombre del ítem
      setNewItemDescription(''); // Restablece el estado de la descripción del ítem
      setNewItemImageUrl(''); // Restablece el estado de la URL de la imagen
    } catch (error) {
      console.error("Error al agregar el ítem:", error);
    }
  };

  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8082/items/${id}`);
      fetchItems(); // Actualiza la lista de ítems después de eliminar uno
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return {
    items,
    newItemName,
    setNewItemName,
    newItemDescription,
    setNewItemDescription,
    newItemImageUrl,
    setNewItemImageUrl,
    handleFormSubmit,
    deleteItem,
  };
};

export default useItems;
