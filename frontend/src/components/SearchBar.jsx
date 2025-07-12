import React from 'react';

function SearchBar() {
  return (
    <div className="search-bar">
      <select className="availability-select">
        <option value="">Availability</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>
      <input className="search-input" type="text" placeholder="Search..." />
      <button className="primary-btn">Search</button>
    </div>
  );
}

export default SearchBar; 