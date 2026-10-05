const orderService = require('../services/orderService');

/**
 * Periodically flips overdue CONFIRMED/PREPARING/READY orders to EXPIRED
 * and releases their inventory + slot capacity. This is the server-side
 * enforcement required by ARCHITECTURE.md section 11 and the MEMBER 3
 * brief section 7 ("Do not rely on frontend timers").
 */
function startOrderExpirySweep() {
  const intervalMs = parseInt(process.env.ORDER_EXPIRY_SWEEP_INTERVAL_MS, 10) || 60000;

  const tick = async () => {
    try {
      const count = await orderService.expireOverdueOrders();
      if (count > 0) {
        console.log(`[order-expiry] Expired ${count} overdue order(s).`);
      }
    } catch (err) {
      console.error('[order-expiry] Sweep failed:', err.message);
    }
  };

  tick(); // run once at startup
  const handle = setInterval(tick, intervalMs);
  return handle;
}

module.exports = { startOrderExpirySweep };
