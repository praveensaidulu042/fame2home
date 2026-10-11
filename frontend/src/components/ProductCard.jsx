import React, { useState } from 'react';

// Produce emoji fallback mapping
const EMOJI_MAP = {
  'prod-1': '🍅', // Tomatoes
  'prod-2': '🥔', // Potatoes
  'prod-3': '🧅', // Onions
  'prod-4': '🥭', // Mangoes
  'prod-5': '🥬'  // Spinach
};

export default function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const handleAdd = () => {
    onAddToCart(product);
    setIsAddedRecently(true);
    setTimeout(() => {
      setIsAddedRecently(false);
    }, 1200);
  };

  const isOutOfStock = Number(product.stock) <= 0;
  const emojiFallback = EMOJI_MAP[product.id] || '🌱';

  return (
    <article className="product-card" id={`product-${product.id}`}>
      {/* Product Image Section with Fallback Grace */}
      <div className="product-image-container">
        {/* Floating Badges */}
        {product.badge && (
          <div className="product-badge-overlay">
            <span className={`badge ${product.badge === 'Seasonal King' ? 'badge-amber' : 'badge-green'}`}>
              {product.badge}
            </span>
          </div>
        )}

        {isOutOfStock ? (
          <div className="product-out-of-stock-tag">
            <span>Out of Stock</span>
          </div>
        ) : product.isOrganic ? (
          <div className="product-organic-tag" title="Cultivated without chemical pesticides">
            <span>🌿</span> Organic
          </div>
        ) : null}

        {imageError ? (
          <div className="product-image-fallback" role="img" aria-label={product.name}>
            <span className="fallback-emoji">{emojiFallback}</span>
            <span className="fallback-label">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Product Info & Pricing */}
      <div className="product-content">
        {/* Farmer Info */}
        <div className="product-farmer-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>{product.farmer?.name || 'Local Farmer'} • {product.farmer?.location || 'Direct Farm'}</span>
        </div>

        {/* Name */}
        <h3 className="product-title">{product.name}</h3>

        {/* Short description */}
        <p className="product-desc">{product.description}</p>

        {/* Rating and Harvest detail */}
        <div className="product-rating-row">
          <span className="rating-stars" aria-label={`${product.rating || 5} out of 5 stars`}>
            ★ ★ ★ ★ ★
          </span>
          <span>({product.reviewsCount || 1})</span>
          <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: 600 }}>
            {product.farmer?.harvestDate || 'Fresh harvest'}
          </span>
        </div>

        {/* Footer with Price and Add to Cart Button */}
        <div className="product-footer-row">
          <div className="product-price-wrap">
            <div>
              <span className="current-price">₹{product.price}</span>
              <span className="price-unit"> / {product.unit}</span>
            </div>
            {product.originalPrice && (
              <span className="original-price">₹{product.originalPrice}</span>
            )}
          </div>

          <button
            type="button"
            className={`btn-add-cart ${isAddedRecently ? 'added' : ''}`}
            disabled={isOutOfStock}
            onClick={handleAdd}
            aria-label={isOutOfStock ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAddedRecently ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Added!</span>
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
