# University Food Pre-Booking System — Architecture

**Version:** 1.0

## 1. Objective

Build a university-wide food pre-booking platform that reduces queues, gives shopkeepers predictable demand, supports scheduled pickup, reduces food waste, and provides administrative visibility.

## 2. High-Level Architecture

```text
                    ┌─────────────────────┐
                    │     React Frontend  │
                    │ User/Admin/Shopkeeper│
                    └──────────┬──────────┘
                               │ HTTPS/REST
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Auth/RBAC/API/Logic │
                    └──────┬───────┬──────┘
                           │       │
                    SQL    │       │ Socket.IO
                           ▼       ▼
                    ┌──────────┐  Clients
                    │  MySQL   │
                    └──────────┘
                           ▲
                           │ historical data
                           │
                    ┌──────┴──────────┐
                    │ Python FastAPI  │
                    │ ML Prediction   │
                    └─────────────────┘

Node.js also communicates with:
- Payment Gateway
- ML Service
```

## 3. Frontend

Technology:

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO client
- Recharts

Three role-based experiences:

### User

```text
Login
→ Dashboard
→ Food Courts
→ Menu
→ Food Details
→ Cart
→ Checkout
→ Pickup Slot
→ Payment
→ Confirmation
→ Active Order
→ QR
→ History
→ Profile
```

### Shopkeeper

```text
Login
→ Dashboard
→ Menu
→ Inventory
→ Pickup Slots
→ Orders
→ QR Scanner
→ Waste
→ Analytics
```

### Admin

```text
Login
→ Dashboard
→ Users
→ Shopkeepers
→ Approvals
→ Food Courts
→ Orders
→ Payments
→ Analytics
→ Audit Logs
→ Settings
```

## 4. Backend

Node.js + Express owns:

- Authentication
- Authorization
- Business rules
- API routing
- Order creation
- Inventory validation
- Pickup slots
- Payment orchestration
- QR verification orchestration
- Notifications
- Analytics queries
- ML service communication

## 5. Database

MySQL is the system of record.

No frontend code may connect directly to MySQL.

## 6. ML Service

Python FastAPI owns:

- Model loading
- Prediction
- Input validation
- Training/inference utilities
- Demand forecasting logic

The Node.js backend acts as the trusted application gateway.

## 7. Payment Architecture

```text
React
  ↓
Node.js
  ↓
Payment Provider
  ↓
Webhook
  ↓
Node.js
  ↓
MySQL
```

The browser does not determine final payment success.

## 8. QR Pickup Architecture

```text
Backend generates secure pickup token
             ↓
          User QR
             ↓
       Shopkeeper scans
             ↓
     POST /pickup/verify
             ↓
       Backend validates
             ↓
      Order = PICKED_UP
```

## 9. Authentication

JWT-based authentication.

Backend middleware:

```text
authenticate
authorize
requireRole
```

Role hierarchy is not automatically hierarchical; access is explicit by role and resource.

## 10. Order Lifecycle

```text
CONFIRMED
    ↓
PREPARING
    ↓
READY
    ↓
PICKED_UP
```

Alternative terminal states:

```text
EXPIRED
CANCELLED
```

## 11. Pickup Policy

Users select a pickup slot.

The system provides a 15-minute pickup window after the selected pickup time.

After the deadline:

```text
READY → EXPIRED
```

The project policy states that expired orders are not refunded. The policy must be visible before payment.

The backend, not the browser timer, is authoritative.

## 12. Operating Times

Shopkeeper preparation/setup operations open at 9:30 AM.

User ordering opens at 10:30 AM.

These times should be configurable where possible and enforced server-side.

## 13. Real-Time Architecture

Socket.IO provides events for:

- New order
- Confirmed
- Preparing
- Ready
- Picked up
- Expired
- Cancelled

Use food-court/order authorization when joining rooms or receiving sensitive events.

## 14. Analytics

Admin analytics:

- Users
- Orders
- Revenue
- Food court performance
- Popular food
- Peak hours
- Expiry
- Waste

Shopkeeper analytics:

- Orders
- Revenue
- Popular food
- Pickup demand
- Waste

## 15. ML Demand Prediction

Inputs may include:

- food item
- food court
- day of week
- time slot
- historical demand
- rolling averages
- previous demand
- event/holiday indicators if available

Output:

Expected demand for a food item/time period.

ML predictions are recommendations/decision support and do not automatically modify inventory.

## 16. Security Principles

- Password hashing
- JWT authentication
- RBAC
- Input validation
- Rate limiting
- Secure headers
- CORS configuration
- Parameterized queries/ORM
- Server-side payment verification
- Server-side QR validation
- No secrets in frontend
- No secrets in Git
- Audit sensitive admin actions

## 17. Repository Structure

```text
university-food-system/
├── README.md
├── API_CONTRACT.md
├── DATABASE_SCHEMA.md
├── ARCHITECTURE.md
├── DEVELOPMENT_RULES.md
├── frontend/
├── backend/
├── ml-service/
├── database/
└── docs/
```

## 18. Integration Principle

The system is one application, not six independent applications.

Each member owns a module but must follow the shared contracts.

Git branches:

```text
main
develop
feature/auth
feature/user-panel
feature/core-backend
feature/admin-panel
feature/shopkeeper
feature/payment-ml
```

## 19. Deployment Concept

Frontend:

Vercel or equivalent.

Backend:

Render/Railway/AWS or equivalent.

ML:

Render/Railway/AWS or equivalent.

Database:

Managed MySQL.

Production secrets are configured through the deployment platform.
