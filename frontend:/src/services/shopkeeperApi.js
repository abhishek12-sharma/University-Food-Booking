import apiClient from '../utils/api';

// Every function here maps 1:1 to an endpoint in API_CONTRACT.md.
// No endpoint is invented, renamed, or restructured — see DEVELOPMENT_RULES.md
// section 3 ("API Rules"). Backend enforces that a shopkeeper only ever
// receives/affects their own assigned food court (DEVELOPMENT_RULES.md
// section 13); this module does not attempt to filter by food court client-side
// because that would be trusting the frontend for authorization, which the
// contract explicitly forbids (section 22, rule 8).

// ---- Menu management (API_CONTRACT.md section 9) ----

export function createFoodItem(payload) {
  // payload: { name, description, category, price, quantity_available, is_available, image_url }
  return apiClient.post('/shopkeeper/food-items', payload);
}

export function updateFoodItem(foodItemId, payload) {
  return apiClient.put(`/shopkeeper/food-items/${foodItemId}`, payload);
}

export function deleteFoodItem(foodItemId) {
  return apiClient.delete(`/shopkeeper/food-items/${foodItemId}`);
}

export function getFoodCourtItems(foodCourtId) {
  // Public/authenticated read per section 9; used to list the shopkeeper's
  // own menu once foodCourtId is known from the auth profile.
  return apiClient.get(`/food-courts/${foodCourtId}/food-items`);
}

export function getFoodItem(foodItemId) {
  return apiClient.get(`/food-items/${foodItemId}`);
}

// ---- Pickup slots (API_CONTRACT.md section 10) ----

export function createPickupSlot(payload) {
  // payload: { food_court_id, slot_date, start_time, end_time, capacity }
  return apiClient.post('/shopkeeper/pickup-slots', payload);
}

export function setPickupSlotStatus(slotId, status) {
  // status: ACTIVE | INACTIVE (FULL is backend-derived from booked_count, not settable here)
  return apiClient.patch(`/shopkeeper/pickup-slots/${slotId}/status`, { status });
}

export function getFoodCourtPickupSlots(foodCourtId) {
  return apiClient.get(`/food-courts/${foodCourtId}/pickup-slots`);
}

// ---- Orders (API_CONTRACT.md section 11) ----

export function getShopkeeperOrders(params = {}) {
  // params may include filters such as status/date if the backend supports
  // query params; kept generic here since API_CONTRACT.md doesn't enumerate
  // query params for this endpoint.
  return apiClient.get('/shopkeeper/orders', { params });
}

export function getOrderDetails(orderId) {
  return apiClient.get(`/orders/${orderId}`);
}

// Allowed transitions enforced again on the frontend in OrderCard/OrderDetails
// as a UX guard, but the backend is authoritative (DEVELOPMENT_RULES.md
// section 16): CONFIRMED -> PREPARING -> READY -> PICKED_UP, plus EXPIRED/CANCELLED.
export function updateOrderStatus(orderId, status) {
  return apiClient.patch(`/shopkeeper/orders/${orderId}/status`, { status });
}

// ---- Shopkeeper analytics (API_CONTRACT.md section 16) ----

export function getShopkeeperOverview() {
  return apiClient.get('/analytics/shopkeeper/overview');
}

export function getShopkeeperOrderAnalytics() {
  return apiClient.get('/analytics/shopkeeper/orders');
}

export function getShopkeeperRevenue() {
  return apiClient.get('/analytics/shopkeeper/revenue');
}

export function getShopkeeperPopularFood() {
  return apiClient.get('/analytics/shopkeeper/popular-food');
}

export function getShopkeeperPickupDemand() {
  return apiClient.get('/analytics/shopkeeper/pickup-demand');
}
