import { useState, useCallback } from 'react';

export const usePagination = (initialLimit = 20) => {
  const [limit, setLimit] = useState(initialLimit);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const handlePageChange = useCallback((newOffset) => {
    setOffset(newOffset);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setOffset(0); // Reset to first page
  }, []);

  const getPageNumber = () => Math.floor(offset / limit) + 1;
  const getTotalPages = () => Math.ceil(total / limit);

  const canGoNext = () => offset + limit < total;
  const canGoPrevious = () => offset > 0;

  const goToNext = () => {
    if (canGoNext()) {
      handlePageChange(offset + limit);
    }
  };

  const goToPrevious = () => {
    if (canGoPrevious()) {
      handlePageChange(Math.max(0, offset - limit));
    }
  };

  const goToPage = (pageNumber) => {
    handlePageChange((pageNumber - 1) * limit);
  };

  return {
    limit,
    offset,
    total,
    setTotal,
    handlePageChange,
    handleLimitChange,
    getPageNumber,
    getTotalPages,
    canGoNext,
    canGoPrevious,
    goToNext,
    goToPrevious,
    goToPage
  };
};

export default usePagination;
