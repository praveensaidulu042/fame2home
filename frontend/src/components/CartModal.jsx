import React, { useState, useEffect } from 'react';
import { createOrder } from '../services/api';

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart,
  currentUser = null,
  onOrderPlaced
}) {
  // Step state: 'cart' | 'checkout' | 'confirmed'
  const [step, setStep] = useState('cart');

  // Checkout Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Nashik');
  const [pincode, setPincode] = useState('422001');
  const [deliverySlot, setDeliverySlot] = useState('Morning Harvest (7:00 AM - 10:00 AM)');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'UPI' | 'CARD'

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Pre-fill user data when user is logged in
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name || '');
      if (!customerEmail) setCustomerEmail(currentUser.email || '');
      if (!customerPhone && currentUser.phone) setCustomerPhone(currentUser.phone);
      if (!deliveryAddress && currentUser.location) setDeliveryAddress(currentUser.location);
    }
  }, [currentUser, isOpen]);

  // Reset step when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        if (step === 'confirmed') {
          setStep('cart');
          setConfirmedOrder(null);
        }
      }, 300);
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = 0; // Free direct farm delivery
  const grandTotal = totalAmount + deliveryFee;

  const handleProceedToCheckout = () => {
    setCheckoutError('');
    setStep('checkout');
  };

  const handleBackToCart = () => {
    setCheckoutError('');
    setStep('cart');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setCheckoutError('');

    if (!customerName.trim()) {
      setCheckoutError('Please enter your full name for delivery.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setCheckoutError('Please enter a valid contact phone number.');
      return;
    }
    if (!deliveryAddress.trim()) {
      setCheckoutError('Please provide your complete delivery street address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        userId: currentUser?.id || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || currentUser?.email || '',
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        deliverySlot,
        paymentMethod,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || '1 kg',
          farmerName: item.farmer?.name || 'Local Farmer',
          image: item.image
        })),
        subtotal: totalAmount,
        deliveryFee,
        totalAmount: grandTotal
      };

      const placedOrder = await createOrder(orderPayload);
      setConfirmedOrder(placedOrder);
      setStep('confirmed');

      if (onOrderPlaced) {
        onOrderPlaced(placedOrder);
      }
    } catch (err) {
      setCheckoutError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueShopping = () => {
    onClose();
    setTimeout(() => {
      setStep('cart');
      setConfirmedOrder(null);
    }, 300);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 28, 18, 0.65)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 35px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          padding: '26px 24px',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================
            HEADER
           ========================================================= */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step === 'checkout' && (
              <button
                type="button"
                onClick={handleBackToCart}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: 'var(--color-primary)',
                  padding: '4px 8px 4px 0'
                }}
                title="Back to Cart"
              >
                ←
              </button>
            )}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                {step === 'cart' && 'Your Fresh Cart'}
                {step === 'checkout' && 'Direct Farm Checkout'}
                {step === 'confirmed' && '🎉 Order Confirmed!'}
              </h3>
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                {step === 'cart' && `${totalCount} ${totalCount === 1 ? 'produce item' : 'produce items'} selected`}
                {step === 'checkout' && 'Farm-to-Door Direct Delivery'}
                {step === 'confirmed' && 'Harvest Scheduled with Farmer'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F0F4F1',
              border: 'none',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              cursor: 'pointer',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        {/* =========================================================
            STEP 1: CART VIEW
           ========================================================= */}
        {step === 'cart' && (
          <>
            <div style={{ flex: 1, padding: '18px 0', overflowY: 'auto' }}>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '3.2rem', marginBottom: '14px' }}>🛒</div>
                  <h4 style={{ color: 'var(--color-text-main)', marginBottom: '6px', fontSize: '1.1rem' }}>
                    Your cart is empty
                  </h4>
                  <p style={{ fontSize: '0.88rem' }}>
                    Browse our morning harvests and add fresh vegetables & fruits directly from local farmers!
                  </p>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0, margin: 0 }}>
                  {cartItems.map((item) => (
                    <li
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        backgroundColor: '#F9FBF9',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text-main)', margin: '0 0 2px' }}>
                          {item.name}
                        </h5>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          ₹{item.price} × {item.quantity} ({item.unit || '1 kg'})
                        </div>
                        {item.farmer?.name && (
                          <div style={{ fontSize: '0.72rem', color: '#166534', fontWeight: 600, marginTop: '2px' }}>
                            🚜 {item.farmer.name}
                          </div>
                        )}
                        <div style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '0.95rem', marginTop: '2px' }}>
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C62828',
                          cursor: 'pointer',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          padding: '4px 8px'
                        }}
                        title="Remove item"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {cartItems.length > 0 && (
              <div style={{ paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', color: '#4b5563' }}>
                  <span>Items Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.88rem', color: '#166534' }}>
                  <span>Direct Farm Delivery:</span>
                  <span style={{ fontWeight: 700 }}>FREE (₹0)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.15rem', fontWeight: 800 }}>
                  <span>Total Amount:</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal}</span>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  id="btn-proceed-checkout"
                  style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={handleProceedToCheckout}
                >
                  <span>Proceed to Direct Checkout</span>
                  <span>→</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
                  onClick={onClearCart}
                >
                  Clear Cart
                </button>
              </div>
            )}
          </>
        )}

        {/* =========================================================
            STEP 2: CHECKOUT FORM VIEW
           ========================================================= */}
        {step === 'checkout' && (
          <form onSubmit={handleFormSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0', overflowY: 'auto' }}>
            {/* User Greeting or Quick Login Callout */}
            {currentUser ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 14px', fontSize: '0.82rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤</span>
                <span>Ordering as <strong>{currentUser.name}</strong> ({currentUser.email})</span>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', fontSize: '0.8rem', color: '#64748b' }}>
                ⚡ Ordering as Guest. Your order will be confirmed directly with local farmers.
              </div>
            )}

            {/* Error Message */}
            {checkoutError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 12px', borderRadius: '8px', fontSize: '0.84rem' }}>
                ⚠️ {checkoutError}
              </div>
            )}

            {/* Customer Contact */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@mail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                Delivery Address (Flat / House / Street) *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Flat 402, Green Meadows, Gangapur Road"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
                  Pincode *
                </label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.88rem', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Delivery Slot */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Harvest Delivery Slot:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setDeliverySlot('Morning Harvest (7:00 AM - 10:00 AM)')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: deliverySlot.includes('Morning') ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    backgroundColor: deliverySlot.includes('Morning') ? '#f0fdf4' : '#fafafa',
                    color: deliverySlot.includes('Morning') ? '#166534' : '#4b5563',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🌅 Morning (7am-10am)
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 400 }}>Recommended fresh</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliverySlot('Evening Fresh (5:00 PM - 8:00 PM)')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: deliverySlot.includes('Evening') ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    backgroundColor: deliverySlot.includes('Evening') ? '#f0fdf4' : '#fafafa',
                    color: deliverySlot.includes('Evening') ? '#166534' : '#4b5563',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🌇 Evening (5pm-8pm)
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 400 }}>After work slot</div>
                </button>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                Payment Method:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: paymentMethod === 'COD' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    backgroundColor: paymentMethod === 'COD' ? '#f0fdf4' : '#fafafa',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>💵 Cash on Delivery (COD)</span>
                    <span style={{ display: 'block', fontSize: '0.73rem', color: '#6b7280' }}>Inspect produce fresh at your doorstep before paying</span>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: paymentMethod === 'UPI' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    backgroundColor: paymentMethod === 'UPI' ? '#f0fdf4' : '#fafafa',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>📱 UPI / QR Code (Google Pay, PhonePe, Paytm)</span>
                    <span style={{ display: 'block', fontSize: '0.73rem', color: '#6b7280' }}>Pay directly with UPI on delivery or harvest dispatch</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Total and Submit Button */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '1.15rem', fontWeight: 800 }}>
                <span>Final Order Amount:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{grandTotal}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                id="btn-confirm-order"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        border: '2px solid #ffffff',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }}
                    />
                    <span>Connecting Farmers...</span>
                  </>
                ) : (
                  <span>Place Direct Order (₹{grandTotal})</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* =========================================================
            STEP 3: ORDER CONFIRMED CELEBRATION VIEW
           ========================================================= */}
        {step === 'confirmed' && confirmedOrder && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px 10px', overflowY: 'auto' }}>
            <div
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: '#dcfce7',
                border: '3px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.4rem',
                marginBottom: '16px'
              }}
            >
              🌿
            </div>

            <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, marginBottom: '8px' }}>
              ORDER #{confirmedOrder.id}
            </span>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-main)', margin: '0 0 8px' }}>
              Harvest Order Confirmed!
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.5, marginBottom: '20px' }}>
              Thank you, <strong>{confirmedOrder.customerName}</strong>! Our partner farmers have received your direct order and will hand-pick your fresh produce.
            </p>

            {/* Order Details Card */}
            <div
              style={{
                width: '100%',
                backgroundColor: '#F9FBF9',
                border: '1px solid var(--color-border)',
                borderRadius: '14px',
                padding: '16px',
                textAlign: 'left',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6b7280' }}>Delivery Slot:</span>
                <strong style={{ color: '#166534' }}>{confirmedOrder.deliverySlot}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6b7280' }}>Payment Mode:</span>
                <strong>{confirmedOrder.paymentMethod === 'COD' ? 'Cash on Delivery' : confirmedOrder.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem' }}>
                <span style={{ color: '#6b7280' }}>Deliver To:</span>
                <span style={{ maxWidth: '60%', textAlign: 'right', fontWeight: 600 }}>{confirmedOrder.deliveryAddress}, {confirmedOrder.city}</span>
              </div>
              <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '0.98rem', fontWeight: 800 }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--color-primary)' }}>₹{confirmedOrder.totalAmount}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              onClick={handleContinueShopping}
            >
              Continue Shopping Fresh Produce
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
