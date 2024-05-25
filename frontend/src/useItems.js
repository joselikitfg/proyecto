import { useState, useCallback } from "react";
import axios from "axios";

const BASE_SEARCH_URL = 'https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/search';
const BASE_ITEMS_URL = 'https://m6p642oycf.execute-api.eu-west-1.amazonaws.com/Prod/items';

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
  const [nextToken, setNextToken] = useState(null);
  const [pageTokens, setPageTokens] = useState({});


  const resetPagination = () => {
    console.log("SE RESETEA");
    setPage(1);
    setLastEvaluatedKey(null);
    setNextToken(null);
    setPageTokens({});
    const newUrl = `/?page=${1}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const fetchItems = useCallback(async (currentPage = 1, searchTerm = '') => {
    try {
      const limit = 48;
      const token = pageTokens[currentPage - 1] || null;
      const startKeyParam = token ? `&start_key=${encodeURIComponent(JSON.stringify(token))}` : '';
      let url;
      if (searchTerm) {
        console.log(searchTerm);
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        url = `${BASE_SEARCH_URL}/${encodedSearchTerm}?next_token=${encodeURIComponent(token || '')}`;
      } else {
        url = `${BASE_ITEMS_URL}?limit=${limit}&page=${currentPage}${startKeyParam}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
      }
      const data = await response.json();

      setItems(data.items);
      setTotalPages(data.totalPages || 0);
      setLastEvaluatedKey(data.lastEvaluatedKey || null);

      setNextToken(data.next_token || null);

      setPageTokens((prevTokens) => ({
        ...prevTokens,
        [currentPage]: data.lastEvaluatedKey || data.next_token,
      }));

      
      setError(null);

    } catch (err) {
      setError(err.message || "Error fetching data");
    }
  }, [lastEvaluatedKey,pageTokens,searchTerm]);

  const handleFormSubmit = useCallback(async (event) => {
    event.preventDefault();
    const newItem = {
      name: newItemName,
      price_per_unit: newItemPricePerUnit,
      total_price: newItemTotalPrice,
      image_url: newItemImageUrl,
    };

    try {
      await axios.post(BASE_ITEMS_URL, newItem);
      fetchItems(); 
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

  const deleteItem = useCallback(async (pname) => {
    try {
      await axios.delete(`${BASE_ITEMS_URL}/${encodeURIComponent(pname)}`);
      fetchItems(); 
      setError(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError(err.message || "Failed to delete item");
    }
  }, [fetchItems]);

  const searchItems = useCallback(searchTerm => {
    resetPagination();
    setSearchTerm(searchTerm);
    fetchItems(1, searchTerm); 
  }, [fetchItems,searchTerm]);

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
    setSearchTerm,
    error,
    nextToken,
    setNextToken,
    searchItems
  };
};

export default useItems;
