import { ConsoleLogger } from 'aws-amplify/utils';
import React from 'react';

const Pagination = ({ page, totalPages, searchTerm, setPage, setItems, setTotalPages, setLastEvaluatedKey, fetchItems, setNextToken }) => {

  const handlePageChange = (newPage) => {
    let newPageNum = page;
    console.log("PAGINAS TOTALES ",totalPages)
    if (!searchTerm) {
      if (newPage === 'prev' && page > 1) {
        newPageNum = page - 1;
        console.log("PAGINAS PREV", newPageNum)
        console.log("PAGE PREV", page)
      } else if (newPage === 'next' && page < totalPages) {
        newPageNum = page + 1;
        console.log("PAGINAS NEXT", newPageNum)
        console.log("PAGE NEXT", page)
      }
    } else {
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
      console.log("PAGINATION STORED DATA", storedData[`items-page-${newPageNum}`])
      const storedLastEvaluatedKey = storedData[`lastEvaluatedKey-page-${newPageNum}`];

      if (storedItems && storedLastEvaluatedKey !== undefined) {
        setItems(storedItems);
        setTotalPages(storedData.totalPages);
        setLastEvaluatedKey(storedLastEvaluatedKey);
        console.log("AAAAAAAA ",storedItems);
        console.log("LASTEVALUATED ", storedLastEvaluatedKey)
      } else {
        fetchItems(newPageNum);
      }
    } else {
      console.log("BBBBBBBBBBBB ",storedItems);
      console.log("LASTEVALUATED 2", storedLastEvaluatedKey)
      const newUrl = `/?page=${newPageNum}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      setPage(newPageNum);
      const storedData = JSON.parse(localStorage.getItem('paginationDataSearch')) || {};
      const storedItems = storedData[`items-search-page-${newPageNum}`];
      const storedNextToken = storedData[`nextToken-page-${newPageNum}`];

      if (storedItems && storedNextToken !== undefined) {
        setItems(storedItems);
        setNextToken(storedNextToken);
      } else {
        fetchItems(newPageNum, searchTerm);
      }
    }
  };

  return (
    totalPages > 1 && (
      <nav>
        <ul className="pagination">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange('prev')} disabled={page <= 1}>
              Anterior
            </button>
          </li>
          <li className={`page-item ${page >= totalPages && !searchTerm ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => handlePageChange('next')} disabled={page >= totalPages && !searchTerm}>
              Siguiente
            </button>
          </li>
        </ul>
      </nav>
    )
  );
};

export default Pagination;
