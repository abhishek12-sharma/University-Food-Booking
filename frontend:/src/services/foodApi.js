import api from '../utils/api';

/**
 * Food item endpoints — API_CONTRACT.md section 9.
 * Only the read endpoints belong to the user module. The
 * POST/PUT/DELETE /shopkeeper/food-items endpoints belong to Member 5's
 * shopkeeper frontend and must not be called from here.
 */
const foodApi = {
  getByFoodCourt(foodCourtId) {
    return api.get(`/food-courts/${foodCourtId}/food-items`);
  },

  getById(foodItemId) {
    return api.get(`/food-items/${foodItemId}`);
  },
};

export default foodApi;
