import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import BenefitsSection from './components/BenefitsSection';
import AboutSection from './components/AboutSection';
import Footer from './components/Footer';
import CartModal from './components/CartModal';
import FarmerDashboard from './components/dashboard/FarmerDashboard';
import ApiStatusBanner from './components/ApiStatusBanner';
import AuthModal from './components/AuthModal';
import { SAMPLE_PRODUCTS } from './data/products';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  checkBackendHealth,
  fetchCurrentUser,
  getStoredUser,
  clearAuthSession
} from './services/api';

export default function App() {
  // Products State (initialized with sample products for instant zero-latency render)
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);

  // Backend / Database Connection States (Task 3)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Active View State: 'home' | 'dashboard'
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'home';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState('customer');

  // Verify auth session on mount with backend
  useEffect(() => {
    fetchCurrentUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  // State for Toast Notification
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  }, []);

  // Fetch products from Express & Neon Backend
  const loadProduceData = useCallback(async (isManualRetry = false) => {
    if (isManualRetry) {
      setIsRetrying(true);
    } else {
      setIsLoadingProducts(true);
    }
    setApiError(null);

    try {
      const health = await checkBackendHealth();

      if (!health.online) {
        // Backend server is not running
        setBackendStatus({
          type: 'offline',
          message: `Backend server unreachable (${health.testedUrl || 'API offline'}). Operating in local demo mode.`
        });
        return;
      }

      if (!health.dbConfigured || !health.dbConnected) {
        // Server running, but DATABASE_URL is pending setup in backend/.env
        setBackendStatus({
          type: 'db_pending',
          message: 'DATABASE_URL is not configured in backend/.env. Running with local produce until Neon connection is set.'
        });
        return;
      }

      // Backend & Neon DB are online!
      const liveProduce = await fetchProducts();
      setProducts(liveProduce);
      setBackendStatus({
        type: 'connected',
        message: `Synced with Neon PostgreSQL (${liveProduce.length} produce item${liveProduce.length === 1 ? '' : 's'}).`
      });

      if (isManualRetry) {
        showToast('✓ Connected to Neon PostgreSQL database!');
      }
    } catch (err) {
      console.warn('Backend API connection note:', err.message);
      setApiError(err.message);
      setBackendStatus({
        type: 'db_pending',
        message: err.message || 'Database error occurred. Operating with fallback catalog.'
      });
    } finally {
      setIsLoadingProducts(false);
      setIsRetrying(false);
    }
  }, [showToast]);

  // Load products on initial mount
  useEffect(() => {
    loadProduceData();
  }, [loadProduceData]);

  // Keep Hash synced for easy bookmarking and browser navigation
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (window.location.hash === '#top' || window.location.hash === '' || window.location.hash === '#home') {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSwitchView = (view) => {
    setCurrentView(view);
    if (view === 'dashboard') {
      window.location.hash = '#dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '#top';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auth Handlers
  const handleOpenAuthModal = (defaultRole = 'customer') => {
    setAuthDefaultRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user, message) => {
    setCurrentUser(user);
    showToast(message || `Welcome, ${user.name}!`);
    if (user.role === 'farmer' && currentView === 'home') {
      handleSwitchView('dashboard');
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    showToast('You have been logged out.');
  };

  // State for Cart
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // State for Search and Category Filtering (Homepage)
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Total quantity of items in the cart
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Handler to Add a Product to Cart
  const handleAddToCart = (product) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === product.id);
      if (existing) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });

    showToast(`✓ Added ${product.name} to cart! (₹${product.price})`);
  };

  // Handler to remove an individual item from cart
  const handleRemoveFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // Handler to clear all items
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Farmer CRUD Handlers (Synchronized with Backend API when online)
  const handleAddProduct = async (newProduct) => {
    // If connected to Neon DB, sync with backend
    if (backendStatus?.type === 'connected') {
      try {
        const created = await createProduct(newProduct);
        setProducts((prev) => [created, ...prev]);
        showToast(`🌱 Listed "${created.name}" to Neon PostgreSQL!`);
        return;
      } catch (err) {
        console.warn('POST /api/products failed, falling back to local:', err.message);
        showToast(`⚠️ Saved locally (API notice: ${err.message})`);
      }
    }

    // Local / Offline fallback
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`🌱 Listed "${newProduct.name}" to farm marketplace!`);
  };

  const handleEditProduct = async (updatedProduct) => {
    if (backendStatus?.type === 'connected') {
      try {
        const updated = await updateProduct(updatedProduct.id, updatedProduct);
        setProducts((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        showToast(`✏️ Updated "${updated.name}" in Neon PostgreSQL!`);
        return;
      } catch (err) {
        console.warn('PUT /api/products/:id failed, falling back to local:', err.message);
        showToast(`⚠️ Updated locally (API notice: ${err.message})`);
      }
    }

    // Local / Offline fallback
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
    showToast(`✏️ Updated "${updatedProduct.name}" details successfully!`);
  };

  const handleDeleteProduct = async (productId) => {
    const targetProduct = products.find((p) => p.id === productId);
    const prodName = targetProduct ? targetProduct.name : 'Produce';

    if (backendStatus?.type === 'connected') {
      try {
        await deleteProduct(productId);
        setProducts((prev) => prev.filter((item) => item.id !== productId));
        setCartItems((prev) => prev.filter((item) => item.id !== productId));
        showToast(`🗑️ Removed "${prodName}" from Neon PostgreSQL.`);
        return;
      } catch (err) {
        console.warn('DELETE /api/products/:id failed, falling back to local:', err.message);
        showToast(`⚠️ Removed locally (API notice: ${err.message})`);
      }
    }

    // Local / Offline fallback
    setProducts((prev) => prev.filter((item) => item.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
    showToast(`🗑️ Removed "${prodName}" from inventory.`);
  };

  // Filter products for the Homepage marketplace based on search term and category
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === 'All' || product.category === activeCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.farmer?.name?.toLowerCase().includes(query) ||
        product.farmer?.location?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, activeCategory]);

  // Smooth scroll handler for Homepage navigation
  const handleNavigate = (sectionId) => {
    if (currentView !== 'home') {
      handleSwitchView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="app-wrapper">
      {/* 1. Header Navigation Bar */}
      <Navbar
        currentView={currentView}
        onSwitchView={handleSwitchView}
        cartCount={cartCount}
        onNavigate={handleNavigate}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      {/* 2. Backend & Database Status Notice Banner (Task 3) */}
      <ApiStatusBanner
        status={backendStatus}
        onRetry={() => loadProduceData(true)}
        isRetrying={isRetrying}
      />

      <main>
        {currentView === 'dashboard' ? (
          /* ==================================================
             FARMER DASHBOARD VIEW (Task 2 & 3 synced)
             ================================================== */
          <FarmerDashboard
            products={products}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onNavigateHome={() => handleSwitchView('home')}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
          />
        ) : (
          /* ==================================================
             CUSTOMER MARKETPLACE HOMEPAGE VIEW (Task 1 & 3 synced)
             ================================================== */
          <>
            {/* 3. Hero Section */}
            <Hero
              onShopNow={() => {
                const section = document.getElementById('products');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* 4. Marketplace Products Section */}
            <section className="products-section" id="products" aria-label="Farm Fresh Produce Catalog">
              <div className="container">
                <div className="section-header">
                  <span className="section-tag">Direct Harvest Catalog</span>
                  <h2 className="section-title">Farm Fresh Produce</h2>
                  <p className="section-subtitle">
                    Freshly harvested vegetables and fruits from verified local farms. 
                    Priced fairly in Indian Rupees without broker markups.
                  </p>
                </div>

                {/* Search and Filters */}
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  totalResults={filteredProducts.length}
                />

                {/* Product Cards Grid with Loading Skeletons & Empty States (Task 3) */}
                <ProductList
                  products={filteredProducts}
                  isLoading={isLoadingProducts}
                  error={apiError}
                  onRetry={() => loadProduceData(true)}
                  onAddToCart={handleAddToCart}
                  onResetSearch={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                />
              </div>
            </section>

            {/* 5. Benefits Section (Farmers and Customers) */}
            <BenefitsSection />

            {/* 6. About Us Mission Section */}
            <AboutSection />
          </>
        )}
      </main>

      {/* 7. Footer */}
      <Footer onNavigate={handleNavigate} onSwitchView={handleSwitchView} />

      {/* 8. Interactive Cart Drawer / Modal with Direct Farm Checkout */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onOrderPlaced={(order) => {
          setCartItems([]);
          showToast(`🎉 Order ${order.id} placed! Harvest scheduled for direct delivery.`);
        }}
      />

      {/* 9. Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        defaultRole={authDefaultRole}
      />

      {/* 10. Floating Toast Notification */}
      {toastMessage && (
        <div className="toast-notification" role="status" aria-live="polite">
          <span style={{ fontSize: '1.2rem' }}>🌿</span>
          <span style={{ fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
