import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getShopkeeperOrders, updateOrderStatus } from '../../services/shopkeeperApi';
import { connectShopkeeperSocket, subscribeToOrderEvents, disconnectShopkeeperSocket } from '../../sockets/shopkeeperSocket';
import OrderQueue from '../../components/shopkeeper/OrderQueue';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';
import OrderCard, { STATUS_LABELS } from '../../components/shopkeeper/OrderCard';

const FILTERS = ['ALL', 'CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP', 'EXPIRED', 'CANCELLED'];

export default function Orders() {
  const { foodCourtId } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [advancingOrderId, setAdvancingOrderId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShopkeeperOrders();
      const val = res?.data ?? res;
      setOrders(Array.isArray(val) ? val : (val?.orders ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!foodCourtId) return undefined;
    connectShopkeeperSocket(foodCourtId);
    const unsubscribe = subscribeToOrderEvents({
      NEW_ORDER: load,
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

  async function handleAdvanceStatus(order, nextStatus) {
    setAdvancingOrderId(order.id);
    const prevStatus = order.status;
    // Optimistic UI update; backend re-validates the transition
    // (DEVELOPMENT_RULES.md section 16 — "Invalid transitions must be rejected").
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    try {
      await updateOrderStatus(order.id, nextStatus);
    } catch (err) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: prevStatus } : o)));
      setError(err.message);
    } finally {
      setAdvancingOrderId(null);
    }
  }

  async function handleCancel(order) {
    if (!window.confirm(`Cancel order #${order.order_number || order.id}?`)) return;
    handleAdvanceStatus(order, 'CANCELLED');
  }

  if (loading) return <LoadingState label="Loading orders…" />;
  if (error && orders.length === 0) return <ErrorState message={error} onRetry={load} />;

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              {f === 'ALL' ? 'All' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={load} />}

      {filter === 'ALL' ? (
        <OrderQueue
          orders={filtered}
          onAdvanceStatus={handleAdvanceStatus}
          onCancel={handleCancel}
          advancingOrderId={advancingOrderId}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAdvanceStatus={handleAdvanceStatus}
              onCancel={handleCancel}
              advancing={advancingOrderId === order.id}
            />
          ))}
          {filtered.length === 0 && <p className="text-sm text-gray-400">No orders with this status.</p>}
        </div>
      )}
    </div>
  );
}
