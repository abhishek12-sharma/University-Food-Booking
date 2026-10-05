/**
 * QR / Pickup verification API — maps to API_CONTRACT.md section 14.
 * The frontend never decides whether a pickup is valid; it only sends
 * the scanned token and presents the backend's verdict.
 */

import api from '../utils/api';

/**
 * Verify a pickup QR token scanned by the shopkeeper.
 * Sends the raw token string to POST /pickup/verify.
 * On success the backend marks the order as PICKED_UP.
 */
export function verifyPickupToken(token) {
  return api.post('/pickup/verify', { token });
}

/**
 * Get a QR token for an order (user-facing).
 * Called from the user's order detail page.
 * GET /api/orders/:orderId/pickup-qr
 */
export function getPickupQRToken(orderId) {
  return api.get(`/orders/${orderId}/pickup-qr`);
}
