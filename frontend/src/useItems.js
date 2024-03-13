import { useState, useEffect } from "react";
import axios from "axios";

const useItems = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemprice, setNewItemprice] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [page, setPage] = useState(1); 
  const [totalPages, setTotalPages] = useState(0); 


  const fetchItems = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8082/items?page=${page}&limit=12`
      );
      setItems(response.data.items || []);
      setTotalPages(response.data.totalPages);
      console.log("Fetching items from backend", response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };


  useEffect(() => {
    fetchItems();
  }, [page]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const newItem = {
        name: newItemName,
        price: newItemprice,
        image_url: newItemImageUrl,
      };
      await axios.post("http://localhost:8082/items", newItem);
      fetchItems(); 
      setNewItemName("");
      setNewItemprice("");
      setNewItemImageUrl("");
    } catch (error) {
      console.error("Error al agregar el ítem:", error);
    }
  };


  const deleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:8082/items/${id}`);
      fetchItems(); 
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };


  const searchItems = async (searchTerm) => {
    try {
      const response = await axios.get(
        `http://localhost:8082/search?q=${encodeURIComponent(searchTerm)}`
      );
      setItems(response.data); 

    } catch (error) {
      console.error("Error searching item:", error);
    }
  };

  return {
    items,
    newItemName,
    setNewItemName,
    newItemprice,
    setNewItemprice,
    newItemImageUrl,
    setNewItemImageUrl,
    handleFormSubmit,
    deleteItem,
    searchItems,
    page,
    setPage,
    totalPages,
    fetchItems,
  };
};

export default useItems;
