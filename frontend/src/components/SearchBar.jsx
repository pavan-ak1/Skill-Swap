import React, { useState, useEffect } from 'react';

function SearchBar({ onSearch, onAvailabilityChange }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('');
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

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm, availability);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAvailabilityChange = (e) => {
    const value = e.target.value;
    setAvailability(value);
    if (onAvailabilityChange) {
      onAvailabilityChange(value);
    }
  };

  const containerStyles = {
    background: 'transparent',
    borderRadius: '0',
    padding: '0',
    boxShadow: 'none',
    border: 'none',
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? '12px' : '16px',
    alignItems: isMobile ? 'stretch' : 'center',
    maxWidth: '800px',
    margin: '0 auto',
    marginBottom: '24px'
  };

  const selectStyles = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '100%' : '140px',
    outline: 'none'
  };

  const inputStyles = {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    color: colors.text,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    minWidth: isMobile ? '100%' : '200px'
  };

  const buttonStyles = {
    background: colors.primary,
    color: colors.text,
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minWidth: isMobile ? '100%' : '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <>
      <style>
        {`
          select:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
          }
          
          input:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
          }
          
          select option {
            background: ${colors.background};
            color: ${colors.text};
          }
          
          
        `}
      </style>

      <div style={containerStyles}>
        <select 
          style={selectStyles}
          value={availability}
          onChange={handleAvailabilityChange}
        >
          <option value="">All Availability</option>
          <option value="available">Available Now</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekends">Weekends</option>
          <option value="evenings">Evenings</option>
          <option value="flexible">Flexible</option>
        </select>

        <input 
          style={inputStyles}
          type="text" 
          placeholder="Search by skills, location, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />

                 <button 
           style={buttonStyles}
           onClick={handleSearch}
           onMouseEnter={(e) => {
             e.target.style.background = colors.primaryHover;
           }}
           onMouseLeave={(e) => {
             e.target.style.background = colors.primary;
           }}
         >
           Search
         </button>
      </div>
    </>
  );
}

export default SearchBar; 