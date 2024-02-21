import React, { useState, useEffect } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    // Realiza la solicitud GET a la ruta /todos cuando el componente se monta
    fetch('/todos')
      .then(response => response.json())
      .then(data => {
        // Actualiza el estado con los todos obtenidos
        setTodos(data);
      })
      .catch(error => {
        // Maneja cualquier error que pueda ocurrir durante la solicitud
        console.error('Error fetching todos:', error);
      });
  }, []); // La dependencia vacía asegura que este efecto solo se ejecute una vez al montar el componente

  return (
    <div>
      <h1>Todo List</h1>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>{todo.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;
