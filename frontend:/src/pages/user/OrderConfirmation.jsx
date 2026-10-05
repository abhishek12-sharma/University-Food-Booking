import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderApi from '../../services/orderApi';
import { formatCurrency, formatDateTime, orderStatusMeta } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';

export default function OrderConfirmation() {
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

  if (loading) return <Loader fullPage label="Confirming your order…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return null;

  const meta = orderStatusMeta(order.status);

  return (
    <div className="mx-auto max-w-lg space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-canteen-okLight text-2xl text-canteen-primary">
          ✓
        </span>
        <h1 className="font-display text-2xl font-extrabold">Order placed!</h1>
        <p className="text-sm text-canteen-muted">We've sent your order to the kitchen.</p>
      </div>

      <div className="card space-y-3 p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold">#{order.order_number || order.id}</span>
          <span className="chip bg-canteen-okLight text-canteen-primaryDark">{meta.label}</span>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-canteen-muted">Food court</dt>
            <dd className="font-semibold">{order.food_court_name || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-canteen-muted">Amount</dt>
            <dd className="font-semibold">{formatCurrency(order.total_amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-canteen-muted">Pickup deadline</dt>
            <dd className="font-semibold">{formatDateTime(order.pickup_deadline)}</dd>
          </div>
        </dl>

        {order.items?.length > 0 && (
          <ul className="divide-y divide-canteen-border border-t border-canteen-border pt-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-1.5 text-sm">
                <span>
                  {item.quantity} × {item.item_name_snapshot || item.name}
                </span>
                <span className="font-semibold">{formatCurrency(item.line_total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={`/orders/${order.id}/track`} className="btn-primary">
          Track order
        </Link>
        <Link to="/food-courts" className="btn-secondary">
          Order more food
        </Link>
      </div>
    </div>
  );
}
