/* eslint-disable no-console */
require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, User, FoodCourt, FoodItem, PickupSlot, ShopkeeperAssignment, Order } = require('../models');

const PORT = 5099;
let server;
let failures = 0;
let passed = 0;

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

function request(method, path, { token, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        host: 'localhost',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch (e) {
            /* ignore */
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function check(name, condition, extra) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}`, extra !== undefined ? JSON.stringify(extra) : '');
  }
}

async function main() {
  await sequelize.authenticate();
  server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 200));

  const admin = await User.findOne({ where: { email: 'admin@university.edu' } });
  const shopkeeper = await User.findOne({ where: { email: 'shopkeeper1@university.edu' } });
  const shopkeeper2 = await User.findOne({ where: { email: 'shopkeeper2@university.edu' } });
  const user = await User.findOne({ where: { email: 'student1@university.edu' } });
  const foodCourt = await FoodCourt.findOne({ where: { name: 'Main Campus Food Court' } });
  const otherFoodCourt = await FoodCourt.findOne({ where: { name: 'Hostel Food Court' } });
  const samosa = await FoodItem.findOne({ where: { food_court_id: foodCourt.id, name: 'Samosa' } });
  const thali = await FoodItem.findOne({ where: { food_court_id: foodCourt.id, name: 'Veg Thali' } });

  // Reset samosa stock to a known value (3) and slot booking to 0 before running,
  // so repeated smoke test runs are deterministic.
  samosa.quantity_available = 3;
  samosa.is_available = true;
  await samosa.save();

  const slot = await PickupSlot.findOne({
    where: { food_court_id: foodCourt.id, start_time: '23:00:00' },
    order: [['id', 'DESC']],
  });
  slot.booked_count = 0;
  slot.capacity = 2;
  slot.status = 'ACTIVE';
  await slot.save();

  // Clean up any orders from previous runs referencing this slot so capacity
  // math stays deterministic across repeated smoke-test runs.
  await Order.destroy({ where: { pickup_slot_id: slot.id } });

  const userToken = tokenFor(user);
  const shopkeeperToken = tokenFor(shopkeeper);
  const shopkeeper2Token = tokenFor(shopkeeper2);
  const adminToken = tokenFor(admin);

  console.log('\n--- Food Courts ---');
  {
    const res = await request('GET', '/api/food-courts');
    check('GET /api/food-courts returns 200', res.status === 200, res.body);
    check('response envelope has success/message/data', res.body && res.body.success === true && 'data' in res.body);
  }
  {
    const res = await request('GET', `/api/food-courts/${foodCourt.id}`);
    check('GET /api/food-courts/:id returns the right court', res.status === 200 && res.body.data.foodCourt.id === foodCourt.id);
  }
  {
    const res = await request('GET', '/api/food-courts/999999');
    check('GET /api/food-courts/:id 404s for unknown id', res.status === 404 && res.body.success === false);
  }

  console.log('\n--- Food Items ---');
  {
    const res = await request('GET', `/api/food-courts/${foodCourt.id}/food-items`);
    check('GET food items for court returns list', res.status === 200 && Array.isArray(res.body.data.foodItems));
  }
  {
    // Shopkeeper 2 must not be able to create an item in shopkeeper 1's food court.
    const res = await request('POST', '/api/shopkeeper/food-items', {
      token: shopkeeper2Token,
      body: { foodCourtId: foodCourt.id, name: 'Sneaky Item', price: 10, quantityAvailable: 5 },
    });
    check('shopkeeper cannot create item in unassigned food court (403)', res.status === 403, res.body);
  }
  {
    const res = await request('POST', '/api/shopkeeper/food-items', {
      token: shopkeeperToken,
      body: { foodCourtId: foodCourt.id, name: 'Test Cold Coffee', price: 40, quantityAvailable: 10 },
    });
    check('shopkeeper can create item in own food court (201)', res.status === 201, res.body);
  }
  {
    // negative price rejected
    const res = await request('POST', '/api/shopkeeper/food-items', {
      token: shopkeeperToken,
      body: { foodCourtId: foodCourt.id, name: 'Bad Item', price: -5, quantityAvailable: 5 },
    });
    check('negative price rejected (422)', res.status === 422, res.body);
  }
  {
    // unauthenticated write rejected
    const res = await request('POST', '/api/shopkeeper/food-items', {
      body: { foodCourtId: foodCourt.id, name: 'No Auth Item', price: 10, quantityAvailable: 5 },
    });
    check('unauthenticated shopkeeper write rejected (401)', res.status === 401, res.body);
  }
  {
    // user role cannot hit shopkeeper endpoint
    const res = await request('POST', '/api/shopkeeper/food-items', {
      token: userToken,
      body: { foodCourtId: foodCourt.id, name: 'User Item', price: 10, quantityAvailable: 5 },
    });
    check('USER role forbidden from shopkeeper endpoint (403)', res.status === 403, res.body);
  }

  console.log('\n--- Pickup Slots ---');
  {
    const res = await request('GET', `/api/food-courts/${foodCourt.id}/pickup-slots`);
    check('GET pickup slots for court returns list', res.status === 200 && Array.isArray(res.body.data.pickupSlots));
  }

  console.log('\n--- Orders: core flow, pricing integrity, inventory ---');
  let orderId;
  {
    // Client tries to lie about price/total — backend must ignore it.
    const res = await request('POST', '/api/orders', {
      token: userToken,
      body: {
        foodCourtId: foodCourt.id,
        pickupSlotId: slot.id,
        items: [{ foodItemId: samosa.id, quantity: 2, price: 1 }], // fake price, should be ignored
        total: 1,
      },
    });
    check('order creation succeeds (201)', res.status === 201, res.body);
    const expectedSubtotal = (parseFloat(samosa.price) * 2).toFixed(2);
    check(
      'server-calculated subtotal ignores client price',
      res.body && res.body.data.order.subtotal.toString() === expectedSubtotal,
      { got: res.body && res.body.data.order.subtotal, expected: expectedSubtotal }
    );
    check('order status starts CONFIRMED', res.body.data.order.status === 'CONFIRMED');
    orderId = res.body.data.order.id;
  }
  {
    const freshSamosa = await FoodItem.findByPk(samosa.id);
    check('inventory decremented by ordered quantity', freshSamosa.quantity_available === 1, {
      got: freshSamosa.quantity_available,
    });
  }
  {
    const freshSlot = await PickupSlot.findByPk(slot.id);
    check('slot booked_count incremented', freshSlot.booked_count === 1, { got: freshSlot.booked_count });
  }
  {
    // Order more than available stock (only 1 left) -> should fail, and not partially reserve.
    const res = await request('POST', '/api/orders', {
      token: userToken,
      body: {
        foodCourtId: foodCourt.id,
        pickupSlotId: slot.id,
        items: [{ foodItemId: samosa.id, quantity: 5 }],
      },
    });
    check('ordering more than available stock is rejected (409)', res.status === 409, res.body);
    const freshSamosa = await FoodItem.findByPk(samosa.id);
    check('failed order did not touch inventory (still 1 left)', freshSamosa.quantity_available === 1, {
      got: freshSamosa.quantity_available,
    });
  }
  {
    // Second legit order consumes the slot's remaining capacity (capacity=2, 1 used).
    const res = await request('POST', '/api/orders', {
      token: userToken,
      body: {
        foodCourtId: foodCourt.id,
        pickupSlotId: slot.id,
        items: [{ foodItemId: thali.id, quantity: 1 }],
      },
    });
    check('second order fills remaining slot capacity (201)', res.status === 201, res.body);
  }
  {
    // Third order should be rejected: slot now FULL (capacity 2, booked 2).
    const res = await request('POST', '/api/orders', {
      token: userToken,
      body: {
        foodCourtId: foodCourt.id,
        pickupSlotId: slot.id,
        items: [{ foodItemId: thali.id, quantity: 1 }],
      },
    });
    check('overbooking a full slot is rejected (409/422)', res.status === 409 || res.status === 422, res.body);
  }

  console.log('\n--- Orders: authorization ---');
  {
    const res = await request('GET', `/api/orders/${orderId}`, { token: userToken });
    check('owner can view their own order', res.status === 200 && res.body.data.order.id === orderId);
  }
  {
    // A different user cannot view someone else's order.
    const outsider = await User.findOrCreate({
      where: { email: 'outsider@university.edu' },
      defaults: { name: 'Outsider', password_hash: 'x', role: 'USER', status: 'ACTIVE' },
    });
    const outsiderToken = tokenFor(outsider[0]);
    const res = await request('GET', `/api/orders/${orderId}`, { token: outsiderToken });
    check('non-owner USER cannot view order (403)', res.status === 403, res.body);
  }
  {
    // shopkeeper2 (different food court) cannot view this order.
    const res = await request('GET', `/api/orders/${orderId}`, { token: shopkeeper2Token });
    check('shopkeeper of a different food court cannot view order (403)', res.status === 403, res.body);
  }
  {
    // shopkeeper1 (correct food court) can view it.
    const res = await request('GET', `/api/orders/${orderId}`, { token: shopkeeperToken });
    check('assigned shopkeeper can view order in their food court', res.status === 200, res.body);
  }
  {
    const res = await request('GET', '/api/orders/my-orders', { token: userToken });
    check('my-orders returns only the caller\'s orders', res.status === 200 && res.body.data.orders.every((o) => o.user_id === user.id));
  }
  {
    const res = await request('GET', '/api/shopkeeper/orders', { token: shopkeeperToken });
    check(
      'shopkeeper orders list scoped to assigned food court',
      res.status === 200 && res.body.data.orders.every((o) => o.food_court_id === foodCourt.id)
    );
  }

  console.log('\n--- Orders: status transitions ---');
  {
    // Invalid transition: CONFIRMED -> READY (must go through PREPARING first).
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'READY' },
    });
    check('invalid status transition rejected (422)', res.status === 422, res.body);
  }
  {
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'PREPARING' },
    });
    check('valid transition CONFIRMED -> PREPARING accepted', res.status === 200 && res.body.data.order.status === 'PREPARING', res.body);
  }
  {
    // Wrong shopkeeper cannot update this order's status.
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeper2Token,
      body: { status: 'READY' },
    });
    check('unassigned shopkeeper cannot update order status (403)', res.status === 403, res.body);
  }
  {
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'READY' },
    });
    check('valid transition PREPARING -> READY accepted', res.status === 200 && res.body.data.order.status === 'READY', res.body);
  }
  {
    // Direct PICKED_UP from READY should be allowed (precondition satisfied).
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'PICKED_UP' },
    });
    check('valid transition READY -> PICKED_UP accepted', res.status === 200 && res.body.data.order.status === 'PICKED_UP', res.body);
  }
  {
    // Terminal state: no further transitions allowed.
    const res = await request('PATCH', `/api/shopkeeper/orders/${orderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'PREPARING' },
    });
    check('no transition allowed out of PICKED_UP (422)', res.status === 422, res.body);
  }

  console.log('\n--- Orders: expiry ---');
  {
    // Create a second order on a fresh slot, then force its pickup_deadline
    // into the past and run the expiry sweep logic directly.
    const slot2 = await PickupSlot.create({
      food_court_id: foodCourt.id,
      slot_date: new Date().toISOString().slice(0, 10),
      start_time: '23:45:00', // must be in the future so order creation succeeds;
      end_time: '23:59:00',   // deadline is manually pushed into the past below.
      capacity: 1,
      booked_count: 0,
      status: 'ACTIVE',
    });
    const createRes = await request('POST', '/api/orders', {
      token: userToken,
      body: { foodCourtId: foodCourt.id, pickupSlotId: slot2.id, items: [{ foodItemId: thali.id, quantity: 1 }] },
    });
    check('expiry-test order created', createRes.status === 201, createRes.body);
    const expiringOrderId = createRes.body.data.order.id;

    const orderRow = await Order.findByPk(expiringOrderId);
    orderRow.pickup_deadline = new Date(Date.now() - 60 * 1000); // 1 minute in the past
    await orderRow.save();

    const orderService = require('../services/orderService');
    const expiredCount = await orderService.expireOverdueOrders();
    check('expiry sweep expires at least the overdue order', expiredCount >= 1, { expiredCount });

    const afterSweep = await Order.findByPk(expiringOrderId);
    check('overdue order flipped to EXPIRED', afterSweep.status === 'EXPIRED', { status: afterSweep.status });

    const freshSlot2 = await PickupSlot.findByPk(slot2.id);
    check('expired order released its slot capacity', freshSlot2.booked_count === 0, { got: freshSlot2.booked_count });

    // Expired order cannot be picked up.
    const pickupAttempt = await request('PATCH', `/api/shopkeeper/orders/${expiringOrderId}/status`, {
      token: shopkeeperToken,
      body: { status: 'READY' },
    });
    check('expired order cannot transition further (422)', pickupAttempt.status === 422, pickupAttempt.body);
  }

  console.log('\n--- Admin/system-wide access ---');
  {
    const res = await request('GET', `/api/orders/${orderId}`, { token: adminToken });
    check('ADMIN can view any order', res.status === 200, res.body);
  }

  console.log(`\n${passed} passed, ${failures} failed.`);
  server.close();
  await sequelize.close();
  process.exit(failures > 0 ? 1 : 0);
}

main().catch(async (err) => {
  console.error('Smoke test crashed:', err);
  if (server) server.close();
  await sequelize.close();
  process.exit(1);
});
