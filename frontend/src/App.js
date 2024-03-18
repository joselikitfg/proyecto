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
    newItemPricePerUnit, // Actualizado para reflejar los nuevos campos
    setNewItemPricePerUnit, // Actualizado para reflejar los nuevos campos
    newItemTotalPrice, // Actualizado para reflejar los nuevos campos
    setNewItemTotalPrice, // Actualizado para reflejar los nuevos campos
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
                newItemPricePerUnit={newItemPricePerUnit} // Actualizado
                setNewItemPricePerUnit={setNewItemPricePerUnit} // Actualizado
                newItemTotalPrice={newItemTotalPrice} // Actualizado
                setNewItemTotalPrice={setNewItemTotalPrice} // Actualizado
                newItemImageUrl={newItemImageUrl}
                setNewItemImageUrl={setNewItemImageUrl}
                handleFormSubmit={handleFormSubmit}
              />
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
