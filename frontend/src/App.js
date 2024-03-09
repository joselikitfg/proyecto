import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile";
import Navbar from "./components/Navbar"; // Asegúrate de tener este import
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
    searchItems // Asumiendo que tienes una función para buscar ítems
  } = useItems();

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
