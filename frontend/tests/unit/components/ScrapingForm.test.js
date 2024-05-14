import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ScrapingFormA from '../../../src/components/ScrapingForm';

jest.mock('axios');

describe('ScrapingFormA', () => {
  it('allows user to input search terms', () => {
    render(<ScrapingFormA />);
    const input = screen.getByLabelText(/términos de búsqueda para scrap alcampo/i);
    fireEvent.change(input, { target: { value: 'term1, term2' } });
    expect(input.value).toBe('term1, term2');
  });

  it('displays a confirmation message after successful scraping', async () => {
    const mockResponse = { data: { message: 'Scraping successful' } };
    axios.post.mockResolvedValue(mockResponse);

    render(<ScrapingFormA />);
    const input = screen.getByLabelText(/términos de búsqueda para scrap alcampo/i);
    fireEvent.change(input, { target: { value: 'term1, term2' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar scraping/i }));

    await waitFor(() => {
      expect(screen.getByText(/scraping finalizado para: term1, term2/i)).toBeInTheDocument();
    });
  });

  it('displays an error message if the scraping fails', async () => {
    const mockError = { response: { data: { message: 'Error occurred' } } };
    axios.post.mockRejectedValue(mockError);

    render(<ScrapingFormA />);
    const input = screen.getByLabelText(/términos de búsqueda para scrap alcampo/i);
    fireEvent.change(input, { target: { value: 'term1, term2' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar scraping/i }));

    await waitFor(() => {
      expect(screen.getByText(/error al iniciar el scraping\./i)).toBeInTheDocument();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
