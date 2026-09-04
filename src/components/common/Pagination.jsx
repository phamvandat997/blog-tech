import React from 'react';

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }
  if (current < total - 2) pages.push('...');
  if (!pages.includes(total)) pages.push(total);
  return pages;
}

export function Pagination({ page, totalPages, total, startIdx, endIdx, noun = 'bài viết', onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = paginationRange(page, totalPages);

  return (
    <div className="pagination flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
      <span className="pagination-info text-xs sm:text-sm text-slate-500 dark:text-slate-400">
        Hiển thị <b>{startIdx + 1}–{endIdx}</b> trong <b>{total}</b> {noun}
      </span>
      <div className="pagination-controls flex items-center gap-1.5">
        <button
          className="pagination-btn pagination-prev"
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Trang trước"
        >
          ⬅ Trước
        </button>

        {pages.map((item, idx) =>
          item === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={item}
              className={`pagination-btn ${item === page ? 'active' : ''}`}
              type="button"
              disabled={item === page}
              onClick={() => onPageChange(item)}
              aria-label={`Trang ${item}`}
            >
              {item}
            </button>
          )
        )}

        <button
          className="pagination-btn pagination-next"
          type="button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Trang sau"
        >
          Sau ➡
        </button>
      </div>
    </div>
  );
}
