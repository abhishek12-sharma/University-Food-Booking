import api from '../utils/api';

/**
 * Order endpoints — API_CONTRACT.md section 11.
 *
 * The backend is authoritative for pricing, availability, and slot
 * capacity (DEVELOPMENT_RULES.md section 10). This service only sends
 * what the user selected; it never computes or sends a final total.
 */
const orderApi = {
  /**
   * payload shape (server re-validates everything, per API_CONTRACT.md
   * section 11):
   * {
   *   foodCourtId,
   *   pickupSlotId,
   *   items: [{ foodItemId, quantity }]
   * }
   */
  create(payload) {
    return api.post('/orders', payload);
  },

  getMyOrders() {
    return api.get('/orders/my-orders');
  },

  getById(orderId) {
    return api.get(`/orders/${orderId}`);
  },
};

export default orderApi;
