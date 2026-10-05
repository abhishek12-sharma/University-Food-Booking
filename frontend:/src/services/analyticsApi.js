// src/services/analyticsApi.js
//
// Admin analytics endpoints, per API_CONTRACT.md §16. All figures come from
// the backend — this file never fabricates or estimates data client-side.

import apiClient from '../utils/api';

const qs = (params = {}) => {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : "";
};

export const getAdminOverview = (params) => apiClient.get(`/analytics/admin/overview${qs(params)}`);
export const getAdminRevenue = (params) => apiClient.get(`/analytics/admin/revenue${qs(params)}`);
export const getAdminOrdersAnalytics = (params) => apiClient.get(`/analytics/admin/orders${qs(params)}`);
export const getAdminFoodCourtsAnalytics = (params) =>
  apiClient.get(`/analytics/admin/food-courts${qs(params)}`);
export const getAdminPopularFood = (params) => apiClient.get(`/analytics/admin/popular-food${qs(params)}`);
export const getAdminPeakHours = (params) => apiClient.get(`/analytics/admin/peak-hours${qs(params)}`);
