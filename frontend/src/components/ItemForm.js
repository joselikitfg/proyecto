import React from 'react';

function ItemForm({
  newItemName,
  setNewItemName,
  newItemprice,
  setNewItemprice,
  newItemImageUrl, 
  setNewItemImageUrl, 
  handleFormSubmit
}) {
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
          value={newItemprice}
          onChange={(e) => setNewItemprice(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL de la imagen del ítem"
          value={newItemImageUrl} 
          onChange={(e) => setNewItemImageUrl(e.target.value)} 
        />
        <button type="submit">Agregar ítem</button>
      </form>
    </div>
  );
}

export default ItemForm;
