import React from 'react';

const Pagination = ({ page, totalPages, searchTerm, setPage, setItems, setTotalPages, setLastEvaluatedKey, fetchItems,  setNextToken, tokenHistory }) => {

  const handlePageChange = (newPage) => {
    let newPageNum = page;
    let newNextToken = null;

    if (newPage === 'prev' && page > 1) {
      newPageNum = page - 1;
      if(searchTerm){
        newNextToken = tokenHistory[`search-${searchTerm}-page-${newPageNum}`] || null;
      } 
    } else if (newPage === 'next' && page < totalPages) {
      newPageNum = page + 1;
      if (searchTerm) {
        newNextToken = tokenHistory[`search-${searchTerm}-page-${newPageNum}`] || null;
      } 
    } else if (typeof newPage === 'number') {
      newPageNum = newPage;
      if (searchTerm) {
        newNextToken = tokenHistory[`search-${searchTerm}-page-${newPageNum}`] || null;
      } 
  }
  setNextToken(newNextToken);
  window.scrollTo(0, 0);
  if (!searchTerm) {
      const newUrl = `/?page=${newPageNum}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setPage(newPageNum);
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
