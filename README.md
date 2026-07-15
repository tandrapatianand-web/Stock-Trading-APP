# SB Stocks — Full-Stack MERN Paper Trading Application

**SB Stocks** is a production-ready paper trading web application that allows users to practice stock market trading using virtual USD, with zero financial risk. The application is built using the MERN stack (MongoDB, Express, React, Node) and styled with a gorgeous, high-fidelity dark-theme glassmorphism design system.

---

## ⚡ Key Features

* **User Authentication**: JWT-based secure authorization with password hashing (`bcryptjs`) and email validation.
* **Role-Based Access Control**:
  * **Traders**: Practice trading stocks, monitor portfolio performance, manage watchlists, view historical price charts, and search/sort tickers.
  * **Administrators**: Create, edit, and delete stocks in the platform catalog, delete trader accounts, and view global transaction activity and trade volumes.
* **Real-time Price Simulator**: A background simulator fluctuates stock prices realistically every 15 seconds to simulate live market trading.
* **Interactive Data Visualization**: Premium line graphs for stock histories and asset allocation doughnut charts powered by Chart.js.
* **Ledger Export**: Traders can search their transaction logs and export the audit ledger directly to a CSV file.
* **Zero-Setup Fallback Engine**: If no local MongoDB server or credentials are found, the server automatically spins up a local file-system database engine (`backend/data/db.json`), allowing the full application to run successfully out-of-the-box!

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React.js, React Router DOM
* **State Management**: Redux Toolkit, React-Redux
* **Networking**: Axios
* **UI & Icons**: Vanilla CSS (custom design system), Bootstrap CSS (layout grid), Lucide React
* **Charts**: Chart.js, React-Chartjs-2
* **Notifications**: React Toastify

### Backend
* **Core**: Node.js, Express.js
* **Database**: MongoDB (via Mongoose)
* **Fallback Database**: Custom local file-system JSON adapter
* **Authentication**: JWT, bcryptjs
* **Security & Utility**: Helmet, CORS, Express Rate Limit, dotenv

---

## 📂 Project Structure

```text
Anand/
├── backend/
│   ├── config/          # db.js connection, mockDb.js fallback database
│   ├── controllers/     # Controller logic for auth, stocks, portfolio, trades, admin
│   ├── data/            # Local fallback JSON database file (db.json)
│   ├── middleware/      # Auth checks, admin validation, global error handling
│   ├── models/          # User, Stock, Portfolio, Transaction, Watchlist schemas
│   ├── routes/          # Express routing endpoints
│   ├── services/        # Real-time price simulator and database seeder
│   ├── package.json     # Node dependencies
│   ├── server.js        # Backend entry point
│   └── test_endpoints.js# Native API integration test suite
│
├── frontend/
│   ├── src/
│   │   ├── assets/      # Media and logos
│   │   ├── components/  # Navbar, Sidebar, ProtectedRoute guards
│   │   ├── hooks/       # Custom React hooks
│   │   ├── layouts/     # SidebarLayout page layout wrapper
│   │   ├── pages/       # Dashboard, Markets, Portfolio, Watchlist, Auth, Admin panels
│   │   ├── redux/       # Store configurations and API slices
│   │   ├── services/    # Axios instance with interceptors
│   │   ├── utils/       # CSV converters, number formatters
│   │   ├── App.css      # Custom landing and utility classes
│   │   ├── index.css    # Custom dark/light glassmorphic styling tokens
│   │   ├── App.jsx      # Main routes mapping
│   │   └── main.jsx     # App entry point with Redux Provider
│   ├── package.json     # Vite dependencies
│   └── vite.config.js   # Vite server proxy configs
│
├── README.md            # Documentation guide
└── task.md              # Build checklist
```

---

