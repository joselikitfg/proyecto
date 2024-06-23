import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemForm from '../../../src/components/ItemForm';

describe('ItemForm', () => {
  const mockSetNewItemName = jest.fn();
  const mockSetNewItemPricePerUnit = jest.fn();
  const mockSetNewItemTotalPrice = jest.fn();
  const mockSetNewItemImageUrl = jest.fn();
  const mockHandleFormSubmit = jest.fn();

  beforeEach(() => {
    render(
      <ItemForm
        newItemName=""
        setNewItemName={mockSetNewItemName}
        newItemPricePerUnit=""
        setNewItemPricePerUnit={mockSetNewItemPricePerUnit}
        newItemTotalPrice=""
        setNewItemTotalPrice={mockSetNewItemTotalPrice}
        newItemImageUrl=""
        setNewItemImageUrl={mockSetNewItemImageUrl}
        handleFormSubmit={mockHandleFormSubmit}
      />
    );
  });

  it('renders all input fields and a submit button', () => {
    expect(screen.getByPlaceholderText('Nombre del ítem')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Precio por unidad')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Precio total')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('URL de la imagen del ítem')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Agregar ítem' })).toBeInTheDocument();
  });

  it('calls the correct functions on input change', () => {
    fireEvent.change(screen.getByPlaceholderText('Nombre del ítem'), { target: { value: 'Nuevo Ítem' } });
    expect(mockSetNewItemName).toHaveBeenCalledWith('Nuevo Ítem');

    fireEvent.change(screen.getByPlaceholderText('Precio por unidad'), { target: { value: '100' } });
    expect(mockSetNewItemPricePerUnit).toHaveBeenCalledWith('100');

    fireEvent.change(screen.getByPlaceholderText('Precio total'), { target: { value: '500' } });
    expect(mockSetNewItemTotalPrice).toHaveBeenCalledWith('500');

    fireEvent.change(screen.getByPlaceholderText('URL de la imagen del ítem'), { target: { value: 'http://example.com/image.png' } });
    expect(mockSetNewItemImageUrl).toHaveBeenCalledWith('http://example.com/image.png');
  });

  it('submits the form', () => {
    fireEvent.submit(screen.getByRole('button', { name: 'Agregar ítem' }));
    expect(mockHandleFormSubmit).toHaveBeenCalled();
  });
});
