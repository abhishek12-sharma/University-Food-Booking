import apiClient from '../utils/api';

// API_CONTRACT.md section 17. DATABASE_SCHEMA.md food_waste table constraints:
// all quantities non-negative, wasted_quantity <= prepared_quantity. This
// module does not enforce those beyond basic client-side sanity checks in
// FoodWaste.jsx — the backend remains authoritative per DEVELOPMENT_RULES.md
// section 18.

export function recordFoodWaste(payload) {
  // payload: { food_item_id, waste_date, prepared_quantity, sold_quantity, remaining_quantity, wasted_quantity }
  return apiClient.post('/shopkeeper/food-waste', payload);
}

export function getFoodWasteRecords(params = {}) {
  return apiClient.get('/shopkeeper/food-waste', { params });
}

export function getWasteAnalytics() {
  return apiClient.get('/analytics/shopkeeper/waste');
}
