# University Food Pre-Booking System — API Contract

**Version:** 1.0  
**Status:** Team Baseline  
**Audience:** All six developers, Claude sessions, Antigravity, frontend/backend/ML integration

## 1. Purpose

This document is the single source of truth for communication between the React frontend, Node.js backend, Python ML service, payment provider, and Socket.IO clients.

No developer should invent, rename, remove, or silently change an API.

Breaking API changes require team approval and a version update.

## 2. Base URLs

Development backend:

`http://localhost:5000/api`

Development ML service:

`http://localhost:8000`

Production URLs are configured through environment variables.

## 3. General Rules

- REST + JSON.
- Protected endpoints use `Authorization: Bearer <JWT>`.
- Frontend never connects directly to MySQL.
- Backend calculates authoritative order totals.
- Backend validates authorization.
- Payment status is verified server-side.
- QR pickup is verified server-side.
- All responses follow the standard response envelope.

## 4. Roles

- `ADMIN`
- `SHOPKEEPER`
- `USER`

## 5. Standard Responses

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": []
}
```

## 6. HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Bad request |
| 401 | Unauthenticated |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation failure |
| 429 | Rate limited |
| 500 | Internal server error |

## 7. Authentication

### POST `/auth/register`

Public.

Creates a user account.

### POST `/auth/login`

Public.

Returns authenticated user information and JWT according to the authentication architecture.

### POST `/auth/logout`

Authenticated.

Invalidates the session/token according to the selected authentication strategy.

### GET `/auth/profile`

Authenticated.

Returns current user profile.

### PUT `/auth/change-password`

Authenticated.

Changes the current user's password.

## 8. Food Courts

### GET `/food-courts`

Public/authenticated according to application policy.

Returns available food courts.

### GET `/food-courts/:foodCourtId`

Returns one food court.

## 9. Food Items

### GET `/food-courts/:foodCourtId/food-items`

Returns food items for a food court.

### GET `/food-items/:foodItemId`

Returns one food item.

### POST `/shopkeeper/food-items`

SHOPKEEPER.

Creates a food item in the assigned food court.

### PUT `/shopkeeper/food-items/:foodItemId`

SHOPKEEPER.

Updates an assigned food item.

### DELETE `/shopkeeper/food-items/:foodItemId`

SHOPKEEPER.

Deactivates/removes an assigned food item according to backend policy.

## 10. Pickup Slots

### GET `/food-courts/:foodCourtId/pickup-slots`

Returns available pickup slots.

### POST `/shopkeeper/pickup-slots`

SHOPKEEPER.

Creates/configures a pickup slot.

### PATCH `/shopkeeper/pickup-slots/:slotId/status`

SHOPKEEPER.

Activates/deactivates a pickup slot.

## 11. Orders

### POST `/orders`

USER.

Creates an order after backend validation.

Backend must verify:

- authenticated user
- food court
- food items
- availability
- quantities
- pickup slot
- slot capacity
- prices
- final total

### GET `/orders/my-orders`

USER.

Returns the authenticated user's orders.

### GET `/orders/:orderId`

Authorized owner/shopkeeper/admin according to role.

Returns order details.

### GET `/shopkeeper/orders`

SHOPKEEPER.

Returns orders belonging to the assigned food court.

### PATCH `/shopkeeper/orders/:orderId/status`

SHOPKEEPER.

Updates an order through an allowed status transition.

## 12. Order Statuses

Expected states:

`CONFIRMED`

`PREPARING`

`READY`

`PICKED_UP`

`EXPIRED`

`CANCELLED`

Normal flow:

`CONFIRMED → PREPARING → READY → PICKED_UP`

Expired orders cannot be picked up.

The pickup policy uses a 15-minute pickup window after the selected pickup time. After the deadline, the order becomes `EXPIRED`. The project policy states no refund after expiry; this must be shown to users before payment.

## 13. Payment

### POST `/payments/create`

Creates a payment order using the configured payment provider.

The server calculates/validates the amount.

### POST `/payments/verify`

Verifies payment server-side.

### POST `/payments/webhook`

Receives payment-provider webhook events.

Webhook processing must be authenticated and idempotent.

Payment secrets must never be sent to the frontend.

## 14. QR Pickup

### GET `/orders/:orderId/pickup-qr`

Authorized order owner.

Returns the secure QR/token representation needed for pickup.

### POST `/pickup/verify`

SHOPKEEPER.

Validates a pickup token.

The backend must verify:

- token validity
- order existence
- payment state
- food court
- order expiry
- pickup state
- token reuse

On successful verification, the order becomes `PICKED_UP`.

## 15. Admin

### GET `/admin/dashboard`

ADMIN.

### GET `/admin/users`

ADMIN.

### GET `/admin/users/:userId`

ADMIN.

### PATCH `/admin/users/:userId/status`

ADMIN.

### GET `/admin/shopkeepers`

ADMIN.

### GET `/admin/shopkeepers/:id`

ADMIN.

### POST `/admin/shopkeepers/:id/approve`

ADMIN.

### POST `/admin/shopkeepers/:id/reject`

ADMIN.

### PATCH `/admin/shopkeepers/:id/status`

ADMIN.

### GET `/admin/food-courts`

ADMIN.

### POST `/admin/food-courts`

ADMIN.

### GET `/admin/food-courts/:id`

ADMIN.

### PUT `/admin/food-courts/:id`

ADMIN.

### PATCH `/admin/food-courts/:id/status`

ADMIN.

### GET `/admin/orders`

ADMIN.

### GET `/admin/orders/:orderId`

ADMIN.

## 16. Analytics

### Admin

- `GET /analytics/admin/overview`
- `GET /analytics/admin/revenue`
- `GET /analytics/admin/orders`
- `GET /analytics/admin/food-courts`
- `GET /analytics/admin/popular-food`
- `GET /analytics/admin/peak-hours`

### Shopkeeper

- `GET /analytics/shopkeeper/overview`
- `GET /analytics/shopkeeper/orders`
- `GET /analytics/shopkeeper/revenue`
- `GET /analytics/shopkeeper/popular-food`
- `GET /analytics/shopkeeper/pickup-demand`
- `GET /analytics/shopkeeper/waste`

## 17. Food Waste

### POST `/shopkeeper/food-waste`

SHOPKEEPER.

Records waste information.

### GET `/shopkeeper/food-waste`

SHOPKEEPER.

Returns waste records for the assigned food court.

### GET `/analytics/shopkeeper/waste`

SHOPKEEPER.

Returns waste analytics.

## 18. Notifications

### GET `/notifications`

Authenticated.

### PATCH `/notifications/:id/read`

Authenticated owner.

## 19. ML Demand Prediction

### POST `/predict-demand`

The Node.js backend-facing endpoint for demand prediction.

The backend may proxy this request to the Python FastAPI ML service.

The ML service must validate inputs and return prediction data without changing inventory automatically.

## 20. Socket.IO Events

Events:

- `ORDER_CONFIRMED`
- `ORDER_PREPARING`
- `ORDER_READY`
- `ORDER_PICKED_UP`
- `ORDER_EXPIRED`
- `NEW_ORDER`
- `ORDER_CANCELLED`

Event payloads must be documented in implementation before production use and must not contain secrets.

## 21. API Ownership

| Area | Primary owner |
|---|---|
| Auth/RBAC | Member 1 |
| Core user/order APIs | Member 3 |
| Food courts | Member 3 |
| Food items | Member 3 + Member 5 |
| Pickup slots | Member 3 + Member 5 |
| Admin | Member 4 + Member 3 |
| Shopkeeper | Member 5 + Member 3 |
| Payment | Member 6 + Member 3 |
| QR | Member 5 + Member 3 |
| Analytics | Member 6 + Member 3 |
| ML | Member 6 |
| Notifications | Member 1 + Member 3 |
| Socket.IO | Member 1 + Member 5 |

## 22. Contract Rules

1. No silent endpoint changes.
2. No duplicate APIs.
3. No direct frontend-to-database connection.
4. No secrets in frontend.
5. Backend calculates authoritative totals.
6. Backend verifies payment.
7. Backend verifies QR pickup.
8. Shopkeepers access only their assigned food court.
9. Users access only their own orders.
10. Admin has system-wide access.
11. Protected APIs require authentication.
12. New APIs must be added here before frontend integration.
