/* eslint-disable no-console */
require('dotenv').config();
const http = require('http');
const jwt = require('jsonwebtoken');
const app = require('../app');
const { sequelize, User, FoodCourt, FoodItem, PickupSlot } = require('../models');

const PORT = 5098;

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
        res.on('data', (c) => (raw += c));
        res.on('end', () => {
          let json = null;
          try {
            json = raw ? JSON.parse(raw) : null;
          } catch (e) {}
          resolve({ status: res.statusCode, body: json });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  await sequelize.authenticate();
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 200));

  const user = await User.findOne({ where: { email: 'student1@university.edu' } });
  const foodCourt = await FoodCourt.findOne({ where: { name: 'Main Campus Food Court' } });
  const thali = await FoodItem.findOne({ where: { food_court_id: foodCourt.id, name: 'Veg Thali' } });

  // Fresh item with exactly 5 units in stock.
  const limited = await FoodItem.create({
    food_court_id: foodCourt.id,
    name: 'Race Condition Special',
    price: 50,
    quantity_available: 5,
    is_available: true,
  });

  // Fresh slot with capacity 100 (so slot capacity isn't the bottleneck —
  // we're isolating inventory race protection here).
  const slot = await PickupSlot.create({
    food_court_id: foodCourt.id,
    slot_date: new Date().toISOString().slice(0, 10),
    start_time: '23:50:00',
    end_time: '23:59:00',
    capacity: 100,
    booked_count: 0,
    status: 'ACTIVE',
  });

  const token = tokenFor(user);

  // Fire 10 concurrent requests, each trying to order 1 unit, against a
  // stock of 5. Exactly 5 should succeed; the rest must be rejected, and
  // final stock must be exactly 0 (never negative).
  const concurrency = 10;
  const requests = Array.from({ length: concurrency }, () =>
    request('POST', '/api/orders', {
      token,
      body: {
        foodCourtId: foodCourt.id,
        pickupSlotId: slot.id,
        items: [{ foodItemId: limited.id, quantity: 1 }],
      },
    })
  );

  const results = await Promise.all(requests);
  const successCount = results.filter((r) => r.status === 201).length;
  const failCount = results.filter((r) => r.status !== 201).length;

  const finalItem = await FoodItem.findByPk(limited.id);

  console.log(`Concurrent requests: ${concurrency}`);
  console.log(`Succeeded: ${successCount}, Rejected: ${failCount}`);
  console.log(`Final quantity_available: ${finalItem.quantity_available}`);

  let ok = true;
  if (successCount !== 5) {
    console.log(`FAIL: expected exactly 5 successful orders, got ${successCount}`);
    ok = false;
  } else {
    console.log('PASS: exactly 5 of 10 concurrent orders succeeded');
  }
  if (finalItem.quantity_available !== 0) {
    console.log(`FAIL: expected final stock 0, got ${finalItem.quantity_available}`);
    ok = false;
  } else {
    console.log('PASS: final stock is exactly 0 (no overselling, no negative stock)');
  }

  server.close();
  await sequelize.close();
  process.exit(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error('Concurrency test crashed:', err);
  await sequelize.close();
  process.exit(1);
});
