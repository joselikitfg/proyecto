import React from 'react';

const Pagination = ({ onPageChange }) => {
  const handlePageChange = (newPage) => {
    if (newPage === 'prev') {
      onPageChange(currentPage - 1);
    } else if (newPage === 'next') {
      onPageChange(currentPage + 1);
    }
  };
  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <button className="page-link" onClick={() => onPageChange('prev')}>Anterior</button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={() => onPageChange('next')}>Siguiente</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
