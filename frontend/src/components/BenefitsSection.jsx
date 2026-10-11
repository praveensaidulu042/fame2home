import React from 'react';

export default function BenefitsSection() {
  return (
    <section className="benefits-section" id="benefits" aria-label="Benefits for Farmers and Customers">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-tag">Direct Value Model</span>
          <h2 className="section-title">Why Farm2Home Changes Everything</h2>
          <p className="section-subtitle">
            By removing the multi-tier middlemen chain, we create a win-win agricultural ecosystem 
            where farmers earn fair incomes and families get real harvest nutrition.
          </p>
        </div>

        {/* Benefits Comparison Grid */}
        <div className="benefits-columns">
          {/* Card 1: Benefits for Farmers */}
          <div className="benefit-group-card">
            <div className="benefit-group-header">
              <div className="benefit-group-icon icon-farmer" aria-hidden="true">
                🚜
              </div>
              <div>
                <h3 className="benefit-group-title">Empowering Our Farmers</h3>
                <p className="benefit-group-desc">Dignity, better pricing, and reliable market access</p>
              </div>
            </div>

            <ul className="benefit-items-list">
              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>40% to 60% Higher Realization</h4>
                  <p>Zero commissions to mandi brokers or middlemen agents means hard-working farmers retain true market profit.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>Guaranteed Instant Payouts</h4>
                  <p>Direct bank transfers without months of delayed credit or exploitative lending cycles.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>Reduced Post-Harvest Wastage</h4>
                  <p>Demand-matched pre-orders ensure produce goes directly from harvest crates to customer bags without rotting in transit hubs.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>Direct Brand & Customer Trust</h4>
                  <p>Farmers are recognized by name, building lasting pride and recurring demand for their sustainable crops.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Card 2: Benefits for Customers */}
          <div className="benefit-group-card">
            <div className="benefit-group-header">
              <div className="benefit-group-icon icon-customer" aria-hidden="true">
                🥗
              </div>
              <div>
                <h3 className="benefit-group-title">Delighting Our Customers</h3>
                <p className="benefit-group-desc">Unmatched freshness, honest prices, and full traceability</p>
              </div>
            </div>

            <ul className="benefit-items-list">
              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>Harvest-Day Freshness</h4>
                  <p>Enjoy crisp greens and juicy seasonal fruits harvested within 12-24 hours rather than stale supermarket cold storage.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>20% to 30% Savings</h4>
                  <p>Cut out supermarket overheads, retail distributor layers, and cold-store markups for honest everyday prices.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>100% Origin Traceability</h4>
                  <p>Every product card displays the grower's name, village, harvest date, and pesticide-free cultivation practices.</p>
                </div>
              </li>

              <li className="benefit-item">
                <span className="benefit-item-icon">✓</span>
                <div className="benefit-item-text">
                  <h4>Direct Social Impact</h4>
                  <p>Every rupee you spend directly feeds and empowers an Indian rural agricultural household.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Impact Highlight Banner */}
        <div className="direct-impact-banner">
          <div className="impact-text">
            <h3>Are you a grower or farmer community?</h3>
            <p>Join over 85+ verified local farmers who supply directly to thousands of happy families every morning.</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => alert('Farmer registration portal will be enabled in Task 2!')}
          >
            Register as a Farmer
          </button>
        </div>
      </div>
    </section>
  );
}
