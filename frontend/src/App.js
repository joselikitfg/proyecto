import React, { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useHistory, useLocation } from 'react-router-dom';
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

import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: 'eu-west-1', 
    userPoolId: 'eu-west-1_Fwl5xoymu', 
    userPoolWebClientId: '6l0a6bjva2jrg1r4to7sa9fddc', 
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
    checkUser(); 
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
            {user ? (
                <p>Hola, {user.username}</p>
              ) : (
                <Link to="/login">Iniciar sesión</Link>
              )}
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

export default withAuthenticator(App);
