import api from '../utils/api';

/** Food court endpoints — API_CONTRACT.md section 8. */
const foodCourtApi = {
  getAll() {
    return api.get('/food-courts');
  },

  getById(foodCourtId) {
    return api.get(`/food-courts/${foodCourtId}`);
  },
};

export default foodCourtApi;
