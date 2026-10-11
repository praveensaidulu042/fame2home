import express from 'express';
import { query, isDatabaseConfigured } from '../config/db.js';
import { hashPassword, verifyPassword, createToken, verifyToken } from '../utils/auth.js';

const router = express.Router();

// Fallback in-memory users storage when database is disconnected
const inMemoryUsers = [
  {
    id: 'user_farmer_1',
    name: 'Ramesh Patil',
    email: 'farmer@farm2home.com',
    password_hash: hashPassword('password123'),
    role: 'farmer',
    phone: '+91 98220 12345',
    location: 'Nashik, Maharashtra',
    created_at: new Date().toISOString()
  },
  {
    id: 'user_customer_1',
    name: 'Priya Sharma',
    email: 'customer@farm2home.com',
    password_hash: hashPassword('password123'),
    role: 'customer',
    phone: '+91 98765 43210',
    location: 'Pune, Maharashtra',
    created_at: new Date().toISOString()
  }
];

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'customer',
    phone: user.phone || '',
    location: user.location || '',
    createdAt: user.created_at || user.createdAt
  };
}

/**
 * GET /api/auth/demo-users
 * Returns available demo accounts for 1-click preview
 */
router.get('/demo-users', (req, res) => {
  res.json({
    success: true,
    data: [
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
    ]
  });
});

/**
 * POST /api/auth/register
 * Creates a new customer or farmer account
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'customer', phone = '', location = '' } = req.body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedRole = role === 'farmer' ? 'farmer' : 'customer';

    if (!trimmedName) {
      return res.status(400).json({ success: false, error: 'Full name is required.' });
    }

    if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const hashedPassword = hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    if (isDatabaseConfigured()) {
      try {
        // Check for existing user
        const existingResult = await query(
          'SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1',
          [trimmedEmail]
        );

        if (existingResult.rows.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'An account with this email address already exists. Please log in.'
          });
        }

        // Insert new user
        const insertResult = await query(
          `INSERT INTO users (id, name, email, password_hash, role, phone, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id, name, email, role, phone, location, created_at`,
          [userId, trimmedName, trimmedEmail, hashedPassword, trimmedRole, phone.trim(), location.trim()]
        );

        const createdUser = insertResult.rows[0];
        const token = createToken({
          id: createdUser.id,
          email: createdUser.email,
          role: createdUser.role
        });

        return res.status(201).json({
          success: true,
          message: 'Account registered successfully!',
          token,
          user: sanitizeUser(createdUser)
        });
      } catch (dbErr) {
        console.warn('Database error during register, attempting fallback:', dbErr.message);
      }
    }

    // In-memory fallback
    const existsInMemory = inMemoryUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existsInMemory) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists. Please log in.'
      });
    }

    const newUser = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      password_hash: hashedPassword,
      role: trimmedRole,
      phone: phone.trim(),
      location: location.trim(),
      created_at: new Date().toISOString()
    };
    inMemoryUsers.push(newUser);

    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully (local session)!',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Validates credentials and returns JWT token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email?.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.'
      });
    }

    let foundUser = null;

    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          'SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1',
          [trimmedEmail]
        );
        if (result.rows.length > 0) {
          foundUser = result.rows[0];
        }
      } catch (dbErr) {
        console.warn('Database error during login, falling back to memory check:', dbErr.message);
      }
    }

    if (!foundUser) {
      foundUser = inMemoryUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    }

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials or register.'
      });
    }

    const isMatch = verifyPassword(password, foundUser.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password. Please verify your credentials.'
      });
    }

    const token = createToken({
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role
    });

    return res.json({
      success: true,
      message: `Welcome back, ${foundUser.name}!`,
      token,
      user: sanitizeUser(foundUser)
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/auth/me
 * Retrieves current authenticated user
 */
router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authorization token required.'
      });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid. Please sign in again.'
      });
    }

    let userRecord = null;

    if (isDatabaseConfigured()) {
      try {
        const result = await query(
          'SELECT id, name, email, role, phone, location, created_at FROM users WHERE id = $1 LIMIT 1',
          [payload.id]
        );
        if (result.rows.length > 0) {
          userRecord = result.rows[0];
        }
      } catch (dbErr) {
        console.warn('Database error during /me:', dbErr.message);
      }
    }

    if (!userRecord) {
      userRecord = inMemoryUsers.find((u) => u.id === payload.id);
    }

    if (!userRecord) {
      return res.status(404).json({
        success: false,
        error: 'User account not found.'
      });
    }

    return res.json({
      success: true,
      user: sanitizeUser(userRecord)
    });
  } catch (err) {
    next(err);
  }
});

export default router;
