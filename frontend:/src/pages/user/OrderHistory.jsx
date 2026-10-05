import { useEffect, useMemo, useState } from 'react';
import orderApi from '../../services/orderApi';
import OrderCard from '../../components/order/OrderCard';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'ACTIVE', label: 'Active', statuses: ['CONFIRMED', 'PREPARING', 'READY'] },
  { key: 'PICKED_UP', label: 'Picked up', statuses: ['PICKED_UP'] },
  { key: 'ENDED', label: 'Expired/Cancelled', statuses: ['EXPIRED', 'CANCELLED'] },
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getMyOrders();
      setOrders(res.data?.orders || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const active = FILTERS.find((f) => f.key === filter);
    if (!active?.statuses) return orders;
    return orders.filter((o) => active.statuses.includes(o.status));
  }, [orders, filter]);

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-extrabold">Your orders</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`chip border ${
              filter === f.key ? 'border-canteen-primary bg-canteen-okLight text-canteen-primaryDark' : 'border-canteen-border text-canteen-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading orders…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No orders here" description="Orders matching this filter will show up here." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
