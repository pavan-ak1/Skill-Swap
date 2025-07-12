import React from 'react';

function Pagination({ current, total, onPageChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={current === 1} onClick={() => onPageChange(current - 1)}>{'<'}</button>
      {pages.map(page => (
        <button
          key={page}
          className={`page-btn${page === current ? ' active' : ''}`}
          disabled={page === current}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      <button className="page-btn" disabled={current === total} onClick={() => onPageChange(current + 1)}>{'>'}</button>
    </div>
  );
}

export default Pagination; 