import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import orderApi from '../../services/orderApi';
import pickupApi from '../../services/pickupApi';
import { useOrderSocket } from '../../hooks/useOrderSocket';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import PickupQrCode from '../../components/pickup/PickupQrCode';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency, formatDateTime, orderStatusMeta } from '../../utils/formatters';
import { toast } from '../../components/common/Toast';

export default function ActiveOrder() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { liveStatus, lastEvent } = useOrderSocket(orderId);

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

  // Reflect the live socket status immediately instead of waiting for
  // a manual refresh.
  useEffect(() => {
    if (liveStatus && order) {
      setOrder((prev) => (prev ? { ...prev, status: liveStatus } : prev));
      toast.info(`Order ${orderStatusMeta(liveStatus).label.toLowerCase()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvent]);

  useEffect(() => {
    const status = order?.status;
    if (status !== 'READY' && status !== 'PREPARING') return;
    pickupApi
      .getPickupQr(orderId)
      .then((res) => setQr(res.data))
      .catch(() => {
        // QR may not be issued until the order is READY; a failure
        // here is expected while PREPARING and is not shown as an error.
      });
  }, [order?.status, orderId]);

  if (loading) return <Loader fullPage label="Loading order…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!order) return null;

  const meta = orderStatusMeta(order.status);
  const showQr = order.status === 'READY';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs font-semibold text-canteen-muted">#{order.order_number || order.id}</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">{order.food_court_name || 'Your order'}</h1>
          <span className="chip bg-canteen-okLight text-canteen-primaryDark">{meta.label}</span>
        </div>
      </div>

      <section className="card p-6">
        <OrderStatusTimeline status={order.status} />
      </section>

      {showQr && (
        <section>
          <PickupQrCode qrImageUrl={qr?.qrImageUrl || qr?.qr_image_url} qrToken={qr?.token} pickupDeadline={order.pickup_deadline} />
        </section>
      )}

      <section className="card space-y-3 p-6">
        <h2 className="font-display text-base font-bold">Order details</h2>
        {order.items?.length > 0 && (
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
        )}
        <div className="flex justify-between border-t border-canteen-border pt-3 text-sm font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total_amount)}</span>
        </div>
        <p className="text-xs text-canteen-muted">Pickup by {formatDateTime(order.pickup_deadline)}</p>
      </section>
    </div>
  );
}
