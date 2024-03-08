import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm";
import useItems from './useItems';

function App() {
  const {
    items,
    newItemName,
    setNewItemName,
    newItemDescription,
    setNewItemDescription,
    newItemImageUrl, // Asume que useItems ahora proporciona estos
    setNewItemImageUrl, // Asume que useItems ahora proporciona estos
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
                newItemDescription={newItemDescription}
                setNewItemDescription={setNewItemDescription}
                newItemImageUrl={newItemImageUrl} // Nuevo prop para la URL de la imagen
                setNewItemImageUrl={setNewItemImageUrl} // Nuevo prop para actualizar la URL de la imagen
                handleFormSubmit={handleFormSubmit}
              />
            </>
          } />
          <Route path="/item/:id" element={<ItemDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
