-- University Food Pre-Booking System — Database Schema
-- Source of truth: DATABASE_SCHEMA.md (v1.0)
-- Single MySQL database, single shared schema. Do not duplicate tables.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- users
-- =========================================================
CREATE TABLE IF NOT EXISTS users (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  phone          VARCHAR(20)  NULL,
  password_hash  VARCHAR(255) NOT NULL,
  role           ENUM('ADMIN','SHOPKEEPER','USER') NOT NULL DEFAULT 'USER',
  status         ENUM('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- food_courts
-- =========================================================
CREATE TABLE IF NOT EXISTS food_courts (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(150) NOT NULL,
  description    TEXT NULL,
  location       VARCHAR(255) NULL,
  opening_time   TIME NOT NULL,
  closing_time   TIME NOT NULL,
  status         ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_food_courts_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- shopkeeper_assignments
-- =========================================================
CREATE TABLE IF NOT EXISTS shopkeeper_assignments (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  shopkeeper_id  BIGINT UNSIGNED NOT NULL,
  food_court_id  BIGINT UNSIGNED NOT NULL,
  status         ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_sa_shopkeeper (shopkeeper_id),
  KEY idx_sa_food_court (food_court_id),
  CONSTRAINT fk_sa_shopkeeper FOREIGN KEY (shopkeeper_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sa_food_court FOREIGN KEY (food_court_id) REFERENCES food_courts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- food_items
-- =========================================================
CREATE TABLE IF NOT EXISTS food_items (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  food_court_id       BIGINT UNSIGNED NOT NULL,
  name                VARCHAR(180) NOT NULL,
  description         TEXT NULL,
  category            VARCHAR(100) NULL,
  price               DECIMAL(10,2) NOT NULL,
  quantity_available  INT NOT NULL DEFAULT 0,
  is_available        BOOLEAN NOT NULL DEFAULT TRUE,
  image_url           VARCHAR(500) NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_food_items_food_court (food_court_id),
  KEY idx_food_items_is_available (is_available),
  CONSTRAINT fk_food_items_food_court FOREIGN KEY (food_court_id) REFERENCES food_courts(id) ON DELETE CASCADE,
  CONSTRAINT chk_food_items_qty CHECK (quantity_available >= 0),
  CONSTRAINT chk_food_items_price CHECK (price >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- pickup_slots
-- =========================================================
CREATE TABLE IF NOT EXISTS pickup_slots (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  food_court_id  BIGINT UNSIGNED NOT NULL,
  slot_date      DATE NOT NULL,
  start_time     TIME NOT NULL,
  end_time       TIME NOT NULL,
  capacity       INT NOT NULL,
  booked_count   INT NOT NULL DEFAULT 0,
  status         ENUM('ACTIVE','INACTIVE','FULL') NOT NULL DEFAULT 'ACTIVE',
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_slots_food_court_date (food_court_id, slot_date),
  CONSTRAINT fk_slots_food_court FOREIGN KEY (food_court_id) REFERENCES food_courts(id) ON DELETE CASCADE,
  CONSTRAINT chk_slots_capacity CHECK (capacity > 0),
  CONSTRAINT chk_slots_booked CHECK (booked_count >= 0),
  CONSTRAINT chk_slots_booked_le_capacity CHECK (booked_count <= capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- orders
-- =========================================================
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id          BIGINT UNSIGNED NOT NULL,
  food_court_id    BIGINT UNSIGNED NOT NULL,
  pickup_slot_id   BIGINT UNSIGNED NOT NULL,
  order_number     VARCHAR(50) NOT NULL,
  subtotal         DECIMAL(10,2) NOT NULL,
  total_amount     DECIMAL(10,2) NOT NULL,
  payment_status   ENUM('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  status           ENUM('CONFIRMED','PREPARING','READY','PICKED_UP','EXPIRED','CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
  pickup_deadline  DATETIME NOT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_order_number (order_number),
  KEY idx_orders_user (user_id),
  KEY idx_orders_food_court (food_court_id),
  KEY idx_orders_status (status),
  KEY idx_orders_created_at (created_at),
  KEY idx_orders_pickup_slot (pickup_slot_id),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_orders_food_court FOREIGN KEY (food_court_id) REFERENCES food_courts(id),
  CONSTRAINT fk_orders_pickup_slot FOREIGN KEY (pickup_slot_id) REFERENCES pickup_slots(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- order_items
-- =========================================================
CREATE TABLE IF NOT EXISTS order_items (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id              BIGINT UNSIGNED NOT NULL,
  food_item_id          BIGINT UNSIGNED NOT NULL,
  item_name_snapshot    VARCHAR(180) NOT NULL,
  unit_price_snapshot   DECIMAL(10,2) NOT NULL,
  quantity              INT NOT NULL,
  line_total            DECIMAL(10,2) NOT NULL,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_food_item (food_item_id),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id),
  CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- payments
-- =========================================================
CREATE TABLE IF NOT EXISTS payments (
  id                    BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id              BIGINT UNSIGNED NOT NULL,
  provider              VARCHAR(50) NOT NULL,
  provider_order_id     VARCHAR(150) NULL,
  provider_payment_id   VARCHAR(150) NULL,
  amount                DECIMAL(10,2) NOT NULL,
  status                ENUM('CREATED','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'CREATED',
  signature_verified    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_order (order_id),
  KEY idx_payments_provider_payment_id (provider_payment_id),
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- pickup_tokens
-- =========================================================
CREATE TABLE IF NOT EXISTS pickup_tokens (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     BIGINT UNSIGNED NOT NULL,
  token_hash   VARCHAR(255) NOT NULL,
  expires_at   DATETIME NOT NULL,
  used_at      DATETIME NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pickup_tokens_order (order_id),
  CONSTRAINT fk_pickup_tokens_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- notifications
-- =========================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        VARCHAR(80) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user_read (user_id, is_read),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- food_waste
-- =========================================================
CREATE TABLE IF NOT EXISTS food_waste (
  id                   BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  food_court_id        BIGINT UNSIGNED NOT NULL,
  food_item_id         BIGINT UNSIGNED NOT NULL,
  waste_date           DATE NOT NULL,
  prepared_quantity    INT NOT NULL,
  sold_quantity        INT NOT NULL,
  remaining_quantity   INT NOT NULL,
  wasted_quantity      INT NOT NULL,
  recorded_by          BIGINT UNSIGNED NOT NULL,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_waste_food_court_date (food_court_id, waste_date),
  CONSTRAINT fk_waste_food_court FOREIGN KEY (food_court_id) REFERENCES food_courts(id) ON DELETE CASCADE,
  CONSTRAINT fk_waste_food_item FOREIGN KEY (food_item_id) REFERENCES food_items(id),
  CONSTRAINT fk_waste_recorded_by FOREIGN KEY (recorded_by) REFERENCES users(id),
  CONSTRAINT chk_waste_nonneg CHECK (
    prepared_quantity >= 0 AND sold_quantity >= 0 AND remaining_quantity >= 0 AND wasted_quantity >= 0
  ),
  CONSTRAINT chk_waste_le_prepared CHECK (wasted_quantity <= prepared_quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- audit_logs
-- =========================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id   BIGINT UNSIGNED NOT NULL,
  action          VARCHAR(100) NOT NULL,
  resource_type   VARCHAR(100) NOT NULL,
  resource_id     BIGINT UNSIGNED NULL,
  metadata_json   JSON NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
