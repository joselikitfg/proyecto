import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ItemList from "./components/ItemList";
import ItemDetail from "./components/ItemDetail";
import ItemForm from "./components/ItemForm"; // Importa el nuevo componente
import useItems from './useItems'; 

function App() {
  const { items, newItemName, setNewItemName, newItemDescription, setNewItemDescription, handleFormSubmit, deleteItem } = useItems();

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
