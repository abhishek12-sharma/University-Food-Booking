import axios from 'axios';

/**
 * Central Axios instance.
 *
 * All requests go through this instance so that:
 * - the JWT is attached automatically (API_CONTRACT.md section 3)
 * - the standard success/error envelope (API_CONTRACT.md section 5) is
 *   unwrapped in one place instead of in every service file
 * - a 401 response clears the stored session and sends the user back to
 *   login, since the backend is the sole authority on token validity
 *
 * This file must not be used to invent endpoints — it only transports
 * requests to the paths defined in services/*.js.
 */

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const TOKEN_STORAGE_KEY = 'campus_eats_token';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Subscribers notified when a 401 forces a logout, so AuthContext can
// clear its state without this file importing React context directly.
const unauthorizedListeners = new Set();

export function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      unauthorizedListeners.forEach((listener) => listener());
    }

    // Normalize the rejected value to the shape defined in
    // API_CONTRACT.md section 5 (Error) so calling code never needs to
    // dig into Axios's error object.
    const envelope = error.response?.data || {
      success: false,
      message: error.message || 'Network error. Please try again.',
      errors: [],
    };

    return Promise.reject(envelope);
  }
);

export default api;
