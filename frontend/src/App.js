import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile";
import Navbar from "./components/Navbar";
import Pagination from "./components/Pagination";
import useItems from './useItems';
import ScrapingFormA from "./components/ScrapingForm";
import ScrapingFormH from "./components/ScrapingFormH";
import 'bootstrap/dist/css/bootstrap.min.css';

import Amplify from 'aws-amplify';

Amplify.configure({
    Auth: {
        mandatorySignIn: true,
        region: 'us-west-2', // actualiza esto con tu región
        userPoolId: 'us-west-2_1a2b3c4d5', // actualiza esto con tu User Pool ID
        userPoolWebClientId: '1b2c3d4e5example', // actualiza esto con tu App client ID
    }
});


function App() {
  const {
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
  } = useItems();

  useEffect(() => {
    fetchItems();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  console.log('Pagination props in App:', { page, totalPages });

  return (
    <Router>
      <Navbar onSearch={searchItems} />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={
            <>
              <ItemList items={items} deleteItem={deleteItem} />
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              <ItemForm
                newItemName={newItemName}
                setNewItemName={setNewItemName}
                newItemPricePerUnit={newItemPricePerUnit}
                setNewItemPricePerUnit={setNewItemPricePerUnit}
                newItemTotalPrice={newItemTotalPrice}
                setNewItemTotalPrice={setNewItemTotalPrice}
                newItemImageUrl={newItemImageUrl}
                setNewItemImageUrl={setNewItemImageUrl}
                handleFormSubmit={handleFormSubmit}
              />
              <UploadFile />
              <ScrapingFormA/>
              <ScrapingFormH/>
            </>
          } />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
