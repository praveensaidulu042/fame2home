import React, { useState, useMemo } from 'react';
import DashboardStats from './DashboardStats';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function FarmerDashboard({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onNavigateHome,
  currentUser = null,
  onOpenAuthModal
}) {
  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Search & Status Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'

  // Filtered Products for the table
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Stock status filter
      if (stockFilter === 'IN_STOCK' && Number(item.stock) <= 0) return false;
      if (stockFilter === 'OUT_OF_STOCK' && Number(item.stock) > 0) return false;

      // Search filter
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.farmer?.name?.toLowerCase().includes(query) ||
        item.farmer?.location?.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery, stockFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = (productData) => {
    if (editingProduct) {
      onEditProduct(productData);
    } else {
      onAddProduct(productData);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = (productId) => {
    onDeleteProduct(productId);
    setDeletingProduct(null);
  };

  return (
    <div className="dashboard-page" id="dashboard">
      <div className="container">
        {/* Navigation back and Portal Header */}
        <div className="dashboard-header">
          <div className="dashboard-nav-bar">
            <button
              type="button"
              className="btn-back-market"
              onClick={onNavigateHome}
              title="Return to customer homepage"
              id="back-to-marketplace-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back to Customer Marketplace</span>
            </button>

            {currentUser && currentUser.role === 'farmer' ? (
              <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                🚜 Verified Producer: {currentUser.name} {currentUser.location ? `• ${currentUser.location}` : ''}
              </span>
            ) : currentUser ? (
              <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                👤 Viewing as {currentUser.name} ({currentUser.role})
              </span>
            ) : (
              <button
                type="button"
                className="badge badge-green"
                onClick={() => onOpenAuthModal && onOpenAuthModal('farmer')}
                style={{ fontSize: '0.8rem', padding: '6px 14px', cursor: 'pointer', border: 'none' }}
              >
                🚜 Verified Farmer Portal • Sign In as Producer →
              </button>
            )}
          </div>

          <div className="dashboard-title-row">
            <div>
              <h1 className="dashboard-heading">Farmer Produce Dashboard</h1>
              <p className="dashboard-subheading">
                Manage your harvest inventory, direct farm prices in Indian Rupees, and available kilograms.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              id="btn-add-product"
              onClick={handleOpenAddModal}
              style={{ padding: '12px 24px', fontSize: '0.96rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Add New Produce</span>
            </button>
          </div>
        </div>

        {/* Demo Notice Banner */}
        <div className="demo-notice-banner" role="alert">
          <span className="demo-notice-icon">ℹ️</span>
          <div>
            <strong>Demonstration Mode (Task 2):</strong> Produce changes (Add, Edit, Delete) reflect immediately in the live app in-memory state. 
            Backend persistence and Neon PostgreSQL database integration will be connected in subsequent tasks.
          </div>
        </div>

        {/* 1. Dashboard Metric Summary Cards */}
        <DashboardStats products={products} />

        {/* 2. Inventory Management Panel */}
        <section className="inventory-panel" aria-label="Farmer Inventory Management">
          {/* Panel Top Title */}
          <div className="inventory-header">
            <div className="inventory-title-group">
              <h3>Listed Farm Products ({products.length})</h3>
              <p>Real-time view of your produce listed on the Farm2Home marketplace</p>
            </div>
          </div>

          {/* Search & Stock Filter Toolbar */}
          <div className="inventory-toolbar">
            <div className="inventory-search-wrap">
              <input
                id="dashboard-search-input"
                type="text"
                className="inventory-search-input"
                placeholder="Search by produce or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Filter farmer products"
              />
            </div>

            <div className="inventory-filters">
              <button
                type="button"
                className={`filter-btn ${stockFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setStockFilter('ALL')}
              >
                All ({products.length})
              </button>
              <button
                type="button"
                className={`filter-btn ${stockFilter === 'IN_STOCK' ? 'active' : ''}`}
                onClick={() => setStockFilter('IN_STOCK')}
              >
                In Stock ({products.filter((p) => Number(p.stock) > 0).length})
              </button>
              <button
                type="button"
                className={`filter-btn ${stockFilter === 'OUT_OF_STOCK' ? 'active' : ''}`}
                onClick={() => setStockFilter('OUT_OF_STOCK')}
              >
                Out of Stock ({products.filter((p) => Number(p.stock) <= 0).length})
              </button>
            </div>
          </div>

          {/* Product Listing Table (Desktop) */}
          {filteredProducts.length === 0 ? (
            <div className="empty-products" style={{ margin: '30px 24px', border: 'none' }}>
              <div className="empty-icon">🌾</div>
              <h3 className="empty-title">
                {products.length === 0
                  ? 'No farm produce listed yet'
                  : 'No products match your filter'}
              </h3>
              <p className="empty-sub">
                {products.length === 0
                  ? 'Start by listing your freshly harvested produce so customers can order directly from you.'
                  : 'Try clearing your search query or switching your stock filter tab.'}
              </p>
              {products.length === 0 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenAddModal}
                >
                  ➕ Add Your First Produce
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStockFilter('ALL');
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="inventory-table-wrap">
                <table className="inventory-table" id="farmer-products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Quantity</th>
                      <th>Stock Status</th>
                      <th>Harvest Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const isInStock = Number(product.stock) > 0;
                      return (
                        <tr key={product.id} id={`dashboard-row-${product.id}`}>
                          {/* Product Info */}
                          <td>
                            <div className="table-product-cell">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="table-product-thumb"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80';
                                }}
                              />
                              <div className="table-product-meta">
                                <h4>{product.name}</h4>
                                <span>{product.farmer?.name || 'Local Farmer'} • {product.farmer?.location || 'Nashik'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td>
                            <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td>
                            <div className="table-price-cell">
                              ₹{product.price}
                              <span className="table-price-unit"> / {product.unit || '1 kg'}</span>
                            </div>
                          </td>

                          {/* Stock Quantity */}
                          <td>
                            <strong style={{ fontSize: '0.95rem' }}>{product.stock}</strong> kg
                          </td>

                          {/* Stock Status Label */}
                          <td>
                            {isInStock ? (
                              <span className="stock-badge stock-badge-in">
                                <span className="stock-dot stock-dot-in"></span>
                                In Stock
                              </span>
                            ) : (
                              <span className="stock-badge stock-badge-out">
                                <span className="stock-dot stock-dot-out"></span>
                                Out of Stock
                              </span>
                            )}
                          </td>

                          {/* Harvest Date */}
                          <td style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                            {product.farmer?.harvestDate || 'Fresh batch'}
                          </td>

                          {/* Actions (Edit and Delete) */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="table-actions-cell" style={{ justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="btn-action btn-action-edit"
                                onClick={() => handleOpenEditModal(product)}
                                aria-label={`Edit ${product.name}`}
                                id={`edit-btn-${product.id}`}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                type="button"
                                className="btn-action btn-action-delete"
                                onClick={() => setDeletingProduct(product)}
                                aria-label={`Delete ${product.name}`}
                                id={`delete-btn-${product.id}`}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="mobile-inventory-list">
                {filteredProducts.map((product) => {
                  const isInStock = Number(product.stock) > 0;
                  return (
                    <div key={product.id} className="mobile-inventory-card">
                      <div className="mobile-card-top">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="table-product-thumb"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="mobile-card-details">
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '2px' }}>
                            {product.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {product.category} • {product.farmer?.location}
                          </span>
                        </div>
                      </div>

                      <div className="mobile-card-meta">
                        <div>
                          <strong>₹{product.price}</strong> / {product.unit || '1 kg'}
                        </div>
                        <div>
                          Stock: <strong>{product.stock} kg</strong>
                        </div>
                        <div>
                          {isInStock ? (
                            <span className="stock-badge stock-badge-in">In Stock</span>
                          ) : (
                            <span className="stock-badge stock-badge-out">Out of Stock</span>
                          )}
                        </div>
                      </div>

                      <div className="mobile-card-actions">
                        <button
                          type="button"
                          className="btn-action btn-action-edit"
                          onClick={() => handleOpenEditModal(product)}
                        >
                          ✏️ Edit Produce
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          onClick={() => setDeletingProduct(product)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* 3. Product Add / Edit Modal */}
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          initialProduct={editingProduct}
        />

        {/* 4. Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={Boolean(deletingProduct)}
          onClose={() => setDeletingProduct(null)}
          onConfirm={handleConfirmDelete}
          product={deletingProduct}
        />
      </div>
    </div>
  );
}
