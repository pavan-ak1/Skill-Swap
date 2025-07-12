import React, { useState, useEffect } from 'react';

function Pagination({ current, total, onPageChange }) {
  const [isMobile, setIsMobile] = useState(false);

  // Color palette based on color theory for dark theme
  const colors = {
    primary: '#6366f1', // Indigo - primary brand color
    primaryHover: '#4f46e5', // Darker indigo for hover states
    secondary: '#10b981', // Emerald - secondary accent
    background: '#0f172a', // Slate 900 - main background
    surface: '#1e293b', // Slate 800 - surface elements
    surfaceHover: '#334155', // Slate 700 - hover states
    border: '#475569', // Slate 600 - borders
    text: '#f8fafc', // Slate 50 - primary text
    textSecondary: '#cbd5e1', // Slate 300 - secondary text
    danger: '#ef4444', // Red 500 - danger/error states
    dangerHover: '#dc2626', // Red 600 - danger hover
    success: '#22c55e', // Green 500 - success states
    warning: '#f59e0b' // Amber 500 - warning states
  };

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getVisiblePages = () => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }

    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
    marginTop: '32px',
    marginBottom: '16px'
  };

  const buttonStyles = {
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    color: colors.textSecondary,
    padding: isMobile ? '8px 12px' : '10px 14px',
    borderRadius: '6px',
    fontSize: isMobile ? '0.85rem' : '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '36px' : '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  };

  const activeButtonStyles = {
    ...buttonStyles,
    background: colors.primary,
    borderColor: colors.primary,
    color: colors.text,
    fontWeight: '600'
  };

  const disabledButtonStyles = {
    ...buttonStyles,
    opacity: '0.4',
    cursor: 'not-allowed',
    borderColor: colors.border
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== current && onPageChange) {
      onPageChange(page);
    }
  };

  const handlePrevClick = () => {
    if (current > 1 && onPageChange) {
      onPageChange(current - 1);
    }
  };

  const handleNextClick = () => {
    if (current < total && onPageChange) {
      onPageChange(current + 1);
    }
  };

  if (total <= 1) return null;

  return (
    <div style={containerStyles}>
      <button
        style={current === 1 ? disabledButtonStyles : buttonStyles}
        onClick={handlePrevClick}
        disabled={current === 1}
        onMouseEnter={(e) => {
          if (current !== 1) {
            e.target.style.borderColor = colors.primary;
            e.target.style.color = colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (current !== 1) {
            e.target.style.borderColor = colors.border;
            e.target.style.color = colors.textSecondary;
          }
        }}
      >
        ←
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          style={page === current ? activeButtonStyles : page === '...' ? disabledButtonStyles : buttonStyles}
          onClick={() => handlePageClick(page)}
          disabled={page === '...'}
          onMouseEnter={(e) => {
            if (page !== '...' && page !== current) {
              e.target.style.borderColor = colors.primary;
              e.target.style.color = colors.primary;
            }
          }}
          onMouseLeave={(e) => {
            if (page !== '...' && page !== current) {
              e.target.style.borderColor = colors.border;
              e.target.style.color = colors.textSecondary;
            }
          }}
        >
          {page}
        </button>
      ))}

      <button
        style={current === total ? disabledButtonStyles : buttonStyles}
        onClick={handleNextClick}
        disabled={current === total}
        onMouseEnter={(e) => {
          if (current !== total) {
            e.target.style.borderColor = colors.primary;
            e.target.style.color = colors.primary;
          }
        }}
        onMouseLeave={(e) => {
          if (current !== total) {
            e.target.style.borderColor = colors.border;
            e.target.style.color = colors.textSecondary;
          }
        }}
      >
        →
      </button>
    </div>
  );
}

export default Pagination; 