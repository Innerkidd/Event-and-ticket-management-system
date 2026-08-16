import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const pageBtnStyle = {
  minWidth: '36px',
  height: '36px',
  padding: '0 10px',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'transparent',
  color: '#94a3b8',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
  transition: 'all 0.2s ease',
};

const activeBtnStyle = {
  ...pageBtnStyle,
  background: '#6366f1',
  borderColor: '#6366f1',
  color: '#ffffff',
};

const Pagination = ({ page = 1, totalPages = 0, total = 0, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const windowSize = 5;
    const start = Math.max(1, Math.min(page - Math.floor(windowSize / 2), totalPages - windowSize + 1));
    const end = Math.min(totalPages, start + windowSize - 1);
    for (let i = Math.max(1, start); i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem', marginRight: 'auto' }}>
        {total} record(s) · Page {page} of {totalPages}
      </span>
      <button
        style={{ ...pageBtnStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} /> Prev
      </button>
      {getPages().map((p) => (
        <button
          key={p}
          style={p === page ? activeBtnStyle : pageBtnStyle}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        style={{ ...pageBtnStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;