import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Pagination from '../../../src/components/Pagination';

describe('Pagination', () => {
  it('calls onPageChange with the correct page when Previous is clicked', () => {
    const handlePageChange = jest.fn();
    render(<Pagination page={2} totalPages={3} onPageChange={handlePageChange} />);
    const prevButton = screen.getByRole('button', { name: 'Anterior' });
    fireEvent.click(prevButton);
    expect(handlePageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with the correct page when Next is clicked', () => {
    const handlePageChange = jest.fn();
    render(<Pagination page={1} totalPages={3} onPageChange={handlePageChange} />);
    const nextButton = screen.getByRole('button', { name: 'Siguiente' });
    fireEvent.click(nextButton);
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });
});
