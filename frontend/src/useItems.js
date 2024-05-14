import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = "https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items";
const SEARCH_URL = `${BASE_URL}/search`;

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

  const fetchItems = useCallback(async (reset = false) => {
    const endpoint = searchTerm
      ? `${SEARCH_URL}?q=${encodeURIComponent(searchTerm)}`
      : `${BASE_URL}`;

    try {
      const response = await axios.get(endpoint, {
        params: {
          page: page,
          limit: 20,
          start_key: lastEvaluatedKey ? JSON.stringify(lastEvaluatedKey) : null,
        },
      });
      console.log("API response:", response.data);

      if (response.data && Array.isArray(response.data.items)) {
        setItems(reset ? response.data.items : [...items, ...response.data.items]);
        setLastEvaluatedKey(response.data.lastEvaluatedKey || null);
        setTotalPages(response.data.totalPages || 0);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError(err.message || "Error fetching data");
    }
  }, [searchTerm, page, lastEvaluatedKey]);

  useEffect(() => {
    fetchItems(true); // Reset items on initial load or search
  }, [searchTerm, page]);

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
      fetchItems(true); // Reset items after adding a new item
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
      fetchItems(true); // Reset items after deleting an item
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item");
    }
  }, [fetchItems]);

  const searchItems = useCallback((term) => {
    setSearchTerm(term);
    setPage(1);
    setItems([]);
    setLastEvaluatedKey(null);
  }, []);

  return {
    items,
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
    fetchItems,
    error
  };
};

export default useItems;
