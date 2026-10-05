# University Food Pre-Booking System

## Project Overview

A university-wide web application for pre-booking food from 10 university food courts.

The system is designed to reduce lunch queues, provide shopkeepers with expected demand, improve pickup flow, and reduce food wastage.

## Core Users

- Student
- Faculty/Staff
- Shopkeeper
- Administrator

## Main Features

### User

- Registration/login
- Browse food courts
- Browse menus
- Cart
- Pickup slot
- Online payment
- Order confirmation
- Real-time order tracking
- QR pickup
- Order history
- Notifications
- Profile

### Shopkeeper

- Food court dashboard
- Menu management
- Price management
- Quantity management
- Availability
- Pickup slots
- Incoming orders
- Order status
- QR scanning
- Inventory
- Food waste
- Analytics
- Demand prediction

### Admin

- Dashboard
- User management
- Shopkeeper approval
- Food court management
- Order monitoring
- Payment monitoring
- Analytics
- Audit logs
- Settings

## Operating Rules

Shopkeeper setup operations open at 9:30 AM.

User ordering opens at 10:30 AM.

Users select pickup slots.

The pickup window lasts 15 minutes after the selected pickup time.

After the deadline:

`READY → EXPIRED`

The project policy states no refund after expiry. This must be shown before payment.

## Technology

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO
- Recharts

### Backend

- Node.js
- Express.js
- MySQL
- JWT
- bcrypt/Argon2
- Socket.IO

### ML

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- Joblib

### Payment

Approved payment gateway with server-side verification and webhooks.

## Repository

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

## Team

| Member | Responsibility |
|---|---|
| 1 | Auth, RBAC, integration |
| 2 | User frontend |
| 3 | Core backend + database |
| 4 | Admin panel |
| 5 | Shopkeeper panel + operations |
| 6 | Payment + analytics + ML |

## Development

Read all project documents before coding.

Do not create independent applications.

Use feature branches and merge into `develop`.

## AI Development

Claude is used for module development.

Antigravity is used after integration for repository-wide inspection, debugging, testing, and final engineering.

## Important Documents

- `API_CONTRACT.md`
- `DATABASE_SCHEMA.md`
- `ARCHITECTURE.md`
- `DEVELOPMENT_RULES.md`
