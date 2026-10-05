// src/pages/admin/AdminDashboard.jsx
//
// GET /admin/dashboard for top-line metrics, plus the admin analytics
// endpoints for the supporting charts. No fabricated data: if an endpoint
// fails or returns nothing, that section shows an error/empty state rather
// than a placeholder number (Member-4 brief §1, §7).

import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import StatsCard from "../../components/admin/StatsCard";
import {
  RevenueTrendChart,
  OrdersTrendChart,
  FoodCourtComparisonChart,
  PopularFoodChart,
  PeakHoursChart,
  OrderStatusPie,
} from "../../components/admin/AnalyticsCharts";
import { getAdminDashboard } from "../../services/adminApi";
import {
  getAdminRevenue,
  getAdminOrdersAnalytics,
  getAdminFoodCourtsAnalytics,
  getAdminPopularFood,
  getAdminPeakHours,
} from "../../services/analyticsApi";
import {
  Users,
  Store,
  UtensilsCrossed,
  ClipboardList,
  DollarSign,
  Clock3,
  Trash2,
} from "lucide-react";
import { AlertTriangle } from "lucide-react";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [charts, setCharts] = useState({
    revenue: [],
    orders: [],
    foodCourts: [],
    popularFood: [],
    peakHours: [],
    statusDistribution: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dash, revenue, orders, foodCourts, popularFood, peakHours] = await Promise.all([
          getAdminDashboard(),
          getAdminRevenue().catch(() => null),
          getAdminOrdersAnalytics().catch(() => null),
          getAdminFoodCourtsAnalytics().catch(() => null),
          getAdminPopularFood().catch(() => null),
          getAdminPeakHours().catch(() => null),
        ]);

        if (cancelled) return;

        setDashboard(dash?.data ?? dash);
        setCharts({
          revenue: revenue?.data?.series ?? revenue?.data ?? [],
          orders: orders?.data?.series ?? orders?.data ?? [],
          foodCourts: foodCourts?.data ?? [],
          popularFood: popularFood?.data ?? [],
          peakHours: peakHours?.data ?? [],
          statusDistribution: dash?.data?.orderStatusDistribution ?? [],
        });
      } catch (err) {
        if (!cancelled) setError(err?.message || "Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const d = dashboard || {};

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Dashboard" subtitle="Platform-wide overview" />

        <main className="flex-1 p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-[#B3261E] bg-[#B3261E]/5 border border-[#B3261E]/30 rounded-sm px-4 py-2.5 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatsCard label="Total users" value={loading ? "—" : d.totalUsers ?? 0} icon={Users} />
            <StatsCard label="Active users" value={loading ? "—" : d.activeUsers ?? 0} icon={Users} tone="positive" />
            <StatsCard label="Shopkeepers" value={loading ? "—" : d.totalShopkeepers ?? 0} icon={Store} />
            <StatsCard
              label="Pending approvals"
              value={loading ? "—" : d.pendingShopkeeperApprovals ?? 0}
              icon={Clock3}
              tone={d.pendingShopkeeperApprovals ? "warning" : "neutral"}
            />
            <StatsCard label="Food courts" value={loading ? "—" : d.totalFoodCourts ?? 0} icon={UtensilsCrossed} />
            <StatsCard label="Orders (total)" value={loading ? "—" : d.totalOrders ?? 0} icon={ClipboardList} />
            <StatsCard
              label="Revenue"
              value={loading ? "—" : d.totalRevenue != null ? `₹${d.totalRevenue}` : "—"}
              icon={DollarSign}
              tone="positive"
            />
            <StatsCard label="Expired orders" value={loading ? "—" : d.expiredOrders ?? 0} icon={Trash2} tone="danger" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueTrendChart data={charts.revenue} />
            <OrdersTrendChart data={charts.orders} />
            <FoodCourtComparisonChart data={charts.foodCourts} />
            <PopularFoodChart data={charts.popularFood} />
            <PeakHoursChart data={charts.peakHours} />
            <OrderStatusPie data={charts.statusDistribution} />
          </div>
        </main>
      </div>
    </div>
  );
}
