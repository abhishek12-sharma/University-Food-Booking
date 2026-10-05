import api from '../utils/api';

/** Notification endpoints — API_CONTRACT.md section 18. */
const notificationApi = {
  getAll() {
    return api.get('/notifications');
  },

  markAsRead(notificationId) {
    return api.patch(`/notifications/${notificationId}/read`);
  },
};

export default notificationApi;
