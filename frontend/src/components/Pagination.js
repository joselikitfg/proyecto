import React from 'react';

const Pagination = ({ page, totalPages, searchTerm, setPage, fetchItems, nextToken }) => {

  const handlePageChange = (newPage) => {
    let newPageNum = page;

    if (newPage === 'prev' && page > 1) {
      newPageNum = page - 1;
    } else if (newPage === 'next' && (page < totalPages || nextToken)) {
      newPageNum = page + 1;
    }

    window.scrollTo(0, 0);
    const newUrl = `/?page=${newPageNum}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setPage(newPageNum);
    fetchItems(newPageNum, searchTerm);
  };

  const disableNextButton = () => {
    if (searchTerm) {
      return !nextToken; 
    }
    return page >= totalPages;
  };

  return (
    <nav>
      <ul className="pagination">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange('prev')} disabled={page <= 1}>
            Anterior
          </button>
        </li>
        <li className={`page-item ${disableNextButton() ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange('next')} disabled={disableNextButton()}>
            Siguiente
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
