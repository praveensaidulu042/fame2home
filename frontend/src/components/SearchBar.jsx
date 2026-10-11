import React from 'react';
import { CATEGORIES } from '../data/products';

export default function SearchBar({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
  totalResults
}) {
  return (
    <div className="search-section">
      <div className="search-box-card">
        {/* Search Input Bar */}
        <div className="search-input-wrap">
          <svg className="search-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>

          <input
            id="product-search-input"
            type="text"
            className="search-input"
            placeholder="Search farm fresh produce (e.g., tomatoes, potatoes, onions, mangoes, spinach)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search fresh produce"
          />

          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search text"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills & Results Counter */}
        <div className="filter-categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat === 'All' ? '🌱 All Produce' : cat}
            </button>
          ))}

          <span className="results-meta">
            Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
    </div>
  );
}
