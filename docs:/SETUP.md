# University Food Pre-Booking System — Setup Guide

## Prerequisites

- **Node.js** v20+
- **Python** 3.11+
- **MySQL** 8.0+
- **npm** v10+
- **pip** / **venv**

---

## Quick Start (Manual)

### 1. Clone and Prepare the Repository

```bash
git clone <repository-url>
cd university-food-system
```

---

### 2. Database Setup

Apply the schema to your MySQL instance:

```sql
CREATE DATABASE university_food_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'foodapp'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON university_food_system.* TO 'foodapp'@'localhost';
FLUSH PRIVILEGES;
```

Then apply the schema:

```bash
mysql -u foodapp -p university_food_system < database/schema.sql
```

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your real values, especially:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` — a long, random string (e.g. `openssl rand -hex 32`)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `ML_INTERNAL_API_KEY`

Then install and run:

```bash
npm install
npm run migrate   # Ensures Sequelize syncs models (optional — schema.sql already applied)
npm run seed      # Seeds 10 food courts with real menu data + test users
npm run dev       # Starts backend with nodemon on port 5000
```

**Backend available at:** `http://localhost:5000`  
**Health check:** `http://localhost:5000/health`

---

### 4. ML Service Setup

```bash
cd ml-service
cp .env.example .env
# Edit .env with your DB credentials and INTERNAL_API_KEY

python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

**ML service available at:** `http://localhost:8000`  
**Health check:** `http://localhost:8000/health`

> **Note:** The ML model file (`model/demand_model.joblib`) must exist before demand predictions work. Run the training script first if needed.

---

### 5. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Verify VITE_API_BASE_URL=http://localhost:5000/api

npm install
npm run dev
```

**Frontend available at:** `http://localhost:5173`

---

## Quick Start (Docker Compose)

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with Razorpay credentials

docker-compose up --build
```

This starts MySQL, backend, ML service, and frontend together.

Apply the schema automatically via Docker init (already configured in `docker-compose.yml`).

Run seed after containers start:
```bash
docker exec university_food_backend npm run seed
```

---

## Test Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@university.edu` | `Password123!` |
| Student | `student1@university.edu` | `Password123!` |
| Shopkeeper 1 (BH-1) | `shopkeeper1@university.edu` | `Password123!` |
| Shopkeeper 2 (Central Mess) | `shopkeeper2@university.edu` | `Password123!` |
| Shopkeeper 3 (N.K Food Court) | `shopkeeper3@university.edu` | `Password123!` |
| Shopkeeper 4 (Engineering Block) | `shopkeeper4@university.edu` | `Password123!` |
| ... | `shopkeeper5-10@university.edu` | `Password123!` |

---

## API Testing

Use the smoke test to verify backend integration:

```bash
cd backend
npm run smoke-test
```

Key endpoints:
- `POST /api/auth/login` — Login
- `GET /api/food-courts` — List food courts
- `POST /api/orders` — Create order
- `GET /api/orders/my-orders` — User orders
- `GET /api/admin/dashboard` — Admin dashboard
- `GET /api/analytics/shopkeeper/overview` — Shopkeeper analytics

---

## Environment Variables Reference

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | `development` / `production` | Yes |
| `PORT` | HTTP port (default: 5000) | No |
| `DB_HOST` | MySQL host | Yes |
| `DB_PORT` | MySQL port (default: 3306) | No |
| `DB_NAME` | Database name | Yes |
| `DB_USER` | Database user | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | Long random string for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token TTL (default: `7d`) | No |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes |
| `PICKUP_WINDOW_MINUTES` | Pickup window after slot time | No |
| `ORDER_EXPIRY_SWEEP_INTERVAL_MS` | How often to sweep expired orders | No |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | For payments |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret | For payments |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret | For webhooks |
| `ML_SERVICE_URL` | ML service base URL | For ML |
| `ML_INTERNAL_API_KEY` | Internal API key for ML | For ML |

### Frontend (`.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_SOCKET_URL` | Socket.IO server URL |

---

## Troubleshooting

**Backend won't connect to DB:**  
Verify `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env` and that MySQL is running.

**Payment doesn't work:**  
Set real `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`. Test mode keys from Razorpay dashboard work for development.

**ML predictions fail:**  
Ensure the ML service is running on port 8000 and `ML_SERVICE_URL` is set. Train the model using the training scripts in `ml-service/training/`.

**Socket.IO not connecting:**  
Check `VITE_SOCKET_URL` in frontend `.env` matches the backend URL.
