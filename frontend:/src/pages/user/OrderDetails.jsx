import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderApi from '../../services/orderApi';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency, formatDateTime, orderStatusMeta } from '../../utils/formatters';

const LIVE_STATUSES = ['CONFIRMED', 'PREPARING', 'READY'];

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getById(orderId);
      setOrder(res.data?.order || res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) return <Loader fullPage label="Loading order…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return null;

  const meta = orderStatusMeta(order.status);
  const isLive = LIVE_STATUSES.includes(order.status);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/orders" className="text-sm font-semibold text-canteen-muted hover:text-canteen-ink">
          ← Order history
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs font-semibold text-canteen-muted">#{order.order_number || order.id}</p>
            <h1 className="font-display text-2xl font-extrabold">{order.food_court_name || 'Order'}</h1>
          </div>
          <span className="chip bg-canteen-okLight text-canteen-primaryDark">{meta.label}</span>
        </div>
      </div>

      {isLive && (
        <div className="card flex items-center justify-between p-4">
          <p className="text-sm text-canteen-muted">This order is still in progress.</p>
          <Link to={`/orders/${order.id}/track`} className="btn-primary">
            Track live
          </Link>
        </div>
      )}

      <section className="card p-6">
        <OrderStatusTimeline status={order.status} />
      </section>

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-base font-bold">Items</h2>
        {order.items?.length > 0 ? (
          <ul className="divide-y divide-canteen-border">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-1.5 text-sm">
                <span>
                  {item.quantity} × {item.item_name_snapshot || item.name}
                </span>
                <span className="font-semibold">{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-canteen-muted">No item breakdown available.</p>
        )}
        <div className="flex justify-between border-t border-canteen-border pt-3 text-sm font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
      </section>

      <section className="card space-y-2 p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-canteen-muted">Placed on</span>
          <span className="font-semibold">{formatDateTime(order.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-canteen-muted">Pickup deadline</span>
          <span className="font-semibold">{formatDateTime(order.pickup_deadline)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-canteen-muted">Payment status</span>
          <span className="font-semibold">{order.payment_status || '—'}</span>
        </div>
      </section>
    </div>
  );
}
