import api from '../utils/api';

/**
 * Authentication endpoints — API_CONTRACT.md section 7.
 * Do not add endpoints here that are not listed in the contract.
 */
const authApi = {
  register(payload) {
    // payload: { name, email, password, phone? } — exact fields are
    // whatever the backend's /auth/register validation expects.
    return api.post('/auth/register', payload);
  },

  login(payload) {
    // payload: { email, password }
    return api.post('/auth/login', payload);
  },

  logout() {
    return api.post('/auth/logout');
  },

  getProfile() {
    return api.get('/auth/profile');
  },

  changePassword(payload) {
    // payload: { currentPassword, newPassword }
    return api.put('/auth/change-password', payload);
  },
};

export default authApi;
