import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../../../src/components/Navbar';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

describe('Navbar', () => {
    it('renders correctly', () => {
        const onSearchMock = jest.fn();
        render(<Navbar onSearch={onSearchMock} />);
        expect(screen.getByText('DescuentApp')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Buscar productos')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
    });

});
