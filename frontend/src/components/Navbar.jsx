import React, { useState } from 'react';

export default function Navbar({
  currentView = 'home',
  onSwitchView,
  cartCount,
  onNavigate,
  onOpenCart,
  currentUser = null,
  onOpenAuthModal,
  onLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (currentView !== 'home') {
      onSwitchView('home');
      setTimeout(() => {
        if (onNavigate) {
          onNavigate(sectionId);
        } else {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTogglePortal = () => {
    setMobileMenuOpen(false);
    onSwitchView(currentView === 'dashboard' ? 'home' : 'dashboard');
  };

  return (
    <header className="navbar-container" id="top">
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <a
          href="#top"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            if (currentView !== 'home') onSwitchView('home');
            else handleLinkClick(e, 'top');
          }}
          title="Farm2Home Homepage"
        >
          <div className="logo-icon-wrap" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 4 13C4 8.5 8 3 12 3c4 0 8 5.5 8 10a7 7 0 0 1-7 7Z"/>
              <path d="M12 21v-8"/>
              <path d="M8 13c1.5-1 3.5-1 4 1"/>
            </svg>
          </div>
          <div>
            <span className="logo-text">Farm<span>2</span>Home</span>
            <span className="logo-tagline">
              {currentView === 'dashboard' ? 'Farmer Producer Portal' : 'Direct Farm Produce'}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a
                href="#top"
                className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
                onClick={(e) => handleLinkClick(e, 'top')}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#products"
                className="nav-link"
                onClick={(e) => handleLinkClick(e, 'products')}
              >
                Products
              </a>
            </li>
            <li>
              <a
                href="#benefits"
                className="nav-link"
                onClick={(e) => handleLinkClick(e, 'benefits')}
              >
                Why Us
              </a>
            </li>
            <li>
              <a
                href="#about"
                className="nav-link"
                onClick={(e) => handleLinkClick(e, 'about')}
              >
                About Us
              </a>
            </li>
            <li>
              <button
                type="button"
                className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => onSwitchView('dashboard')}
                id="nav-dashboard-link"
              >
                🚜 Farmer Dashboard
              </button>
            </li>
          </ul>
        </nav>

        {/* Nav Actions (Portal Toggle, Cart & Login) */}
        <div className="nav-actions">
          {/* Dashboard Switch Button */}
          {currentView === 'home' ? (
            <button
              type="button"
              className="btn btn-outline-green"
              id="switch-to-dashboard-btn"
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
              onClick={() => onSwitchView('dashboard')}
            >
              🚜 Farmer Portal
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              id="switch-to-home-btn"
              style={{ padding: '7px 16px', fontSize: '0.84rem' }}
              onClick={() => onSwitchView('home')}
            >
              🏪 Marketplace Store
            </button>
          )}

          {/* Cart Trigger */}
          <button
            type="button"
            className="cart-button"
            onClick={onOpenCart}
            aria-label={`Shopping cart with ${cartCount} items`}
            title="View Cart"
            id="nav-cart-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge" id="cart-item-count">
                {cartCount}
              </span>
            )}
          </button>

          {/* Login or User Profile Pill */}
          {currentUser ? (
            <div
              className="user-profile-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '4px 6px 4px 10px',
                borderRadius: '30px',
                fontSize: '0.85rem'
              }}
            >
              <span style={{ fontSize: '1rem' }}>
                {currentUser.role === 'farmer' ? '🚜' : '👤'}
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: '#15803d',
                  maxWidth: '110px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={currentUser.name}
              >
                {currentUser.name.split(' ')[0]}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: currentUser.role === 'farmer' ? '#dcfce7' : '#e0e7ff',
                  color: currentUser.role === 'farmer' ? '#166534' : '#3730a3',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 800
                }}
              >
                {currentUser.role}
              </span>
              <button
                type="button"
                onClick={onLogout}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#4b5563',
                  cursor: 'pointer',
                  marginLeft: '2px',
                  transition: 'all 0.2s'
                }}
                title="Sign out of account"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-login"
              id="nav-login-btn"
              onClick={() => onOpenAuthModal && onOpenAuthModal('customer')}
            >
              Sign In
            </button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="mobile-toggle"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="container">
          <ul className="mobile-menu-links">
            <li>
              <a href="#top" className="mobile-menu-link" onClick={(e) => handleLinkClick(e, 'top')}>
                Home
              </a>
            </li>
            <li>
              <a href="#products" className="mobile-menu-link" onClick={(e) => handleLinkClick(e, 'products')}>
                Products
              </a>
            </li>
            <li>
              <a href="#benefits" className="mobile-menu-link" onClick={(e) => handleLinkClick(e, 'benefits')}>
                Why Us (Benefits)
              </a>
            </li>
            <li>
              <a href="#about" className="mobile-menu-link" onClick={(e) => handleLinkClick(e, 'about')}>
                About Us
              </a>
            </li>
            <li>
              <button
                type="button"
                className="mobile-menu-link"
                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--color-primary)' }}
                onClick={handleTogglePortal}
              >
                {currentView === 'dashboard' ? '🏪 Back to Customer Marketplace' : '🚜 Open Farmer Dashboard'}
              </button>
            </li>
          </ul>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleTogglePortal}
            >
              {currentView === 'dashboard' ? 'Return to Marketplace' : 'Go to Farmer Dashboard'}
            </button>

            {/* Mobile Auth Button */}
            {currentUser ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  borderRadius: '10px',
                  border: '1px solid #bbf7d0'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#166534' }}>
                    {currentUser.role === 'farmer' ? '🚜' : '👤'} {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textTransform: 'capitalize' }}>
                    {currentUser.role} Account
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-outline-green"
                style={{ width: '100%' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal && onOpenAuthModal('customer');
                }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
