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

const SLOT_TIMES = [
  { start: '10:30:00', end: '10:45:00' },
  { start: '11:00:00', end: '11:15:00' },
  { start: '11:30:00', end: '11:45:00' },
  { start: '12:00:00', end: '12:15:00' },
  { start: '12:30:00', end: '12:45:00' },
  { start: '13:00:00', end: '13:15:00' },
  { start: '13:30:00', end: '13:45:00' },
  { start: '14:00:00', end: '14:15:00' },
  { start: '14:30:00', end: '14:45:00' },
  { start: '18:00:00', end: '18:15:00' },
  { start: '18:30:00', end: '18:45:00' },
  { start: '19:00:00', end: '19:15:00' },
  { start: '23:00:00', end: '23:30:00' },
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
            capacity: 20,
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
