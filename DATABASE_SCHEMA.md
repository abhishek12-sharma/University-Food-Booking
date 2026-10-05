# University Food Pre-Booking System — Database Schema

**Version:** 1.0  
**Database:** MySQL  
**Purpose:** Shared database contract for all developers

## 1. Database Principles

- MySQL is the single system-of-record database.
- Do not create separate databases per developer.
- Use foreign keys and indexes.
- Store timestamps consistently.
- Monetary values should use `DECIMAL`, not floating point.
- Passwords are stored only as secure hashes.
- Never store payment secrets.
- Backend owns database access.
- Schema changes require team agreement.

## 2. Core Tables

### users

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto increment |
| name | VARCHAR(120) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | NULL/UNIQUE if required |
| password_hash | VARCHAR(255) | NOT NULL |
| role | ENUM | ADMIN, SHOPKEEPER, USER |
| status | ENUM | ACTIVE, INACTIVE, SUSPENDED |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### food_courts

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| name | VARCHAR(150) | UNIQUE, NOT NULL |
| description | TEXT | NULL |
| location | VARCHAR(255) | NULL |
| opening_time | TIME | NOT NULL |
| closing_time | TIME | NOT NULL |
| status | ENUM | ACTIVE, INACTIVE |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### shopkeeper_assignments

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| shopkeeper_id | BIGINT | FK users.id |
| food_court_id | BIGINT | FK food_courts.id |
| status | ENUM | ACTIVE, INACTIVE |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

A shopkeeper's access is determined by this assignment.

### food_items

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| food_court_id | BIGINT | FK |
| name | VARCHAR(180) | NOT NULL |
| description | TEXT | NULL |
| category | VARCHAR(100) | NULL |
| price | DECIMAL(10,2) | NOT NULL |
| quantity_available | INT | NOT NULL, >= 0 |
| is_available | BOOLEAN | NOT NULL |
| image_url | VARCHAR(500) | NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### pickup_slots

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| food_court_id | BIGINT | FK |
| slot_date | DATE | NOT NULL |
| start_time | TIME | NOT NULL |
| end_time | TIME | NOT NULL |
| capacity | INT | NOT NULL, > 0 |
| booked_count | INT | NOT NULL, >= 0 |
| status | ENUM | ACTIVE, INACTIVE, FULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Use transactions when reserving capacity.

### orders

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK |
| food_court_id | BIGINT | FK |
| pickup_slot_id | BIGINT | FK |
| order_number | VARCHAR(50) | UNIQUE, NOT NULL |
| subtotal | DECIMAL(10,2) | NOT NULL |
| total_amount | DECIMAL(10,2) | NOT NULL |
| payment_status | ENUM | PENDING, PAID, FAILED, REFUNDED |
| status | ENUM | CONFIRMED, PREPARING, READY, PICKED_UP, EXPIRED, CANCELLED |
| pickup_deadline | DATETIME | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

### order_items

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| order_id | BIGINT | FK |
| food_item_id | BIGINT | FK |
| item_name_snapshot | VARCHAR(180) | NOT NULL |
| unit_price_snapshot | DECIMAL(10,2) | NOT NULL |
| quantity | INT | NOT NULL, > 0 |
| line_total | DECIMAL(10,2) | NOT NULL |

Snapshots preserve what the user ordered even if the menu later changes.

### payments

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| order_id | BIGINT | FK |
| provider | VARCHAR(50) | NOT NULL |
| provider_order_id | VARCHAR(150) | NULL |
| provider_payment_id | VARCHAR(150) | NULL |
| amount | DECIMAL(10,2) | NOT NULL |
| status | ENUM | CREATED, PAID, FAILED, REFUNDED |
| signature_verified | BOOLEAN | NOT NULL |
| created_at | DATETIME | NOT NULL |
| updated_at | DATETIME | NOT NULL |

Never store provider secret keys.

### pickup_tokens

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| order_id | BIGINT | UNIQUE FK |
| token_hash | VARCHAR(255) | NOT NULL |
| expires_at | DATETIME | NOT NULL |
| used_at | DATETIME | NULL |
| created_at | DATETIME | NOT NULL |

Prefer storing a secure hash of the pickup token rather than the raw token.

### notifications

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| user_id | BIGINT | FK |
| type | VARCHAR(80) | NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | NOT NULL |
| created_at | DATETIME | NOT NULL |

### food_waste

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| food_court_id | BIGINT | FK |
| food_item_id | BIGINT | FK |
| waste_date | DATE | NOT NULL |
| prepared_quantity | INT | NOT NULL |
| sold_quantity | INT | NOT NULL |
| remaining_quantity | INT | NOT NULL |
| wasted_quantity | INT | NOT NULL |
| recorded_by | BIGINT | FK users.id |
| created_at | DATETIME | NOT NULL |

### audit_logs

| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK |
| actor_user_id | BIGINT | FK users.id |
| action | VARCHAR(100) | NOT NULL |
| resource_type | VARCHAR(100) | NOT NULL |
| resource_id | BIGINT | NULL |
| metadata_json | JSON | NULL |
| created_at | DATETIME | NOT NULL |

## 3. Relationships

```text
users
 ├── shopkeeper_assignments ──> food_courts
 ├── orders ──> food_courts
 ├── notifications
 └── audit_logs

food_courts
 ├── food_items
 ├── pickup_slots
 ├── orders
 ├── shopkeeper_assignments
 └── food_waste

orders
 ├── order_items
 ├── payments
 └── pickup_tokens

food_items
 ├── order_items
 └── food_waste
```

## 4. Critical Constraints

### Inventory

`quantity_available >= 0`

### Pickup capacity

`booked_count <= capacity`

### Waste

All quantities must be non-negative.

`wasted_quantity <= prepared_quantity`

### Order item

`quantity > 0`

### Money

Use `DECIMAL(10,2)`.

## 5. Indexes

Recommended indexes:

- users.email
- users.role
- food_items.food_court_id
- food_items.is_available
- pickup_slots.food_court_id + slot_date
- orders.user_id
- orders.food_court_id
- orders.status
- orders.created_at
- orders.pickup_slot_id
- payments.order_id
- payments.provider_payment_id
- notifications.user_id + is_read
- food_waste.food_court_id + waste_date

## 6. Transaction Requirements

Use database transactions for:

- Order creation
- Inventory deduction/reservation
- Pickup slot capacity reservation
- Pickup confirmation
- Payment state changes where multiple records must remain consistent

## 7. Schema Change Rule

Any schema change must:

1. Be discussed with the team.
2. Update this document.
3. Include a migration.
4. Preserve existing data where required.
5. Be tested before merge.
