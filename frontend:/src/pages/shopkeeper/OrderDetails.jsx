import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, updateOrderStatus } from '../../services/shopkeeperApi';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';
import { StatusBadge, NEXT_STATUS, STATUS_LABELS } from '../../components/shopkeeper/OrderCard';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOrderDetails(orderId);
      setOrder(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(nextStatus) {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, nextStatus);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <LoadingState label="Loading order…" />;
  if (error && !order) return <ErrorState message={error} onRetry={load} />;
  if (!order) return null;

  const nextStatus = NEXT_STATUS[order.status];
  const isTerminal = ['PICKED_UP', 'EXPIRED', 'CANCELLED'].includes(order.status);
  const items = order.items || order.order_items || [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link to="/shopkeeper/orders" className="text-sm text-blue-600 hover:underline">← Back to orders</Link>

      <div className="card flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{order.order_number || order.id}</h1>
            <p className="text-xs text-gray-400">
              Placed {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {error && <ErrorState message={error} />}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="label">Pickup deadline</p>
            <p className="text-gray-800">
              {order.pickup_deadline ? new Date(order.pickup_deadline).toLocaleString() : '—'}
            </p>
          </div>
          <div>
            <p className="label">Payment status</p>
            <p className="text-gray-800">{order.payment_status}</p>
          </div>
        </div>

        <div>
          <p className="label mb-2">Items</p>
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between px-3 py-2 text-sm">
                <span>{it.quantity}× {it.item_name_snapshot || it.name}</span>
                <span>₹{Number(it.line_total ?? it.unit_price_snapshot * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between border-t border-gray-100 pt-3 text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span>₹{Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-gray-900">
          <span>Total</span>
          <span>₹{Number(order.total_amount).toFixed(2)}</span>
        </div>

        {!isTerminal && (
          <div className="flex gap-2 border-t border-gray-100 pt-4">
            {nextStatus && (
              <button className="btn btn-primary flex-1" disabled={updating} onClick={() => handleStatusChange(nextStatus)}>
                {updating ? 'Updating…' : `Mark ${STATUS_LABELS[nextStatus]}`}
              </button>
            )}
            {order.status === 'CONFIRMED' && (
              <button className="btn btn-secondary" disabled={updating} onClick={() => handleStatusChange('CANCELLED')}>
                Cancel order
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
