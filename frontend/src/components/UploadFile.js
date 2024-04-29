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

      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile, selectedFile.name);

      try {
        const response = await axios.post('http://localhost:8082/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('Archivo subido correctamente: ' + response.data.message);
        setSelectedFile(null);
        event.target.reset();
      } catch (error) {
        console.error('Error al subir el archivo:', error);
        alert('Error al subir el archivo: ' + (error.response?.data?.error || 'Error desconocido'));
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <form onSubmit={handleUpload} className="mb-3">
        <input type="file" accept=".json" className="form-control" onChange={handleFileChange} />
        <button type="submit" disabled={isUploading} className="btn btn-primary mt-2">
          {isUploading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>
    );
};

export default UploadFile;
