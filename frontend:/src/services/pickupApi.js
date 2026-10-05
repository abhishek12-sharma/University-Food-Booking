import api from '../utils/api';

/**
 * Pickup slot + QR endpoints relevant to the user module.
 * API_CONTRACT.md sections 10 and 14.
 * Slot creation (POST/PATCH /shopkeeper/pickup-slots) belongs to the
 * shopkeeper module and is intentionally not included here.
 */
const pickupApi = {
  getSlotsByFoodCourt(foodCourtId) {
    return api.get(`/food-courts/${foodCourtId}/pickup-slots`);
  },

  getPickupQr(orderId) {
    return api.get(`/orders/${orderId}/pickup-qr`);
  },
};

export default pickupApi;
