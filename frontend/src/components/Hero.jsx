import React from 'react';

export default function Hero({ onShopNow }) {
  const handleShopNowClick = (e) => {
    e.preventDefault();
    if (onShopNow) {
      onShopNow();
    } else {
      const section = document.getElementById('products');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="hero-section" aria-label="Introduction">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot"></span>
              <span>100% Direct Farmer-to-Consumer Model</span>
            </div>

            <h1 className="hero-title">
              Fresh From Farms, <br />
              <span className="hero-title-highlight">Direct to Your Home</span>
            </h1>

            <p className="hero-subtitle">
              Buy fresh, naturally grown vegetables and seasonal fruits directly from verified local farmers. 
              Zero middlemen, fair farm-gate earnings for our growers, and peak harvest freshness delivered right to your doorstep.
            </p>

            <div className="hero-actions">
              <a
                href="#products"
                className="btn btn-primary hero-btn-main"
                id="hero-shop-now-btn"
                onClick={handleShopNowClick}
              >
                <span>Shop Now</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </a>

              <a
                href="#benefits"
                className="btn btn-secondary hero-btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Why Farm2Home?
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="hero-trust-metrics">
              <div className="trust-item">
                <span className="trust-value">1,200+</span>
                <span className="trust-label">Happy Families</span>
              </div>
              <div className="trust-item">
                <span className="trust-value">85+</span>
                <span className="trust-label">Partner Farmers</span>
              </div>
              <div className="trust-item">
                <span className="trust-value">12 Hrs</span>
                <span className="trust-label">Harvest to Kitchen</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Hero Banner with Trust Badges */}
          <div className="hero-visual-card">
            <div className="hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&auto=format&fit=crop&q=80"
                alt="Fresh farm harvest basket filled with vegetables and fruits"
                loading="eager"
                onError={(e) => {
                  // Fallback to high quality alternate if blocked
                  e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80";
                }}
              />
            </div>

            {/* Floating Trust Badge 1 */}
            <div className="floating-badge badge-top-left">
              <div className="floating-badge-icon">🌿</div>
              <div>
                <p className="floating-badge-title">100% Pesticide Tested</p>
                <p className="floating-badge-sub">Naturally grown produce</p>
              </div>
            </div>

            {/* Floating Trust Badge 2 */}
            <div className="floating-badge badge-bottom-right">
              <div className="floating-badge-icon">🚜</div>
              <div>
                <p className="floating-badge-title">Direct from Nashik & Pune</p>
                <p className="floating-badge-sub">Fair price to farmers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
