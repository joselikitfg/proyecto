import React, { useEffect, useState } from 'react';
import SearchBar from '../SearchBar';
import ItemList from '../ItemList';
import useItems from "../../useItems";

const UserComponent = () => {
  const [loading, setLoading] = useState(true);

  const handleSearch = (searchTerm) => {
    console.log('Buscar:', searchTerm);
  };

  const {
    items,
    deleteItem,
    page,
    fetchItems,
    lastEvaluatedKey
  } = useItems();

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      await fetchItems();
      setTimeout(() => {
        setLoading(false);
      }, 450);
    };

    loadItems();
  }, [page]);

  return (
    <div>
      <h2>User Page</h2>
      <p>Accessible by Users and Admins</p>

      <SearchBar onSearch={handleSearch} />
      
      <ItemList items={items} deleteItem={deleteItem} loading={loading} />
    </div>
  );
};

export default UserComponent;
