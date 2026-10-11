import React from 'react';
import ProductCard from './ProductCard';

export default function ProductList({
  products,
  onAddToCart,
  onResetSearch,
  isLoading = false,
  error = null,
  onRetry = null
}) {
  // 1. Loading State Skeleton
  if (isLoading) {
    return (
      <div className="products-loading-container" role="status" aria-live="polite">
        <div className="loading-pulse-header">
          <div className="loading-spinner"></div>
          <p className="loading-label">Connecting to farm repository & fetching produce...</p>
        </div>

        <div className="products-grid skeleton-grid" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="product-card skeleton-card">
              <div className="skeleton-box skeleton-image"></div>
              <div className="product-card-body" style={{ padding: '1.25rem' }}>
                <div className="skeleton-box skeleton-tag"></div>
                <div className="skeleton-box skeleton-title"></div>
                <div className="skeleton-box skeleton-farmer"></div>
                <div className="skeleton-box skeleton-price"></div>
                <div className="skeleton-box skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Fatal API Error State (When no fallback produce is available)
  if (error && products.length === 0) {
    return (
      <div className="empty-products" role="alert" style={{ borderColor: 'var(--color-danger, #ef4444)' }}>
        <div className="empty-icon">⚠️</div>
        <h3 className="empty-title">Unable to Load Produce</h3>
        <p className="empty-sub">{error}</p>
        {onRetry && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onRetry}
            style={{ marginTop: '1rem' }}
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  // 3. Empty Search / Inventory State
  if (products.length === 0) {
    return (
      <div className="empty-products">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">No fresh produce found</h3>
        <p className="empty-sub">
          We couldn't find any products matching your search criteria. Try searching for tomatoes, potatoes, onions, mangoes, or spinach.
        </p>
        <button
          type="button"
          className="btn btn-outline-green"
          onClick={onResetSearch}
        >
          View All Products
        </button>
      </div>
    );
  }

  // 4. Products Grid
  return (
    <div className="products-grid" id="products-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
