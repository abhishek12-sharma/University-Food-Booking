// src/pages/admin/Analytics.jsx
//
// Uses every endpoint in API_CONTRACT.md §16 Admin analytics.

import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  RevenueTrendChart,
  OrdersTrendChart,
  FoodCourtComparisonChart,
  PopularFoodChart,
  PeakHoursChart,
  OrderStatusPie,
} from "../../components/admin/AnalyticsCharts";
import {
  getAdminOverview,
  getAdminRevenue,
  getAdminOrdersAnalytics,
  getAdminFoodCourtsAnalytics,
  getAdminPopularFood,
  getAdminPeakHours,
} from "../../services/analyticsApi";
import { AlertTriangle } from "lucide-react";

const RANGES = [
  { label: "7 days", value: "7d" },
  { label: "30 days", value: "30d" },
  { label: "90 days", value: "90d" },
];

export default function Analytics() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState({
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
    setLoading(true);
    setError(null);

    Promise.all([
      getAdminOverview({ range }).catch(() => null),
      getAdminRevenue({ range }).catch(() => null),
      getAdminOrdersAnalytics({ range }).catch(() => null),
      getAdminFoodCourtsAnalytics({ range }).catch(() => null),
      getAdminPopularFood({ range }).catch(() => null),
      getAdminPeakHours({ range }).catch(() => null),
    ])
      .then(([overview, revenue, orders, foodCourts, popularFood, peakHours]) => {
        if (cancelled) return;
        setData({
          revenue: revenue?.data?.series ?? revenue?.data ?? [],
          orders: orders?.data?.series ?? orders?.data ?? [],
          foodCourts: foodCourts?.data ?? [],
          popularFood: popularFood?.data ?? [],
          peakHours: peakHours?.data ?? [],
          statusDistribution: overview?.data?.orderStatusDistribution ?? [],
        });
      })
      .catch((err) => !cancelled && setError(err?.message || "Failed to load analytics."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [range]);

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Analytics" subtitle="Platform performance across all food courts" />
        <main className="flex-1 p-6 space-y-4">
          <div className="flex justify-end gap-2">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`text-[12.5px] px-3 py-1.5 rounded-sm border ${
                  range === r.value
                    ? "bg-[#14231F] text-white border-[#14231F]"
                    : "border-[#DEDACD] text-[#6B675C] hover:bg-[#F1EFE8]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[#B3261E] bg-[#B3261E]/5 border border-[#B3261E]/30 rounded-sm px-4 py-2.5 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueTrendChart data={loading ? [] : data.revenue} />
            <OrdersTrendChart data={loading ? [] : data.orders} />
            <FoodCourtComparisonChart data={loading ? [] : data.foodCourts} />
            <PopularFoodChart data={loading ? [] : data.popularFood} />
            <PeakHoursChart data={loading ? [] : data.peakHours} />
            <OrderStatusPie data={loading ? [] : data.statusDistribution} />
          </div>
        </main>
      </div>
    </div>
  );
}
