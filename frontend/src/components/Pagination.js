import React from 'react';

const Pagination = ({ onPageChange }) => {
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
