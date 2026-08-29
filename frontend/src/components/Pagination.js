import React from 'react';
import '../styles/Pagination.css';

function Pagination({ pagination }) {
  const { getPageNumber, getTotalPages, canGoNext, canGoPrevious, goToNext, goToPrevious, limit, total, handleLimitChange } = pagination;

  const currentPage = getPageNumber();
  const totalPages = getTotalPages();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Seite <strong>{currentPage}</strong> von <strong>{totalPages}</strong>
        </span>
        <span className="ms-3">
          Gesamt: <strong>{total}</strong> Einträge
        </span>
      </div>

      <div className="pagination-controls">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={goToPrevious}
          disabled={!canGoPrevious()}
        >
          ← Vorherige
        </button>

        <div className="pagination-page-numbers">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = Math.max(1, currentPage - 2) + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => pagination.goToPage(page)}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          className="btn btn-sm btn-outline-primary"
          onClick={goToNext}
          disabled={!canGoNext()}
        >
          Nächste →
        </button>

        <select
          className="form-select form-select-sm ms-3"
          value={limit}
          onChange={(e) => handleLimitChange(parseInt(e.target.value))}
          style={{ maxWidth: '100px' }}
        >
          <option value={10}>10 pro Seite</option>
          <option value={20}>20 pro Seite</option>
          <option value={50}>50 pro Seite</option>
          <option value={100}>100 pro Seite</option>
        </select>
      </div>
    </div>
  );
}

export default Pagination;
