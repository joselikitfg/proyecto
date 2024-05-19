import React from 'react';

const Pagination = ({ page, totalPages, searchTerm, setPage, setItems, setTotalPages, setLastEvaluatedKey, fetchItems }) => {

  const handlePageChange = (newPage) => {
    let newPageNum = page;
    if (newPage === 'prev' && page > 1) {
      newPageNum = page - 1;
    } else if (newPage === 'next' && page < totalPages) {
      newPageNum = page + 1;
    } else if (typeof newPage === 'number') {
      newPageNum = newPage;
    }

    const newUrl = `/?page=${newPageNum}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setPage(newPageNum);

    if (!searchTerm) {
      const storedData = JSON.parse(localStorage.getItem('paginationData')) || {};
      const storedItems = storedData[`items-page-${newPageNum}`];
      const storedLastEvaluatedKey = storedData[`lastEvaluatedKey-page-${newPageNum}`];

      if (storedItems && storedLastEvaluatedKey !== undefined) {
        setItems(storedItems);
        setTotalPages(storedData.totalPages);
        setLastEvaluatedKey(storedLastEvaluatedKey);
      } else {
        fetchItems(newPageNum);
      }
    } else {
      fetchItems(newPageNum, searchTerm);
    }
  };

  return (
    <nav>
      <ul className="pagination">
        <li className="page-item">
          <button className="page-link" onClick={() => handlePageChange('prev')}>Anterior</button>
        </li>
        <li className="page-item">
          <button className="page-link" onClick={() => handlePageChange('next')}>Siguiente</button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
