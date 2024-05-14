import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadFile from '../../../src/components/UploadFile'; // Asegúrate de que la ruta es correcta
import axios from 'axios';

// Mock para axios
jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

// Mock para alertas globales (window.alert)
window.alert = jest.fn();

describe('UploadFile', () => {
  it('allows a file to be selected', () => {
    render(<UploadFile />);
    const fileInput = screen.getByRole('button', { name: /subir archivo/i });
    const file = new File(['hello'], 'hello.json', { type: 'application/json' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(fileInput.files[0]).toEqual(file);
    expect(fileInput.files).toHaveLength(1);
  });
});