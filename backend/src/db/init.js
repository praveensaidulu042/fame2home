import { query, testConnection, isDatabaseConfigured, getPool } from '../config/db.js';
import { hashPassword } from '../utils/auth.js';

// Initial sample produce data for Farm2Home marketplace
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    price: 38,
    stock: 85,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    farmer_name: 'Ramesh Patil',
    location: 'Nashik, Maharashtra',
    harvest_date: 'Harvested Today, 5:30 AM',
    description: 'Vine-ripened, juicy red tomatoes naturally grown without synthetic pesticides. Perfect for curries, salads, and gravies.'
  },
  {
    id: 'prod-2',
    name: 'Mountain Golden Potatoes',
    category: 'Vegetables',
    price: 32,
    stock: 140,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    farmer_name: 'Suresh Verma',
    location: 'Hassan, Karnataka',
    harvest_date: 'Harvested Yesterday',
    description: 'Freshly harvested firm potatoes with thin skins, ideal for crispy aloo fry, parathas, and homestyle curries.'
  },
  {
    id: 'prod-3',
    name: 'Nashik Red Onions',
    category: 'Vegetables',
    price: 45,
    stock: 195,
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80',
    farmer_name: 'Balasaheb Shinde',
    location: 'Lasalgaon, Maharashtra',
    harvest_date: 'Harvested 2 days ago',
    description: 'Crisp, pungent, nutrient-rich red onions directly from India\'s onion capital. Sun-cured for lasting freshness.'
  },
  {
    id: 'prod-4',
    name: 'Ratnagiri Alphonso Mangoes',
    category: 'Fruits',
    price: 480,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
    farmer_name: 'Ganesh Sawant',
    location: 'Ratnagiri, Maharashtra',
    harvest_date: 'Tree-ripened, fresh batch',
    description: 'Naturally carbide-free, handpicked King of Mangoes with heavenly aroma, golden pulp, and rich tropical sweetness.'
  },
  {
    id: 'prod-5',
    name: 'Tender Farm Spinach (Palak)',
    category: 'Leafy Greens',
    price: 24,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    farmer_name: 'Anandi Devi',
    location: 'Khed, Pune',
    harvest_date: 'Harvested Today, 6:00 AM',
    description: 'Crisp, emerald-green iron-rich spinach leaves washed in clean spring water. Perfect for palak paneer and healthy smoothies.'
  }
];

// Initial demo user accounts for Farm2Home authentication
const INITIAL_USERS = [
  {
    id: 'user_farmer_1',
    name: 'Ramesh Patil',
    email: 'farmer@farm2home.com',
    password_hash: hashPassword('password123'),
    role: 'farmer',
    phone: '+91 98220 12345',
    location: 'Nashik, Maharashtra'
  },
  {
    id: 'user_customer_1',
    name: 'Priya Sharma',
    email: 'customer@farm2home.com',
    password_hash: hashPassword('password123'),
    role: 'customer',
    phone: '+91 98765 43210',
    location: 'Pune, Maharashtra'
  }
];

export async function initDatabase() {
  if (!isDatabaseConfigured()) {
    return {
      success: false,
      message: 'Database is not configured. Please add your Neon connection string to backend/.env'
    };
  }

  try {
    console.log('🔄 Checking database connection and initializing schema...');
    
    // 1. Test connection
    const test = await testConnection();
    if (!test.connected) {
      throw new Error(test.message);
    }

    // 2. Create products table if not exists
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
        stock NUMERIC(10, 2) NOT NULL CHECK (stock >= 0),
        image TEXT,
        farmer_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        harvest_date VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createTableSQL);
    console.log('✅ PostgreSQL table "products" verified/created.');

    // 3. Create users table if not exists
    const createUsersTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        phone VARCHAR(50),
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createUsersTableSQL);
    console.log('✅ PostgreSQL table "users" verified/created.');

    // 4. Create orders table if not exists
    const createOrdersTableSQL = `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_id VARCHAR(100),
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(50) NOT NULL,
        delivery_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        pincode VARCHAR(20) NOT NULL,
        delivery_slot VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        items JSONB NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL,
        delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
        total_amount NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createOrdersTableSQL);
    console.log('✅ PostgreSQL table "orders" verified/created.');

    // 4. Seed initial products if table is currently empty
    const countResult = await query('SELECT COUNT(*) as count FROM products');
    const count = parseInt(countResult.rows[0].count, 10);

    if (count === 0) {
      console.log('🌱 Products table is empty. Seeding initial Farm2Home produce...');
      for (const prod of INITIAL_PRODUCTS) {
        await query(
          `INSERT INTO products (id, name, category, price, stock, image, farmer_name, location, harvest_date, description)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
          [
            prod.id,
            prod.name,
            prod.category,
            prod.price,
            prod.stock,
            prod.image,
            prod.farmer_name,
            prod.location,
            prod.harvest_date,
            prod.description
          ]
        );
      }
      console.log(`✅ Seeded ${INITIAL_PRODUCTS.length} initial products successfully.`);
    } else {
      console.log(`ℹ️ Products table already contains ${count} produce item(s). Skipping seed.`);
    }

    // 5. Seed default demo users if users table is empty
    const usersCountResult = await query('SELECT COUNT(*) as count FROM users');
    const usersCount = parseInt(usersCountResult.rows[0].count, 10);

    if (usersCount === 0) {
      console.log('👤 Users table is empty. Seeding initial Farm2Home demo accounts...');
      for (const u of INITIAL_USERS) {
        await query(
          `INSERT INTO users (id, name, email, password_hash, role, phone, location)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO NOTHING`,
          [u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.location]
        );
      }
      console.log(`✅ Seeded ${INITIAL_USERS.length} demo users successfully.`);
    } else {
      console.log(`ℹ️ Users table already contains ${usersCount} account(s).`);
    }

    return {
      success: true,
      message: 'Database schema and initial data verified successfully.'
    };
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    return {
      success: false,
      message: err.message
    };
  }
}

// Allow standalone execution via `node src/db/init.js`
if (process.argv[1] && process.argv[1].endsWith('init.js')) {
  initDatabase()
    .then((result) => {
      console.log(result.message);
      const pool = getPool();
      if (pool) pool.end();
      process.exit(result.success ? 0 : 1);
    })
    .catch((err) => {
      console.error('Fatal initialization error:', err);
      process.exit(1);
    });
}
