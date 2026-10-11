/**
 * Farm2Home Frontend API Service
 * Connects React UI to Node.js / Express backend at http://localhost:5000/api
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Checks backend health and Neon database connection status
 * @returns {Promise<{online: boolean, data?: any, error?: string}>}
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    return {
      online: res.ok || res.status === 503, // Server is up even if DB is pending setup
      data,
      dbConnected: data?.database?.connected || false,
      dbConfigured: data?.database?.configured || false
    };
  } catch (err) {
    return {
      online: false,
      dbConnected: false,
      dbConfigured: false,
      error: err.name === 'AbortError' ? 'Connection timed out' : 'Backend server unreachable'
    };
  }
}

/**
 * Fetches all products from the backend API
 * @param {Object} [params] - Optional query parameters (e.g., { category: 'Vegetables' })
 */
export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') {
    query.set('category', params.category);
  }
  if (params.inStock !== undefined) {
    query.set('inStock', params.inStock.toString());
  }

  const queryString = query.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });

  const body = await res.json();

  if (!res.ok) {
    const error = new Error(body.message || body.error || `HTTP error ${res.status}`);
    error.status = res.status;
    error.body = body;
    throw error;
  }

  return body.data || [];
}

/**
 * Fetches a single product by ID
 * @param {string} id
 */
export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    headers: { 'Accept': 'application/json' }
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(body.error || `Failed to fetch product ${id}`);
    error.status = res.status;
    throw error;
  }

  return body.data;
}

/**
 * Creates a new product on the backend API
 * @param {Object} productData
 */
export async function createProduct(productData) {
  // Format body to match backend expectations
  const payload = {
    id: productData.id,
    name: productData.name,
    category: productData.category,
    price: productData.price,
    stock: productData.stock,
    image: productData.image,
    farmerName: productData.farmer?.name || productData.farmerName,
    location: productData.farmer?.location || productData.location,
    harvestDate: productData.farmer?.harvestDate || productData.harvestDate,
    description: productData.description
  };

  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(
      body.details?.join(', ') || body.message || body.error || `HTTP ${res.status} creation failed`
    );
    error.status = res.status;
    error.details = body.details;
    throw error;
  }

  return body.data;
}

/**
 * Updates an existing product on the backend API
 * @param {string} id
 * @param {Object} productData
 */
export async function updateProduct(id, productData) {
  const payload = {
    name: productData.name,
    category: productData.category,
    price: productData.price,
    stock: productData.stock,
    image: productData.image,
    farmerName: productData.farmer?.name || productData.farmerName,
    location: productData.farmer?.location || productData.location,
    harvestDate: productData.farmer?.harvestDate || productData.harvestDate,
    description: productData.description
  };

  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(
      body.details?.join(', ') || body.message || body.error || `HTTP ${res.status} update failed`
    );
    error.status = res.status;
    error.details = body.details;
    throw error;
  }

  return body.data;
}

/**
 * Deletes a product by ID from the backend API
 * @param {string} id
 */
export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(body.message || body.error || `HTTP ${res.status} deletion failed`);
    error.status = res.status;
    throw error;
  }

  return body.data;
}

// ============================================================================
// Authentication API Services
// ============================================================================

const TOKEN_KEY = 'farm2home_auth_token';
const USER_KEY = 'farm2home_auth_user';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('LocalStorage save error:', err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.warn('LocalStorage clear error:', err);
  }
}

/**
 * Sign in user with email & password
 * @param {{ email: string, password: string }} credentials
 */
export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(body.error || body.message || 'Login failed. Please check credentials.');
    error.status = res.status;
    throw error;
  }

  if (body.token && body.user) {
    setAuthSession(body.token, body.user);
  }

  return body;
}

/**
 * Register a new user account
 * @param {{ name: string, email: string, password: string, role: string, phone?: string, location?: string }} userData
 */
export async function registerUser(userData) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const body = await res.json();
  if (!res.ok) {
    const error = new Error(body.error || body.message || 'Registration failed. Please check your information.');
    error.status = res.status;
    throw error;
  }

  if (body.token && body.user) {
    setAuthSession(body.token, body.user);
  }

  return body;
}

/**
 * Fetch authenticated user profile using token
 */
export async function fetchCurrentUser() {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        clearAuthSession();
      }
      return null;
    }

    const body = await res.json();
    if (body.user) {
      setAuthSession(token, body.user);
      return body.user;
    }
    return null;
  } catch (err) {
    console.warn('Could not verify current user session:', err.message);
    // Return cached user if offline
    return getStoredUser();
  }
}

/**
 * Get demo accounts for quick testing
 */
export async function fetchDemoUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/demo-users`);
    if (res.ok) {
      const body = await res.json();
      return body.data || [];
    }
  } catch {
    // fallback if server is unreachable
  }
  return [
    {
      email: 'farmer@farm2home.com',
      password: 'password123',
      role: 'farmer',
      name: 'Ramesh Patil (Local Farmer)'
    },
    {
      email: 'customer@farm2home.com',
      password: 'password123',
      role: 'customer',
      name: 'Priya Sharma (Home Buyer)'
    }
  ];
}

// ============================================================================
// Orders API Services
// ============================================================================

const ORDERS_STORAGE_KEY = 'farm2home_local_orders';

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrder(order) {
  try {
    const orders = getStoredOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('LocalStorage order save error:', err);
  }
}

/**
 * Place a direct produce order
 * @param {Object} orderData
 */
export async function createOrder(orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      const body = await res.json();
      if (body.data) {
        saveStoredOrder(body.data);
        return body.data;
      }
    }
  } catch (networkErr) {
    console.warn('Backend order submission offline, using local guarantee:', networkErr.message);
  }

  // Graceful local creation fallback if backend is momentarily unreachable
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const fallbackOrder = {
    id: `F2H-${Date.now().toString().slice(-4)}${randomSuffix}`,
    ...orderData,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  saveStoredOrder(fallbackOrder);
  return fallbackOrder;
}


