import React from 'react';

function ItemForm({
  newItemName,
  setNewItemName,
  newItemDescription,
  setNewItemDescription,
  newItemImageUrl, // Estado para la nueva URL de la imagen
  setNewItemImageUrl, // Función para actualizar el estado de la URL de la imagen
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
          value={newItemDescription}
          onChange={(e) => setNewItemDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="URL de la imagen del ítem"
          value={newItemImageUrl} // Usa el estado para la URL de la imagen
          onChange={(e) => setNewItemImageUrl(e.target.value)} // Actualiza el estado con la nueva URL
        />
        <button type="submit">Agregar ítem</button>
      </form>
    </div>
  );
}

export default ItemForm;
