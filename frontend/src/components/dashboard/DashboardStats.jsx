import React from 'react';

export default function DashboardStats({ products }) {
  // Calculations
  const totalProducts = products.length;
  const inStockProducts = products.filter((p) => Number(p.stock) > 0).length;
  const totalStockKg = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  
  // Sample demonstration sales amount
  const demoSalesAmount = 28450;

  return (
    <div className="stats-grid" aria-label="Dashboard summary metrics">
      {/* 1. Total Products Listed */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Listed</span>
          <div className="stat-icon-wrap icon-bg-green" aria-hidden="true">
            🌱
          </div>
        </div>
        <div className="stat-card-value">{totalProducts}</div>
        <p className="stat-card-note">
          <span>Active produce items in catalog</span>
        </p>
      </div>

      {/* 2. Products In Stock */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Currently In Stock</span>
          <div className="stat-icon-wrap icon-bg-blue" aria-hidden="true">
            📦
          </div>
        </div>
        <div className="stat-card-value">{inStockProducts}</div>
        <p className="stat-card-note">
          <span>{totalProducts - inStockProducts} out-of-stock items</span>
        </p>
      </div>

      {/* 3. Total Available Stock */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Total Stock Quantity</span>
          <div className="stat-icon-wrap icon-bg-amber" aria-hidden="true">
            ⚖️
          </div>
        </div>
        <div className="stat-card-value">{totalStockKg} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span></div>
        <p className="stat-card-note">
          <span>Total farm-gate weight available</span>
        </p>
      </div>

      {/* 4. Demonstration Sales Amount */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-card-label">Demonstration Sales</span>
          <div className="stat-icon-wrap icon-bg-purple" aria-hidden="true">
            💰
          </div>
        </div>
        <div className="stat-card-value">₹{demoSalesAmount.toLocaleString('en-IN')}</div>
        <p className="stat-card-note" style={{ color: '#E65100', fontWeight: 600 }}>
          <span>* Sample Demonstration Data</span>
        </p>
      </div>
    </div>
  );
}
