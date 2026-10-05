import api from '../utils/api';

/**
 * Payment endpoints the user frontend is allowed to call —
 * API_CONTRACT.md section 13.
 *
 * POST /payments/webhook is provider-to-backend only and must never be
 * called from the browser. The frontend never decides payment success;
 * it only starts the payment and asks the backend to verify it
 * (DEVELOPMENT_RULES.md section 11).
 */
const paymentApi = {
  create(orderId) {
    return api.post('/payments/create', { orderId });
  },

  verify(payload) {
    // payload: whatever the configured gateway returns to the client
    // (e.g. provider_order_id, provider_payment_id, signature). The
    // backend, not this file, decides what counts as valid.
    return api.post('/payments/verify', payload);
  },
};

export default paymentApi;
