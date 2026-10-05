import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getShopkeeperOrders,
  getShopkeeperOverview,
  getShopkeeperPopularFood
} from '../../services/shopkeeperApi';
import { getInventoryForFoodCourt } from '../../services/inventoryApi';
import { getWasteAnalytics } from '../../services/wasteApi';
import { connectShopkeeperSocket, subscribeToOrderEvents, disconnectShopkeeperSocket } from '../../sockets/shopkeeperSocket';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';
import { StatusBadge } from '../../components/shopkeeper/OrderCard';

function StatCard({ label, value, accent = 'text-gray-900' }) {
  return (
    <div className="card">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

function isToday(dateString) {
  if (!dateString) return false;
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function ShopkeeperDashboard() {
  const { foodCourtId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [overview, setOverview] = useState(null);
  const [popularFood, setPopularFood] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [waste, setWaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveBanner, setLiveBanner] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersRes, overviewRes, popularRes, inventoryRes, wasteRes] = await Promise.allSettled([
        getShopkeeperOrders(),
        getShopkeeperOverview(),
        getShopkeeperPopularFood(),
        getInventoryForFoodCourt(foodCourtId),
        getWasteAnalytics()
      ]);

      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data || []);
      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data || null);
      if (popularRes.status === 'fulfilled') setPopularFood(popularRes.value.data || []);
      if (inventoryRes.status === 'fulfilled') setInventory(inventoryRes.value.data || []);
      if (wasteRes.status === 'fulfilled') setWaste(wasteRes.value.data || null);

      if (ordersRes.status === 'rejected') throw ordersRes.reason;
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [foodCourtId]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: section 6 of the spec + ARCHITECTURE.md section 13.
  useEffect(() => {
    if (!foodCourtId) return undefined;
    connectShopkeeperSocket(foodCourtId);

    const unsubscribe = subscribeToOrderEvents({
      NEW_ORDER: (payload) => {
        setLiveBanner(`New order received: #${payload.order_number || payload.id}`);
        load();
      },
      ORDER_CONFIRMED: load,
      ORDER_PREPARING: load,
      ORDER_READY: load,
      ORDER_PICKED_UP: load,
      ORDER_EXPIRED: load,
      ORDER_CANCELLED: load
    });

    return () => {
      unsubscribe();
      disconnectShopkeeperSocket();
    };
  }, [foodCourtId, load]);

  useEffect(() => {
    if (!liveBanner) return undefined;
    const t = setTimeout(() => setLiveBanner(null), 6000);
    return () => clearTimeout(t);
  }, [liveBanner]);

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const todayOrders = orders.filter((o) => isToday(o.created_at));
  const counts = {
    pending: todayOrders.filter((o) => o.status === 'CONFIRMED').length,
    preparing: todayOrders.filter((o) => o.status === 'PREPARING').length,
    ready: todayOrders.filter((o) => o.status === 'READY').length,
    pickedUp: todayOrders.filter((o) => o.status === 'PICKED_UP').length,
    expired: todayOrders.filter((o) => o.status === 'EXPIRED').length
  };
  const lowStock = inventory.filter((i) => i.quantity_available <= 3 && i.is_available);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>

      {liveBanner && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
          {liveBanner}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Today's orders" value={todayOrders.length} />
        <StatCard label="Pending" value={counts.pending} accent="text-blue-600" />
        <StatCard label="Preparing" value={counts.preparing} accent="text-amber-600" />
        <StatCard label="Ready" value={counts.ready} accent="text-green-600" />
        <StatCard label="Picked up" value={counts.pickedUp} accent="text-gray-600" />
        <StatCard label="Expired" value={counts.expired} accent="text-red-600" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Revenue (reported)"
          value={overview?.revenue != null ? `₹${Number(overview.revenue).toFixed(2)}` : '—'}
        />
        <StatCard label="Low stock items" value={lowStock.length} accent={lowStock.length ? 'text-red-600' : 'text-gray-900'} />
        <StatCard
          label="Waste rate"
          value={waste?.waste_rate != null ? `${Number(waste.waste_rate).toFixed(1)}%` : '—'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold text-gray-800">Popular food</h2>
          {popularFood.length === 0 && <p className="text-sm text-gray-400">No data yet.</p>}
          <ul className="divide-y divide-gray-100">
            {popularFood.slice(0, 6).map((item) => (
              <li key={item.food_item_id || item.id} className="flex justify-between py-2 text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold text-gray-900">{item.order_count ?? item.quantity_sold} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold text-gray-800">Latest orders</h2>
          {todayOrders.length === 0 && <p className="text-sm text-gray-400">No orders yet today.</p>}
          <ul className="divide-y divide-gray-100">
            {todayOrders.slice(0, 6).map((order) => (
              <li key={order.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">#{order.order_number || order.id}</span>
                <StatusBadge status={order.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
