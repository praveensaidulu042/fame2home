# 🌱 Farm2Home — Direct Farm-to-Consumer Produce Marketplace

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?logo=postgresql&logoColor=white)](https://neon.tech/)

**Farm2Home** is a full-stack, direct-from-farm marketplace connecting regional farmers in India directly to urban consumers. By removing middlemen and brokers, consumers get farm-fresh, chemical-free produce harvested on the same morning at fair prices, while farmers receive 100% of their produce value.

---

## 🌟 Key Features

### 🛒 Customer Marketplace
- **Real-Time Produce Catalog:** Browse fresh harvest vegetables, seasonal fruits, and leafy greens.
- **Search & Filter:** Instant search by produce name, farmer name, or farm location, and filter by categories.
- **Interactive Shopping Cart:** Real-time cart drawer with itemized pricing, quantity counters, and free direct farm delivery.
- **Direct Farm Checkout:** Multi-step checkout with recipient address, harvest time slots (Morning / Evening), and Cash on Delivery / UPI payment options.
- **Order Confirmation:** Instant order reference number, harvest scheduling notification, and order summary.

### 🚜 Farmer Produce Portal
- **Harvest Inventory Dashboard:** Live produce management table showing prices in Indian Rupees (₹) and stock quantities (kg).
- **Produce Management:** Add new harvests, update prices and stock levels, or delete sold-out lots.
- **Verified Producer Badges:** Showcases farm hub, farmer identity, and transparent harvest timestamps.

### 🔐 Full Authentication System
- **Role-Based Accounts:** Seamless sign-up and sign-in for both **Customers (Buyers)** and **Farmers (Producers)**.
- **Security:** PBKDF2 password hashing with cryptographically secure salts and HMAC-SHA256 signed JWT tokens.
- **1-Click Demo Logins:** Instant demo testing for **Farmer Ramesh** and **Customer Priya**.

### ⚡ Database & Backend
- **Neon Serverless PostgreSQL:** Managed cloud relational database with structured tables for `products`, `users`, and `orders`.
- **Zero-Latency Fallbacks:** Automatic in-memory and local session persistence for resilient zero-downtime operation.

---

## 🏗️ Architecture

```
Farm2Home/
├── backend/
│   ├── src/
│   │   ├── config/         # Database pool configuration (Neon PostgreSQL)
│   │   ├── db/             # Schema initialization & seed data (init.js)
│   │   ├── routes/         # Express API routes (products, auth, orders)
│   │   ├── utils/          # Auth helpers (PBKDF2 hashing & JWT tokens)
│   │   └── server.js       # Express server entry point
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Components (Navbar, Hero, ProductList, CartModal, AuthModal)
│   │   ├── dashboard/      # Farmer produce inventory management
│   │   ├── services/       # API client with auto fallback (api.js)
│   │   ├── App.jsx         # Root component & state management
│   │   └── index.css       # Design system & responsive styles
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/praveensaidulu042/farm2home.git
cd farm2home
```

### 2. Setup the Backend
```bash
cd backend
npm install
```

Configure your environment variables:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your Neon PostgreSQL connection string:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/neondb?sslmode=require
   ```
3. Initialize the database schema & seed initial produce:
   ```bash
   npm run db:init
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`.*

### 3. Setup the Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173` (or `http://localhost:5175`).*

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & Neon PostgreSQL connection health |
| `GET` | `/api/products` | Retrieve produce items (with category & stock filters) |
| `POST` | `/api/products` | Add new produce item |
| `PUT` | `/api/products/:id` | Update existing produce item |
| `DELETE` | `/api/products/:id` | Remove produce item |
| `POST` | `/api/auth/register` | Register new Customer or Farmer account |
| `POST` | `/api/auth/login` | Authenticate user and receive token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/auth/demo-users`| List 1-click preview accounts |
| `POST` | `/api/orders` | Place a direct farm produce order |
| `GET` | `/api/orders` | Fetch recent farm orders |

---

## 🤝 License
This project is open-source and available under the [ISC License](LICENSE).
