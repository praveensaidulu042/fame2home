import React from 'react';

export default function Footer({ onNavigate, onSwitchView }) {
  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer-wrap" id="contact" aria-label="Site Footer">
      <div className="container">
        <div className="footer-top">
          {/* Column 1: Brand Info */}
          <div className="footer-brand">
            <div className="footer-logo-title">
              <div className="footer-logo-icon" aria-hidden="true">🌱</div>
              <span>Farm2Home</span>
            </div>
            <p>
              Direct farmer-to-consumer digital marketplace. Empowering Indian farmers with fair trade prices 
              while delivering chemical-free harvest freshness to urban homes.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span className="badge badge-green" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#81C784' }}>
                College Project 2026
              </span>
              <span className="badge badge-green" style={{ background: 'rgba(76, 175, 80, 0.2)', color: '#81C784' }}>
                100% Direct Trade
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#top" onClick={(e) => handleLinkClick(e, 'top')}>Home</a>
              </li>
              <li>
                <a href="#products" onClick={(e) => handleLinkClick(e, 'products')}>Fresh Products</a>
              </li>
              <li>
                <a href="#benefits" onClick={(e) => handleLinkClick(e, 'benefits')}>Why Us (Benefits)</a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleLinkClick(e, 'about')}>About Our Story</a>
              </li>
              <li>
                <a
                  href="#dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onSwitchView) onSwitchView('dashboard');
                  }}
                  style={{ color: '#81C784', fontWeight: 600 }}
                >
                  🚜 Farmer Dashboard (Portal)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Fresh Categories */}
          <div>
            <h4 className="footer-title">Produce Categories</h4>
            <ul className="footer-links">
              <li><a href="#products" onClick={(e) => handleLinkClick(e, 'products')}>Farm Vegetables</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, 'products')}>Seasonal Fruits</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, 'products')}>Fresh Leafy Greens</a></li>
              <li><a href="#products" onClick={(e) => handleLinkClick(e, 'products')}>Organic Pulses</a></li>
              <li><a href="#benefits" onClick={(e) => handleLinkClick(e, 'benefits')}>Farmer Producer Groups</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h4 className="footer-title">Contact & Hub</h4>
            <ul className="footer-contact-list">
              <li className="contact-row">
                <span className="contact-icon" aria-hidden="true">📍</span>
                <span>Kisan Bhavan, Agritech Innovation Hub, Pune - 411005, Maharashtra, India</span>
              </li>
              <li className="contact-row">
                <span className="contact-icon" aria-hidden="true">📞</span>
                <span>+91 98765 43210 (Toll-Free Kisan Help)</span>
              </li>
              <li className="contact-row">
                <span className="contact-icon" aria-hidden="true">✉️</span>
                <span>support@farm2home.in</span>
              </li>
              <li className="contact-row">
                <span className="contact-icon" aria-hidden="true">⏰</span>
                <span>Deliveries: Daily 6:00 AM – 1:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Farm2Home Platform. Built with modern React & Vite for sustainable agriculture.</p>
          <div className="footer-bottom-links">
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Terms of Service page'); }}>Terms of Service</a>
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Privacy Policy page'); }}>Privacy Policy</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); alert('FAQ: How we verify our farmers'); }}>FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
