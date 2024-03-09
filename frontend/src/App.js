import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import UploadFile from "./components/UploadFile"; // Asegúrate de importar el componente UploadFile
import useItems from './useItems';

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
    deleteItem
  } = useItems();

  return (
    <div>
      <Router>
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
              <UploadFile /> {/* Integrado en la página principal */}
            </>
          } />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
