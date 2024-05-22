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

  const resetPagination = () => {
    setPage(1);
    setLastEvaluatedKey(null);
    setNextToken(null);
    localStorage.removeItem('paginationData');
    localStorage.removeItem('paginationDataSearch');
    const newUrl = `/?page=${1}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const fetchItems = useCallback(async (currentPage = 1, searchTerm = '') => {
    try {
      const limit = 48;
      const startKeyParam = lastEvaluatedKey ? `&start_key=${encodeURIComponent(JSON.stringify(lastEvaluatedKey))}` : '';
      let url;
      if (searchTerm) {
        const encodedSearchTerm = encodeURIComponent(searchTerm);
        url = `${BASE_SEARCH_URL}/${encodedSearchTerm}?next_token=${encodeURIComponent(nextToken || '')}`;
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

      if (!searchTerm) {
        const storedData = JSON.parse(localStorage.getItem('paginationData')) || {};
        storedData[`items-page-${currentPage}`] = data.items;
        storedData[`lastEvaluatedKey-page-${currentPage}`] = data.lastEvaluatedKey;
        storedData.totalPages = data.totalPages || 0;
        localStorage.setItem('paginationData', JSON.stringify(storedData));
      }else{
        const storedData = JSON.parse(localStorage.getItem('paginationDataSearch')) || {};
        storedData[`items-search-page-${currentPage}`] = data.items;
        storedData[`nextToken-page-${currentPage}`] = data.next_token;
        storedData.totalPages = data.totalPages || 0;
        localStorage.setItem('paginationDataSearch', JSON.stringify(storedData));
      }

      setError(null);
    } catch (err) {
      setError(err.message || "Error fetching data");
    }
  }, [lastEvaluatedKey,nextToken]);

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

  const searchItems = useCallback((term) => {
    setSearchTerm(term);
    resetPagination();
    fetchItems(1, term); 
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
    error,
    setNextToken,
  };
};

export default useItems;
