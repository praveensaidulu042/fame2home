import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

// Check if DATABASE_URL is set and not the placeholder
export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  if (url.includes('your_neon_user') || url.includes('your_neon_password')) return false;
  return true;
}

// Create Pool configuration
function createPoolConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  // Neon PostgreSQL requires SSL connections
  return {
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    max: 10, // Max pool clients
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
}

let poolInstance = null;

export function getPool() {
  if (!poolInstance) {
    const config = createPoolConfig();
    if (config) {
      poolInstance = new Pool(config);

      // Listen for unexpected errors on idle clients
      poolInstance.on('error', (err) => {
        console.error('⚠️ Unexpected PostgreSQL pool error on idle client:', err.message);
      });
    }
  }
  return poolInstance;
}

/**
 * Executes a parameterized SQL query with the pool.
 * @param {string} text - SQL statement with parameters ($1, $2, ...)
 * @param {Array} params - Parameter values
 */
export async function query(text, params = []) {
  if (!isDatabaseConfigured()) {
    const error = new Error('DATABASE_URL is not configured. Please add your Neon connection string to backend/.env');
    error.code = 'NO_DATABASE_URL';
    throw error;
  }

  const pool = getPool();
  if (!pool) {
    const error = new Error('Failed to initialize database connection pool.');
    error.code = 'POOL_INIT_FAILED';
    throw error;
  }

  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SQL Query] Executed in ${duration}ms | Rows: ${result.rowCount}`);
    }
    return result;
  } catch (err) {
    console.error(`[SQL Error] Query failed: ${err.message}`);
    throw err;
  }
}

/**
 * Tests database connectivity.
 * @returns {Promise<{connected: boolean, message: string}>}
 */
export async function testConnection() {
  if (!isDatabaseConfigured()) {
    return {
      connected: false,
      message: 'DATABASE_URL is not configured in backend/.env. Please configure your Neon PostgreSQL connection string.'
    };
  }

  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version');
    return {
      connected: true,
      message: 'Connected to Neon PostgreSQL successfully.',
      currentTime: result.rows[0].current_time,
      version: result.rows[0].pg_version
    };
  } catch (err) {
    return {
      connected: false,
      message: `Database connection failed: ${err.message}`
    };
  }
}
