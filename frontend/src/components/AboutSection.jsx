import React from 'react';

export default function AboutSection() {
  return (
    <section className="about-section" id="about" aria-label="About Farm2Home">
      <div className="container">
        <div className="about-grid">
          {/* Image visual */}
          <div className="about-image-card">
            <img
              src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
              alt="Indian farmer proudly standing in a lush green agricultural field"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80";
              }}
            />
            <div className="about-badge-floating">
              <h4>Direct Farm Impact</h4>
              <p>Promoting sustainable agriculture & transparent farm economics across India.</p>
            </div>
          </div>

          {/* Text Content */}
          <div className="about-content">
            <span className="section-tag">Our Mission</span>
            <h2>Bridging the Gap Between Rural Soil and Urban Tables</h2>
            <p>
              Farm2Home was created with a clear, heartfelt conviction: fresh food shouldn't take days 
              to reach your kitchen, and the hardworking hands that harvest it shouldn't be shortchanged by 
              opaque wholesale mandi chains.
            </p>
            <p>
              We empower consumers to order straight from certified growers near Pune, Nashik, and surrounding regions. 
              With zero artificial ripening and eco-friendly packing, we bring honest nature back to urban living.
            </p>

            <div className="about-features-grid">
              <div className="about-feature-box">
                <span aria-hidden="true">🌱</span>
                <strong>Naturally Grown</strong>
                <small>No chemical ripening or preservatives</small>
              </div>

              <div className="about-feature-box">
                <span aria-hidden="true">🚚</span>
                <strong>Morning Delivery</strong>
                <small>Harvested at dawn, delivered by afternoon</small>
              </div>

              <div className="about-feature-box">
                <span aria-hidden="true">⚖️</span>
                <strong>Fair Price Pledge</strong>
                <small>Higher income to farmers, lower cost to you</small>
              </div>

              <div className="about-feature-box">
                <span aria-hidden="true">📦</span>
                <strong>Zero Waste Packaging</strong>
                <small>Recyclable paper bags & breathable jute</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
