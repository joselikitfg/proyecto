import { useState, useEffect } from 'react';
import axios from 'axios';

const useItems = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");

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

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:8082/items", {
        name: newItemName,
        description: newItemDescription,
      });
      fetchItems();
      setNewItemName("");
      setNewItemDescription("");
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  const deleteItem = async (idObj) => {
    try {
      if (!idObj || !idObj["$oid"]) {
        console.error("Error deleting item: Invalid ID");
        return;
      }
      const id = idObj["$oid"];
      await axios.delete(`http://localhost:8082/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return { items, setItems, newItemName, setNewItemName, newItemDescription, setNewItemDescription, handleFormSubmit, deleteItem };
};

export default useItems;
