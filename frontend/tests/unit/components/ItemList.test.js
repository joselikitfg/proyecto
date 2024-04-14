import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemList from '../../../src/components/ItemList';
import { BrowserRouter as Router } from 'react-router-dom';

describe('ItemList', () => {
  const mockDeleteItem = jest.fn();
  const sampleItems = [
    {
      _id: { $oid: '1' },
      name: 'Producto 1',
      image_url: 'http://example.com/image1.png',
      price_per_unit: '10',
      total_price: '100'
    },
    {
      _id: { $oid: '2' },
      name: 'Producto 2',
      image_url: 'http://example.com/image2.png',
      price_per_unit: '20',
      total_price: '200'
    }
  ];

  it('renders items correctly', () => {
    render(
      <Router>
        <ItemList items={sampleItems} deleteItem={mockDeleteItem} />
      </Router>
    );

    expect(screen.getByText('Producto 1')).toBeInTheDocument();
    expect(screen.getByText('Producto 2')).toBeInTheDocument();
    expect(screen.getAllByRole('img')[0]).toHaveAttribute('src', 'http://example.com/image1.png');
    expect(screen.getAllByRole('img')[1]).toHaveAttribute('src', 'http://example.com/image2.png');
    expect(screen.getAllByText('Borrar Ítem')).toHaveLength(2);
  });

  it('calls deleteItem on button click', () => {
    render(
      <Router>
        <ItemList items={sampleItems} deleteItem={mockDeleteItem} />
      </Router>
    );

    const deleteButtons = screen.getAllByText('Borrar Ítem');
    fireEvent.click(deleteButtons[0]);
    expect(mockDeleteItem).toHaveBeenCalledWith('1');
  });

  it('provides links to item details', () => {
    render(
      <Router>
        <ItemList items={sampleItems} deleteItem={mockDeleteItem} />
      </Router>
    );

    const detailLinks = screen.getAllByText('Ver Detalles');
    expect(detailLinks[0]).toHaveAttribute('href', '/item/1');
    expect(detailLinks[1]).toHaveAttribute('href', '/item/2');
  });
});
