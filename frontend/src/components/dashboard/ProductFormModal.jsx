import React, { useState, useEffect } from 'react';
import { FORM_CATEGORIES } from '../../data/products';

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null
}) {
  const isEditMode = Boolean(initialProduct);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    stock: '',
    image: '',
    farmerName: '',
    location: '',
    harvestDate: '',
    description: ''
  });

  // Validation Errors State
  const [errors, setErrors] = useState({});

  // Sync form values when initialProduct changes (Edit vs Add)
  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        category: initialProduct.category || 'Vegetables',
        price: initialProduct.price ?? '',
        stock: initialProduct.stock ?? '',
        image: initialProduct.image || '',
        farmerName: initialProduct.farmer?.name || '',
        location: initialProduct.farmer?.location || '',
        harvestDate: initialProduct.farmer?.harvestDate || '',
        description: initialProduct.description || ''
      });
    } else {
      // Default blank values for new produce
      setFormData({
        name: '',
        category: 'Vegetables',
        price: '',
        stock: '',
        image: '',
        farmerName: '',
        location: '',
        harvestDate: '',
        description: ''
      });
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  // Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation Logic
  const validate = () => {
    const newErrors = {};

    // 1. Required text fields
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a valid category.';
    }

    if (!formData.farmerName.trim()) {
      newErrors.farmerName = 'Farmer name is required.';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Village or location is required.';
    }

    if (!formData.harvestDate.trim()) {
      newErrors.harvestDate = 'Harvest date/time is required.';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a short description.';
    }

    // 2. Numeric Price Validation
    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      newErrors.price = 'Price is required.';
    } else {
      const numPrice = Number(formData.price);
      if (isNaN(numPrice) || numPrice <= 0) {
        newErrors.price = 'Price must be a valid number greater than 0.';
      }
    }

    // 3. Numeric Quantity Validation
    if (formData.stock === '' || formData.stock === null || formData.stock === undefined) {
      newErrors.stock = 'Quantity in kilograms is required.';
    } else {
      const numStock = Number(formData.stock);
      if (isNaN(numStock) || numStock < 0) {
        newErrors.stock = 'Quantity cannot be negative (0 or greater).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    // Prepare cleaned product object
    const cleanedProduct = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name: formData.name.trim(),
      category: formData.category,
      price: Math.round(Number(formData.price)),
      unit: '1 kg',
      stock: Number(formData.stock),
      image: formData.image.trim() || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
      description: formData.description.trim(),
      farmer: {
        name: formData.farmerName.trim(),
        location: formData.location.trim(),
        harvestDate: formData.harvestDate.trim(),
        distance: initialProduct?.farmer?.distance || 'Local Farm'
      },
      isOrganic: initialProduct?.isOrganic ?? true,
      rating: initialProduct?.rating || 4.9,
      reviewsCount: initialProduct?.reviewsCount || 1,
      badge: initialProduct?.badge || 'Fresh Harvest'
    };

    onSubmit(cleanedProduct);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 id="modal-title">
              {isEditMode ? '✏️ Edit Farm Produce' : '🌱 List New Farm Produce'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {isEditMode ? 'Update price, stock, and harvest details' : 'Fill in produce details to publish to the direct marketplace'}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close form modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="field-name">
                  Product Name
                </label>
                <input
                  id="field-name"
                  type="text"
                  name="name"
                  className={`form-input ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g., Organic Hybrid Tomatoes, Devgad Mangoes"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="form-error-msg">⚠️ {errors.name}</span>}
              </div>

              {/* Category & Price */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-category">
                    Produce Category
                  </label>
                  <select
                    id="field-category"
                    name="category"
                    className={`form-select ${errors.category ? 'input-error' : ''}`}
                    value={formData.category}
                    onChange={handleChange}
                  >
                    {FORM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <span className="form-error-msg">⚠️ {errors.category}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-price">
                    Price (in Indian Rupees ₹)
                  </label>
                  <input
                    id="field-price"
                    type="number"
                    name="price"
                    min="1"
                    step="1"
                    className={`form-input ${errors.price ? 'input-error' : ''}`}
                    placeholder="e.g., 40"
                    value={formData.price}
                    onChange={handleChange}
                  />
                  {errors.price && <span className="form-error-msg">⚠️ {errors.price}</span>}
                </div>
              </div>

              {/* Quantity in KG & Harvest Date */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-stock">
                    Quantity in Kilograms (kg)
                  </label>
                  <input
                    id="field-stock"
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    className={`form-input ${errors.stock ? 'input-error' : ''}`}
                    placeholder="e.g., 100"
                    value={formData.stock}
                    onChange={handleChange}
                  />
                  {errors.stock ? (
                    <span className="form-error-msg">⚠️ {errors.stock}</span>
                  ) : (
                    <span className="form-hint">Set to 0 to mark as Out of Stock</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-harvest">
                    Harvest Date / Time
                  </label>
                  <input
                    id="field-harvest"
                    type="text"
                    name="harvestDate"
                    className={`form-input ${errors.harvestDate ? 'input-error' : ''}`}
                    placeholder="e.g., Harvested Today, 6:00 AM"
                    value={formData.harvestDate}
                    onChange={handleChange}
                  />
                  {errors.harvestDate && <span className="form-error-msg">⚠️ {errors.harvestDate}</span>}
                </div>
              </div>

              {/* Farmer Name & Village/Location */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-farmer">
                    Farmer Name
                  </label>
                  <input
                    id="field-farmer"
                    type="text"
                    name="farmerName"
                    className={`form-input ${errors.farmerName ? 'input-error' : ''}`}
                    placeholder="e.g., Ramesh Patil"
                    value={formData.farmerName}
                    onChange={handleChange}
                  />
                  {errors.farmerName && <span className="form-error-msg">⚠️ {errors.farmerName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required" htmlFor="field-location">
                    Village or Location
                  </label>
                  <input
                    id="field-location"
                    type="text"
                    name="location"
                    className={`form-input ${errors.location ? 'input-error' : ''}`}
                    placeholder="e.g., Nashik, Maharashtra"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  {errors.location && <span className="form-error-msg">⚠️ {errors.location}</span>}
                </div>
              </div>

              {/* Product Image URL (Optional) */}
              <div className="form-group">
                <label className="form-label" htmlFor="field-image">
                  Product Image URL <span style={{ fontWeight: 400, color: 'var(--color-text-light)' }}>(Optional)</span>
                </label>
                <input
                  id="field-image"
                  type="url"
                  name="image"
                  className="form-input"
                  placeholder="https://images.unsplash.com/... (leave empty for auto photo)"
                  value={formData.image}
                  onChange={handleChange}
                />
                <span className="form-hint">
                  If left empty, a default fresh agricultural photograph is automatically assigned.
                </span>

                {formData.image && (
                  <div className="img-preview-box" style={{ marginTop: '6px' }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="img-preview-thumb"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                      Image URL preview loaded
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label form-label-required" htmlFor="field-desc">
                  Produce Description
                </label>
                <textarea
                  id="field-desc"
                  name="description"
                  rows="3"
                  className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                  placeholder="Describe freshness, taste, pesticide-free practices, and recommended usage..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
                {errors.description && <span className="form-error-msg">⚠️ {errors.description}</span>}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              id="submit-product-btn"
            >
              {isEditMode ? '✓ Update Produce' : '➕ Publish to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
