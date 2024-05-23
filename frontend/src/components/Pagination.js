import React from 'react';

const Pagination = ({ page, totalPages, searchTerm, setPage, setItems, setTotalPages, setLastEvaluatedKey, fetchItems, setNextToken }) => {

  const handlePageChange = (newPage) => {

    let newPageNum = page;
    console.log("PAGINA : ", page);
    console.log(" NEW PAGINA : ", newPageNum);
    if(!searchTerm){
      if (newPage === 'prev' && page > 1) {
        newPageNum = page - 1;
      } else if (newPage === 'next' && page < totalPages) {
        newPageNum = page + 1;
      } 
    }else{
      if (newPage === 'prev' && page > 1) {
        newPageNum = page - 1;
      } else if (newPage === 'next') {
        newPageNum = page + 1;
      } 
    }


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
      const newUrl = `/?page=${newPageNum}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setPage(newPageNum);
      const storedData = JSON.parse(localStorage.getItem('paginationDataSearch')) || {};
      const storedItems = storedData[`items-search-page-${newPageNum}`];
      const storedNextToken = storedData[`nextToken-page-${newPageNum}`];

      if (storedItems && storedNextToken !== undefined) {
        setItems(storedItems);
        //setTotalPages(storedData.totalPages);
        setNextToken(storedNextToken);
      } else {
        fetchItems(newPageNum, searchTerm);
      }
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
