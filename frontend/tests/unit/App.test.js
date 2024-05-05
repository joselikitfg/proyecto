import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../src/App';

jest.mock(`../../src/useItems`, () => () => ({
  items: [],
  newItemName: '',
  setNewItemName: jest.fn(),
  newItemPricePerUnit: '',
  setNewItemPricePerUnit: jest.fn(),
  newItemTotalPrice: '',
  setNewItemTotalPrice: jest.fn(),
  newItemImageUrl: '',
  setNewItemImageUrl: jest.fn(),
  handleFormSubmit: jest.fn(),
  deleteItem: jest.fn(),
  searchItems: jest.fn(),
  page: 1,
  setPage: jest.fn(),
  totalPages: 1,
  fetchItems: jest.fn(),
}));

jest.mock('../../src/components/ItemList', () => () => <div>ItemList</div>);
jest.mock('../../src/components/ItemDetail', () => () => <div>ItemDetail</div>);
jest.mock('../../src/components/ItemForm', () => () => <div>ItemForm</div>);
jest.mock('../../src/components/UploadFile', () => () => <div>UploadFile</div>);
jest.mock('../../src/components/Navbar', () => () => <div>Navbar</div>);
jest.mock('../../src/components/Pagination', () => () => <div>Pagination</div>);
jest.mock('../../src/components/ScrapingForm', () => () => <div>ScrapingFormA</div>);
jest.mock('../../src/components/ScrapingFormH', () => () => <div>ScrapingFormH</div>);

describe('App component', () => {
  test('renders App component and checks for initial content', async () => {
    render(
        <App />
    );

    // Verificar que los componentes se renderizan
    expect(screen.getByText('ItemList')).toBeInTheDocument();
    expect(screen.getByText('Pagination')).toBeInTheDocument();
    expect(screen.getByText('ItemForm')).toBeInTheDocument();
    expect(screen.getByText('UploadFile')).toBeInTheDocument();
    expect(screen.getByText('Navbar')).toBeInTheDocument();
    expect(screen.getByText('ScrapingFormA')).toBeInTheDocument();
    expect(screen.getByText('ScrapingFormH')).toBeInTheDocument();
  });
});


describe('Root Component Render', () => {
  it('renders App component without crashing', () => {
      const { container } = render(<App />);
      expect(container).toBeInTheDocument();
  });
});
