import React from 'react';

function ItemForm({ newItemName, setNewItemName, newItemDescription, setNewItemDescription, handleFormSubmit }) {
  return (
    <div>
      <h1>Agregar ítem</h1>
      <form onSubmit={handleFormSubmit}>
        <input
          type="text"
          placeholder="Nombre del ítem"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción del ítem"
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
        />
        <button type="submit">Agregar ítem</button>
      </form>
    </div>
  );
}

export default ItemForm;
