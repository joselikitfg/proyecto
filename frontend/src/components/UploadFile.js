import React, { useState } from 'react';
import axios from 'axios';

const UploadFile = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false); 
  
    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };
  
    const handleUpload = async (event) => {
      event.preventDefault();
      if (!selectedFile) {
        alert('Por favor, selecciona un archivo para subir.');
        return;
      }
  
      setIsUploading(true); // Indica que la carga ha comenzado
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);
  
      try {
        const response = await axios.post('http://localhost:8082/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Archivo subido correctamente: ' + response.data.message);
        setSelectedFile(null); // Limpia el archivo seleccionado después de la carga
        event.target.reset(); // Resetea el formulario para limpiar el campo de archivo
      } catch (error) {
        console.error('Error al subir el archivo:', error);
        alert('Error al subir el archivo: ' + (error.response?.data?.error || 'Error desconocido'));
      } finally {
        setIsUploading(false); // Restablece el estado de carga
      }
    };
  
    return (
      <form onSubmit={handleUpload}>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button type="submit" disabled={isUploading}>
          {isUploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>
    );
  };
  

export default UploadFile;
