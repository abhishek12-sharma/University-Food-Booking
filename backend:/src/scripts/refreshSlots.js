/**
 * Refresh pickup slots so each active food court always has
 * 14 days of slots starting from today.
 *
 * Safe to run any time — uses upsert (findOrCreate) so it never
 * duplicates an existing slot and never deletes old rows.
 *
 * Usage:  node src/scripts/refreshSlots.js
 *    or:  npm run refresh-slots   (if added to package.json)
 */

require('dotenv').config();
const { sequelize, FoodCourt, PickupSlot } = require('../models');

const DAYS_AHEAD = 14; // how many days of slots to ensure exist

// 30-minute pickup slots from 10:00 AM to 9:00 PM
const SLOT_TIMES = [
  { start: '10:00:00', end: '10:30:00' },
  { start: '10:30:00', end: '11:00:00' },
  { start: '11:00:00', end: '11:30:00' },
  { start: '11:30:00', end: '12:00:00' },
  { start: '12:00:00', end: '12:30:00' },
  { start: '12:30:00', end: '13:00:00' },
  { start: '13:00:00', end: '13:30:00' },
  { start: '13:30:00', end: '14:00:00' },
  { start: '14:00:00', end: '14:30:00' },
  { start: '14:30:00', end: '15:00:00' },
  { start: '15:00:00', end: '15:30:00' },
  { start: '15:30:00', end: '16:00:00' },
  { start: '16:00:00', end: '16:30:00' },
  { start: '16:30:00', end: '17:00:00' },
  { start: '17:00:00', end: '17:30:00' },
  { start: '17:30:00', end: '18:00:00' },
  { start: '18:00:00', end: '18:30:00' },
  { start: '18:30:00', end: '19:00:00' },
  { start: '19:00:00', end: '19:30:00' },
  { start: '19:30:00', end: '20:00:00' },
  { start: '20:00:00', end: '20:30:00' },
  { start: '20:30:00', end: '21:00:00' },
  { start: '21:00:00', end: '21:30:00' },
];

/** Returns 'YYYY-MM-DD' in local time for `daysFromNow` days ahead. */
function localDateStr(daysFromNow = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
}

async function refreshSlots() {
  await sequelize.authenticate();
  console.log('DB connected. Refreshing pickup slots...\n');

  // Bump any existing slots that still have the old capacity of 20
  const [updatedCount] = await sequelize.query(
    'UPDATE pickup_slots SET capacity = 100 WHERE capacity = 20'
  );
  console.log(`Updated ${updatedCount} existing slots from capacity 20 → 100\n`);

  const foodCourts = await FoodCourt.findAll({ where: { status: 'ACTIVE' } });

  let created = 0;
  let skipped = 0;

  for (const fc of foodCourts) {
    for (let d = 0; d < DAYS_AHEAD; d++) {
      const slotDate = localDateStr(d);
      for (const t of SLOT_TIMES) {
        const [, wasCreated] = await PickupSlot.findOrCreate({
          where: {
            food_court_id: fc.id,
            slot_date: slotDate,
            start_time: t.start,
          },
          defaults: {
            food_court_id: fc.id,
            slot_date: slotDate,
            start_time: t.start,
            end_time: t.end,
            capacity: 100,
            booked_count: 0,
            status: 'ACTIVE',
          },
        });
        if (wasCreated) created++;
        else skipped++;
      }
    }
    console.log(`✓ ${fc.name} (id=${fc.id})`);
  }

  console.log(`\nDone! Created ${created} new slots, skipped ${skipped} existing.\n`);
  await sequelize.close();
}

refreshSlots().catch((err) => {
  console.error('refreshSlots failed:', err.message);
  process.exit(1);
});
