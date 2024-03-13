import React, { useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile";
import Navbar from "./components/Navbar"; 
import Pagination from "./components/Pagination"; 
import useItems from './useItems';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const {
    items,
    newItemName,
    setNewItemName,
    newItemprice,
    setNewItemprice,
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
              <ItemForm
                newItemName={newItemName}
                setNewItemName={setNewItemName}
                newItemprice={newItemprice}
                setNewItemprice={setNewItemprice}
                newItemImageUrl={newItemImageUrl}
                setNewItemImageUrl={setNewItemImageUrl}
                handleFormSubmit={handleFormSubmit}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              <UploadFile />
            </>
          } />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
