import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { testConnection, isDatabaseConfigured } from './config/db.js';
import { initDatabase } from './db/init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// 1. CORS Configuration (Req 8)
// Configured for the existing Vite frontend at http://localhost:5173
// ============================================================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching frontend
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// 2. Health-Check Endpoint (Req 4)
// GET /api/health
// ============================================================================
app.get('/api/health', async (req, res) => {
  const isConfigured = isDatabaseConfigured();
  let dbStatus = {
    configured: isConfigured,
    connected: false,
    message: isConfigured
      ? 'Attempting connection...'
      : 'DATABASE_URL is not configured in backend/.env. Please configure your Neon PostgreSQL connection string.'
  };

  if (isConfigured) {
    dbStatus = await testConnection();
    dbStatus.configured = true;
  }

  const isHealthy = !isConfigured || dbStatus.connected;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'Farm2Home Backend API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      configured: isConfigured,
      connected: dbStatus.connected,
      message: dbStatus.message,
      currentTime: dbStatus.currentTime || null
    }
  });
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Farm2Home Backend API',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      orders: '/api/orders'
    },
    frontendUrl: 'http://localhost:5173'
  });
});

// ============================================================================
// 3. Products, Auth & Orders Routes
// ============================================================================
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// ============================================================================
// 4. 404 Handler for undefined routes
// ============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found on this server.`
  });
});

// ============================================================================
// 5. Centralized Error Handler Middleware (Req 10)
// ============================================================================
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Server Error:', err);

  // Handle Missing Database URL
  if (err.code === 'NO_DATABASE_URL') {
    return res.status(503).json({
      success: false,
      error: 'Database Not Configured',
      message: 'DATABASE_URL is not configured in backend/.env. Please add your Neon connection string.'
    });
  }

  // Handle PostgreSQL check violation (e.g., price <= 0 or stock < 0)
  if (err.code === '23514') {
    return res.status(400).json({
      success: false,
      error: 'Database constraint violation',
      message: 'Price must be greater than 0 and stock quantity cannot be negative.'
    });
  }

  // Handle PostgreSQL connection timeout/refusal
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'Database Connection Timeout',
      message: 'Unable to reach the Neon PostgreSQL server. Please verify your internet connection and DATABASE_URL.'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server only if not in test mode
let serverInstance = null;
if (process.env.NODE_ENV !== 'test') {
  serverInstance = app.listen(PORT, async () => {
    console.log(`\n==================================================`);
    console.log(`🌱 Farm2Home Backend API running at http://localhost:${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`==================================================\n`);

    if (isDatabaseConfigured()) {
      console.log('🔗 DATABASE_URL detected. Testing connection and verifying schema...');
      const result = await initDatabase();
      if (result.success) {
        console.log('✨ Neon PostgreSQL ready to handle produce requests!\n');
      } else {
        console.warn('⚠️ Neon PostgreSQL connection check failed:', result.message, '\n');
      }
    } else {
      console.log('ℹ️ NOTE: DATABASE_URL is not yet configured in backend/.env.');
      console.log('   To connect Neon PostgreSQL:');
      console.log('   1. Copy backend/.env.example to backend/.env');
      console.log('   2. Set your Neon connection string in DATABASE_URL\n');
    }
  });

  serverInstance.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the confirmed duplicate Farm2Home server or set PORT to an available port.`);
    } else {
      console.error('Backend failed to start:', error.message);
    }
    process.exitCode = 1;
  });
}

export { app, serverInstance };
export default app;

