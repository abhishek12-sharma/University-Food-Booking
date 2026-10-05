/**
 * Inventory API — shopkeeper read-only inventory view.
 * Maps to the food-items list endpoint, which includes quantity_available.
 * API_CONTRACT.md section 9 (GET /api/food-courts/:foodCourtId/food-items).
 */

import api from '../utils/api';

/**
 * Fetch all food items for a food court, including their current
 * inventory quantities (quantity_available).
 */
export function getInventoryForFoodCourt(foodCourtId) {
  if (!foodCourtId) return Promise.resolve({ data: [] });
  return api.get(`/food-courts/${foodCourtId}/food-items`);
}

/**
 * Update quantity for a specific food item.
 * Shopkeeper-only endpoint (API_CONTRACT.md section 9).
 */
export function updateInventoryQuantity(foodItemId, quantity_available) {
  return api.patch(`/shopkeeper/food-items/${foodItemId}/inventory`, { quantity_available });
}

/** Alias expected by Inventory.jsx */
export function updateItemQuantity(foodItemId, quantity_available) {
  return api.patch(`/shopkeeper/food-items/${foodItemId}/inventory`, { quantity_available });
}

/** Toggle is_available flag for a food item */
export function updateItemAvailability(foodItemId, is_available) {
  return api.patch(`/shopkeeper/food-items/${foodItemId}/inventory`, { is_available });
}
