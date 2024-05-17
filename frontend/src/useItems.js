import { useState, useCallback } from "react";
import axios from "axios";

const BASE_URL = "https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items";

const useItems = () => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPricePerUnit, setNewItemPricePerUnit] = useState("");
  const [newItemTotalPrice, setNewItemTotalPrice] = useState("");
  const [newItemImageUrl, setNewItemImageUrl] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

  const fetchItems = useCallback(async (currentPage = 1, searchTerm = '') => {
    try {
      const startKey = lastEvaluatedKey && !searchTerm ? `&start_key=${encodeURIComponent(JSON.stringify(lastEvaluatedKey))}` : '';
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      const url = `${BASE_URL}?limit=12&page=${currentPage}${startKey}${searchParam}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();
      setItems(data.items);
      setTotalPages(data.totalPages || 0);
      setLastEvaluatedKey(data.lastEvaluatedKey || null);

      const storedData = JSON.parse(localStorage.getItem('paginationData')) || {};
      if (!searchTerm) {
        storedData[`items-page-${currentPage}`] = data.items;
        storedData[`lastEvaluatedKey-page-${currentPage}`] = data.lastEvaluatedKey;
        storedData.totalPages = data.totalPages || 0;
        localStorage.setItem('paginationData', JSON.stringify(storedData));
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Error fetching data");
    }
  }, [lastEvaluatedKey]);

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    const newItem = {
      name: newItemName,
      price_per_unit: newItemPricePerUnit,
      total_price: newItemTotalPrice,
      image_url: newItemImageUrl,
    };

    try {
      await axios.post(BASE_URL, newItem);
      fetchItems(); // Llamar a fetchItems sin startKey para reiniciar la lista
      setNewItemName("");
      setNewItemPricePerUnit("");
      setNewItemTotalPrice("");
      setNewItemImageUrl("");
      setError(null);
    } catch (err) {
      console.error("Error adding item:", err);
      setError(err.message || "Failed to add item");
    }
  }, [newItemName, newItemPricePerUnit, newItemTotalPrice, newItemImageUrl, fetchItems]);

  const deleteItem = useCallback(async (id) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      fetchItems(); // Llamar a fetchItems sin startKey para reiniciar la lista
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item");
    }
  }, [fetchItems]);

  const searchItems = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
    setLastEvaluatedKey(null);
    fetchItems(1, term); // Llamar a fetchItems con el término de búsqueda
  }, [fetchItems]);

  return {
    items,
    setItems,
    newItemName,
    setNewItemName,
    newItemPricePerUnit,
    setNewItemPricePerUnit,
    newItemTotalPrice,
    setNewItemTotalPrice,
    newItemImageUrl,
    setNewItemImageUrl,
    handleFormSubmit,
    deleteItem,
    searchItems,
    page,
    setPage,
    totalPages,
    setTotalPages,
    fetchItems,
    lastEvaluatedKey,
    setLastEvaluatedKey,
    searchTerm,
    error
  };
};

export default useItems;
