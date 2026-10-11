import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, fetchDemoUsers } from '../services/api';

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  defaultRole = 'customer'
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [role, setRole] = useState(defaultRole); // 'customer' | 'farmer'

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [demoUsers, setDemoUsers] = useState([]);

  // Fetch demo accounts on mount
  useEffect(() => {
    if (isOpen) {
      fetchDemoUsers().then((users) => {
        if (users && users.length) setDemoUsers(users);
      });
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle 1-Click Demo Login
  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await loginUser({ email: demoEmail, password: demoPassword });
      onLoginSuccess(response.user, response.message || `Welcome back, ${response.user.name}!`);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const response = await loginUser({ email, password });
        onLoginSuccess(response.user, response.message || `Welcome back, ${response.user.name}!`);
        onClose();
      } else {
        const response = await registerUser({
          name,
          email,
          password,
          role,
          phone,
          location
        });
        onLoginSuccess(response.user, `Account created successfully! Welcome, ${response.user.name}!`);
        onClose();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="auth-modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(12, 28, 18, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            padding: '24px 24px 20px',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'background 0.2s'
            }}
            aria-label="Close modal"
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌱</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Farm<span style={{ color: '#86efac' }}>2</span>Home
            </span>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            {activeTab === 'login' ? 'Welcome Back!' : 'Join Farm2Home Marketplace'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#bbf7d0', opacity: 0.95 }}>
            {activeTab === 'login'
              ? 'Sign in to access your direct produce orders or manage farm crops.'
              : 'Direct from Indian farms to urban doorsteps at honest fair prices.'}
          </p>

          {/* Tab Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '4px',
              borderRadius: '10px',
              marginTop: '16px',
              gap: '4px'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'login' ? '#166534' : '#e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage('');
              }}
              style={{
                padding: '8px 12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'register' ? '#166534' : '#e2e8f0',
                transition: 'all 0.2s ease'
              }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
          {/* Quick Demo Login Bar */}
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px dashed #86efac',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '18px'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
              ⚡ 1-Click Demo Login:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin('farmer@farm2home.com', 'password123')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803d',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <span>🚜</span>
                <span>Farmer Ramesh</span>
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin('customer@farm2home.com', 'password123')}
                style={{
                  padding: '7px 10px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#15803d',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <span>🛒</span>
                <span>Customer Priya</span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.86rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Role Selector (When registering) */}
            {activeTab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                  Select Your Account Type:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: role === 'customer' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      backgroundColor: role === 'customer' ? '#f0fdf4' : '#fafafa',
                      color: role === 'customer' ? '#166534' : '#4b5563',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🛒 Customer</span>
                    <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>Buy direct farm produce</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('farmer')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: role === 'farmer' ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      backgroundColor: role === 'farmer' ? '#f0fdf4' : '#fafafa',
                      color: role === 'farmer' ? '#166534' : '#4b5563',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: '0.88rem' }}>🚜 Farmer</span>
                    <span style={{ fontSize: '0.74rem', color: '#6b7280' }}>List and sell harvests</span>
                  </button>
                </div>
              </div>
            )}

            {/* Name Field (Register only) */}
            {activeTab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'farmer' ? 'e.g. Ramesh Patil' : 'e.g. Priya Sharma'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 42px 10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.92rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    color: '#6b7280',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {/* Location & Phone Fields (Register only) */}
            {activeTab === 'register' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    {role === 'farmer' ? 'Farm Location' : 'City / Area'}
                  </label>
                  <input
                    type="text"
                    placeholder={role === 'farmer' ? 'Nashik, MH' : 'Pune, MH'}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#374151', marginBottom: '5px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '6px',
                padding: '12px 20px',
                background: isLoading
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
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
                  <span>Processing...</span>
                </>
              ) : activeTab === 'login' ? (
                <span>Sign In to Account</span>
              ) : (
                <span>Create {role === 'farmer' ? 'Farmer' : 'Customer'} Account</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
