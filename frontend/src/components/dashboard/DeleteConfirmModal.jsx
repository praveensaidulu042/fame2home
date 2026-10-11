import React from 'react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  product
}) {
  if (!isOpen || !product) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div
        className="modal-container"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="delete-dialog-title" style={{ color: '#C62828', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🗑️</span> Confirm Deletion
          </h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cancel deletion"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-dialog-content">
            <div className="delete-dialog-icon">⚠️</div>
            <h4 className="delete-dialog-title">Delete "{product.name}"?</h4>
            <p className="delete-dialog-desc" id="delete-dialog-desc">
              Are you sure you want to remove this item from your farmer inventory? 
              This will remove <strong>{product.name} (₹{product.price} / {product.unit})</strong> from the direct marketplace.
            </p>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            id="cancel-delete-btn"
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: '#C62828', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(198, 40, 40, 0.25)' }}
            onClick={() => onConfirm(product.id)}
            id="confirm-delete-btn"
          >
            Yes, Delete Produce
          </button>
        </div>
      </div>
    </div>
  );
}
