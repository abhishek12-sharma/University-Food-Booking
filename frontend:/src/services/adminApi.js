// src/services/adminApi.js
//
// Admin API service layer. Every call here maps 1:1 to an endpoint defined
// in API_CONTRACT.md. Do NOT add endpoints here that are not documented —
// new APIs must be added to API_CONTRACT.md first (Development Rules, §3).
//
// The backend is authoritative. This file never computes totals, verifies
// payments, or makes authorization decisions — it only transports requests.

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

import { TOKEN_STORAGE_KEY } from "../utils/api";

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize the standard success/error envelope from API_CONTRACT.md §5.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const envelope = error.response?.data || {
      success: false,
      message: error.message || "Network error",
      errors: [],
    };
    return Promise.reject(envelope);
  }
);

const qs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
};

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
export const getAdminDashboard = () => apiClient.get("/admin/dashboard");

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const getUsers = (params) => apiClient.get(`/admin/users${qs(params)}`);
export const getUserById = (userId) => apiClient.get(`/admin/users/${userId}`);
export const updateUserStatus = (userId, status) =>
  apiClient.patch(`/admin/users/${userId}/status`, { status });

// ---------------------------------------------------------------------------
// Shopkeepers
// ---------------------------------------------------------------------------
export const getShopkeepers = (params) => apiClient.get(`/admin/shopkeepers${qs(params)}`);
export const getShopkeeperById = (id) => apiClient.get(`/admin/shopkeepers/${id}`);
export const approveShopkeeper = (id) => apiClient.post(`/admin/shopkeepers/${id}/approve`);
export const rejectShopkeeper = (id, reason) =>
  apiClient.post(`/admin/shopkeepers/${id}/reject`, reason ? { reason } : {});
export const updateShopkeeperStatus = (id, status) =>
  apiClient.patch(`/admin/shopkeepers/${id}/status`, { status });

// ---------------------------------------------------------------------------
// Food Courts
// ---------------------------------------------------------------------------
export const getAdminFoodCourts = (params) => apiClient.get(`/admin/food-courts${qs(params)}`);
export const getAdminFoodCourtById = (id) => apiClient.get(`/admin/food-courts/${id}`);
export const createFoodCourt = (payload) => apiClient.post("/admin/food-courts", payload);
export const updateFoodCourt = (id, payload) => apiClient.put(`/admin/food-courts/${id}`, payload);
export const updateFoodCourtStatus = (id, status) =>
  apiClient.patch(`/admin/food-courts/${id}/status`, { status });

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
export const getAdminOrders = (params) => apiClient.get(`/admin/orders${qs(params)}`);
export const getAdminOrderById = (orderId) => apiClient.get(`/admin/orders/${orderId}`);

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------
// NOTE: API_CONTRACT.md does not currently define an audit-log read endpoint,
// only that "sensitive admin actions" must be auditable (Contract §Admin,
// Architecture §16, Dev Rules §15). The audit_logs table exists in
// DATABASE_SCHEMA.md. Per Dev Rules §3 ("new APIs must be documented first"),
// this call targets a placeholder path and MUST be confirmed/added to
// API_CONTRACT.md by the team before relying on it. Flagged here rather than
// invented silently.
export const getAuditLogs = (params) => apiClient.get(`/admin/audit-logs${qs(params)}`);
