import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar';
import ItemList from '../ItemList';
import Pagination from '../Pagination';  // Asegúrate de importar el componente Pagination
import useItems from "../../useItems";

const UserComponent = () => {
  const [loading, setLoading] = useState(true);

  
  const {
    items,
    deleteItem,
    page,
    setPage,
    totalPages,
    setItems,
    setTotalPages,
    setLastEvaluatedKey,
    fetchItems,
    setNextToken,
    lastEvaluatedKey,
    nextToken,
    searchTerm,
    searchItems,
    setSearchTerm,
  } = useItems();
  
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      await fetchItems(page, searchTerm);
      setTimeout(() => {
        setLoading(false);
      }, 450);
    };
    
    loadItems();
  }, [page, searchTerm]);
  
  const handleSearch = (searchTerm) => {
    console.log('Buscar:', searchTerm);
    setPage(1);
    fetchItems(page,searchTerm);
    setSearchTerm(searchTerm);
  };

  return (
    <div>
      <h2>User Page</h2>
      <p>Accessible by Users and Admins</p>

      <SearchBar onSearch={handleSearch} />
      
      <ItemList items={items} deleteItem={deleteItem} loading={loading} />

      <Pagination
        page={page}
        totalPages={totalPages}
        searchTerm={searchTerm}
        setPage={setPage}
        setItems={setItems}
        setTotalPages={setTotalPages}
        setLastEvaluatedKey={setLastEvaluatedKey}
        fetchItems={fetchItems}
        setNextToken={setNextToken}
        nextToken={nextToken}
        lastEvaluatedKey={lastEvaluatedKey}
        setSearchTerm={setSearchTerm}
      />
    </div>
  );
};

export default UserComponent;
