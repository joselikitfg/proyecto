import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <nav>
      <ul className="pagination">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => changePage(page - 1)}>Anterior</button>
        </li>
        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => changePage(page + 1)}>Siguiente</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
