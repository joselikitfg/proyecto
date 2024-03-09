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
    <div className="container mt-5">
      <h1 className="mb-3">Agregar ítem</h1>
      <form onSubmit={handleFormSubmit}>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Nombre del ítem"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Precio del ítem"
            value={newItemprice}
            onChange={(e) => setNewItemprice(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="URL de la imagen del ítem"
            value={newItemImageUrl} 
            onChange={(e) => setNewItemImageUrl(e.target.value)} 
          />
        </div>
        <button type="submit" className="btn btn-primary">Agregar ítem</button>
      </form>
    </div>
  );
}

export default ItemForm;
