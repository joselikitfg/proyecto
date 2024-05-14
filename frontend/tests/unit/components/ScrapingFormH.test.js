import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import ScrapingFormH from '../../../src/components/ScrapingFormH';

jest.mock('axios');

describe('ScrapingFormH', () => {
    it('allows user to input search terms', () => {
      render(<ScrapingFormH />);
      const input = screen.getByLabelText(/términos de búsqueda para scrap/i);
      fireEvent.change(input, { target: { value: 'term1, term2' } });
      expect(input.value).toBe('term1, term2');
    });
  
    it('displays a confirmation message after successful scraping', async () => {
      const mockResponse = { data: { message: 'Scraping successful' } };
      axios.post.mockResolvedValue(mockResponse);
  
      render(<ScrapingFormH />);
      const input = screen.getByLabelText(/términos de búsqueda para scrap/i);
      fireEvent.change(input, { target: { value: 'term1, term2' } });
      fireEvent.click(screen.getByRole('button', { name: /iniciar scraping/i }));
  
      await waitFor(() => {
        expect(screen.getByText(/scraping finalizado para: term1, term2/i)).toBeInTheDocument();
      });
    });
  
    it('displays an error message if the scraping fails', async () => {
      const mockError = { response: { data: { message: 'Error occurred' } } };
      axios.post.mockRejectedValue(mockError);
  
      render(<ScrapingFormH />);
      const input = screen.getByLabelText(/términos de búsqueda para scrap/i);
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
  