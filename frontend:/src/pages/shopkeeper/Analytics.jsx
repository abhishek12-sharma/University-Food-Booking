import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  getShopkeeperOverview,
  getShopkeeperOrderAnalytics,
  getShopkeeperRevenue,
  getShopkeeperPopularFood,
  getShopkeeperPickupDemand
} from '../../services/shopkeeperApi';
import { getWasteAnalytics } from '../../services/wasteApi';
import { LoadingState, ErrorState, EmptyState } from '../../components/shopkeeper/StateViews';

function ChartCard({ title, children, empty }) {
  return (
    <div className="card">
      <h2 className="mb-3 font-semibold text-gray-800">{title}</h2>
      {empty ? <p className="py-8 text-center text-sm text-gray-400">No data yet.</p> : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [orderSeries, setOrderSeries] = useState([]);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [popularFood, setPopularFood] = useState([]);
  const [pickupDemand, setPickupDemand] = useState([]);
  const [waste, setWaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, ord, rev, pop, demand, wst] = await Promise.allSettled([
        getShopkeeperOverview(),
        getShopkeeperOrderAnalytics(),
        getShopkeeperRevenue(),
        getShopkeeperPopularFood(),
        getShopkeeperPickupDemand(),
        getWasteAnalytics()
      ]);
      if (ov.status === 'fulfilled') setOverview(ov.value.data || null);
      if (ord.status === 'fulfilled') setOrderSeries(ord.value.data || []);
      if (rev.status === 'fulfilled') setRevenueSeries(rev.value.data || []);
      if (pop.status === 'fulfilled') setPopularFood(pop.value.data || []);
      if (demand.status === 'fulfilled') setPickupDemand(demand.value.data || []);
      if (wst.status === 'fulfilled') setWaste(wst.value.data || null);
      if ([ov, ord, rev, pop, demand, wst].every((r) => r.status === 'rejected')) {
        throw ov.reason;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingState label="Loading analytics…" />;
  if (error && !overview) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      {overview && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-xs text-gray-400">Total orders</p>
            <p className="text-xl font-bold text-gray-900">{overview.total_orders ?? '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="text-xl font-bold text-gray-900">
              {overview.revenue != null ? `₹${Number(overview.revenue).toFixed(2)}` : '—'}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Avg order value</p>
            <p className="text-xl font-bold text-gray-900">
              {overview.average_order_value != null ? `₹${Number(overview.average_order_value).toFixed(2)}` : '—'}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Waste rate</p>
            <p className="text-xl font-bold text-red-600">
              {waste?.waste_rate != null ? `${Number(waste.waste_rate).toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Orders over time" empty={orderSeries.length === 0}>
          <LineChart data={orderSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="order_count" stroke="#2563eb" strokeWidth={2} name="Orders" />
          </LineChart>
        </ChartCard>

        <ChartCard title="Revenue over time" empty={revenueSeries.length === 0}>
          <BarChart data={revenueSeries}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="revenue" fill="#16a34a" name="Revenue (₹)" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Popular food" empty={popularFood.length === 0}>
          <BarChart data={popularFood} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="order_count" fill="#d97706" name="Orders" />
          </BarChart>
        </ChartCard>

        <ChartCard title="Pickup demand by slot" empty={pickupDemand.length === 0}>
          <BarChart data={pickupDemand}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="slot_label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="booked_count" fill="#2563eb" name="Booked" />
            <Bar dataKey="capacity" fill="#d1d5db" name="Capacity" />
          </BarChart>
        </ChartCard>
      </div>

      {!overview && orderSeries.length === 0 && revenueSeries.length === 0 && (
        <EmptyState message="Analytics will appear once orders start coming in." />
      )}
    </div>
  );
}
