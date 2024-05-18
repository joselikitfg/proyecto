import { React, useEffect }from 'react';
import SearchBar from '../SearchBar';
import ItemList from '../ItemList';

import useItems from "../../useItems";

const UserComponent = () => {

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
    fetchItems(lastEvaluatedKey);
  }, [ page]);

  return (
    <div>
      <h2>User Page</h2>
      <p>Accessible by Users and Admins</p>

      <SearchBar onSearch={handleSearch}/>

      <ItemList items={items} deleteItem={deleteItem} />
    </div>
  );
};

export default UserComponent;