## ⚙️ Environment Configurations

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/sbstocks
JWT_SECRET=your_custom_jwt_secret_key
STOCK_API_KEY=mock_stock_api_key_sbstocks
```

*Note: If no `.env` file is created, default parameters are automatically loaded.*

---

## 🚀 Installation & Running Guide

### Prerequisites
* **Node.js** (version 18+ recommended)
* **npm** or **yarn**
* *(Optional)* **MongoDB Local Server** (If MongoDB is not installed, the local JSON database fallback activates automatically)

### Step 1: Clone or Open the Workspace

Ensure your workspace directory contains both `backend` and `frontend` folders.

### Step 2: Start the Backend Server

```bash
cd backend
npm install
npm start
```

You should see output similar to:
```text
Connecting to primary MongoDB: mongodb://127.0.0.1:27017/sbstocks
⚡ Fallback: Activating local JSON Database engine!
📁 Data path: backend/data/db.json
Seeding initial stock database...
Stock database seeded successfully.
Starting Stock Price Simulator Service...
Server running in development mode on port 5000
```

### Step 3: Start the Frontend Application

Open another terminal session:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:5173/` to view the application!

---

## 🧪 Running Integration Tests

To run the automated integration test suite on the backend APIs:

```bash
cd backend
node test_endpoints.js
```

---

## 📡 REST API Documentation

### 🔐 User Authentication (`/api/auth`)
* `POST /api/auth/register`: Create user account. Returns JWT.
* `POST /api/auth/login`: Authenticate email and password. Returns JWT.
* `GET /api/auth/profile`: Fetch current user info (requires header: `Authorization: Bearer <token>`).

### 📈 Stock Directory (`/api/stocks`)
* `GET /api/stocks`: Retrieve paginated stock list. Parameters: `search`, `sector`, `sort`, `page`.
* `GET /api/stocks/:id`: Fetch specific stock details and 30-day historical chart data.
* `POST /api/stocks`: [Admin] Add new security asset to platform.
* `PUT /api/stocks/:id`: [Admin] Edit stock company details or force update current price.
* `DELETE /api/stocks/:id`: [Admin] Delete a stock listing from the catalog.

### 💼 Portfolio & Trading (`/api/portfolio` & `/api/trade`)
* `GET /api/portfolio`: Fetch user virtual balance, equity value, P&L calculations, and holdings.
* `POST /api/trade/buy`: Buy shares. Validates cash balance.
* `POST /api/trade/sell`: Sell shares. Validates holding quantities.
* `GET /api/transactions`: Fetch transaction ledger.

### ❤️ Watchlist (`/api/watchlist`)
* `GET /api/watchlist`: Fetch favorited stock list.
* `POST /api/watchlist`: Add stock to watchlist. Expects `{ stockId }`.
* `DELETE /api/watchlist/:id`: Remove stock from watchlist.

### 🛡️ Admin Controls (`/api/admin`)
* `GET /api/admin/users`: List all platform users, their available cash, and trade counts.
* `DELETE /api/admin/users/:id`: Delete a user account (and cascade-delete their portfolio/transactions).
* `GET /api/admin/dashboard`: Global analytics (active traders, transaction ledger, total platform volume).

---

## 🌐 Deployment Instructions

### 🗄️ Database (MongoDB Atlas)
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and deploy a free Shared Cluster.
2. In database access, create a user with read/write privileges.
3. In network access, whitelist IP `0.0.0.0/0` (for public server accesses).
4. Retrieve your application connection string (e.g. `mongodb+srv://...`).

### ⚙️ Backend (Render / Heroku)
1. Log in to [Render](https://render.com/) and create a new **Web Service**.
2. Link your Git repository.
3. Configure settings:
   * **Environment**: `Node`
   * **Build Command**: `cd backend && npm install`
   * **Start Command**: `cd backend && node server.js`
4. Add environment variables in variables settings:
   * `MONGO_URI`: *[Your MongoDB Atlas URI]*
   * `JWT_SECRET`: *[Your JWT encryption secret]*
   * `NODE_ENV`: `production`

### 💻 Frontend (Vercel / Netlify)
1. Log in to [Vercel](https://vercel.com/) and create a new project.
2. Link your Git repository.
3. Configure settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Deploy!
#   S t o c k - T r a d i n g - A P P  
 