// src/routes/AdminRoutes.jsx
//
// All admin routes, gated by a RequireAdmin guard. Frontend route
// protection is required but NOT authoritative (Member-4 brief §10,
// Dev Rules §15) — every admin API call is still checked server-side.
//
// ASSUMPTION: this file expects a shared AuthContext exposing
// `{ user, isAuthenticated, isLoading }` at src/context/AuthContext.jsx,
// owned by Member 1 (Auth/RBAC). If Member 1's context shape differs,
// update only the `useAuth` import below — nothing else here should need
// to change. Mount this file's <AdminRoutes /> under the app's top-level
// router, e.g. `<Route path="/admin/*" element={<AdminRoutes />} />`.

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ASSUMPTION: see file header note

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import UserDetails from "../pages/admin/UserDetails";
import Shopkeepers from "../pages/admin/Shopkeepers";
import ShopkeeperDetails from "../pages/admin/ShopkeeperDetails";
import FoodCourts from "../pages/admin/FoodCourts";
import FoodCourtDetails from "../pages/admin/FoodCourtDetails";
import Orders from "../pages/admin/Orders";
import OrderDetails from "../pages/admin/OrderDetails";
import Payments from "../pages/admin/Payments";
import Analytics from "../pages/admin/Analytics";
import AuditLogs from "../pages/admin/AuditLogs";
import Settings from "../pages/admin/Settings";

function RequireAdmin({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1EFE8] text-[#8A8676] text-sm">
        Checking access…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Explicit role check — no hierarchy assumption (ARCHITECTURE.md §9:
  // "Role hierarchy is not automatically hierarchical").
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

      <Route path="/users" element={<RequireAdmin><Users /></RequireAdmin>} />
      <Route path="/users/:userId" element={<RequireAdmin><UserDetails /></RequireAdmin>} />

      <Route path="/shopkeepers" element={<RequireAdmin><Shopkeepers /></RequireAdmin>} />
      <Route path="/shopkeepers/:id" element={<RequireAdmin><ShopkeeperDetails /></RequireAdmin>} />

      <Route path="/food-courts" element={<RequireAdmin><FoodCourts /></RequireAdmin>} />
      <Route path="/food-courts/:id" element={<RequireAdmin><FoodCourtDetails /></RequireAdmin>} />

      <Route path="/orders" element={<RequireAdmin><Orders /></RequireAdmin>} />
      <Route path="/orders/:orderId" element={<RequireAdmin><OrderDetails /></RequireAdmin>} />

      <Route path="/payments" element={<RequireAdmin><Payments /></RequireAdmin>} />
      <Route path="/analytics" element={<RequireAdmin><Analytics /></RequireAdmin>} />
      <Route path="/audit-logs" element={<RequireAdmin><AuditLogs /></RequireAdmin>} />
      <Route path="/settings" element={<RequireAdmin><Settings /></RequireAdmin>} />

      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
