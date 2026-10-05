import { Link } from 'react-router-dom';

// Order lifecycle per DATABASE_SCHEMA.md / API_CONTRACT.md section 12:
// CONFIRMED -> PREPARING -> READY -> PICKED_UP, terminal EXPIRED/CANCELLED.
// This map is the single place that defines "what's the next valid status" —
// the backend re-validates regardless (DEVELOPMENT_RULES.md section 16).
export const NEXT_STATUS = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'READY',
  READY: 'PICKED_UP'
};

export const STATUS_LABELS = {
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  PICKED_UP: 'Picked up',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
};

export const STATUS_STYLES = {
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  PREPARING: 'bg-amber-100 text-amber-700 border-amber-200',
  READY: 'bg-green-100 text-green-700 border-green-200',
  PICKED_UP: 'bg-gray-100 text-gray-600 border-gray-200',
  EXPIRED: 'bg-red-100 text-red-700 border-red-200',
  CANCELLED: 'bg-gray-100 text-gray-400 border-gray-200'
};

export function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200'
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDeadline(deadline) {
  if (!deadline) return '—';
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return deadline;
  return d.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
}

export default function OrderCard({ order, onAdvanceStatus, onCancel, advancing }) {
  const nextStatus = NEXT_STATUS[order.status];
  const isTerminal = ['PICKED_UP', 'EXPIRED', 'CANCELLED'].includes(order.status);

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <Link to={`/shopkeeper/orders/${order.id}`} className="font-semibold text-gray-900 hover:underline">
            #{order.order_number || order.id}
          </Link>
          <p className="text-xs text-gray-400">Deadline: {formatDeadline(order.pickup_deadline)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="text-sm text-gray-600">
        {(order.items || order.order_items || []).map((it) => (
          <div key={it.id} className="flex justify-between">
            <span>
              {it.quantity}× {it.item_name_snapshot || it.name}
            </span>
            <span>₹{Number(it.line_total ?? it.unit_price_snapshot * it.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-xs text-gray-500">
        <span>Payment: {order.payment_status}</span>
        <span className="font-semibold text-gray-800">Total: ₹{Number(order.total_amount).toFixed(2)}</span>
      </div>

      {!isTerminal && (
        <div className="flex gap-2">
          {nextStatus && (
            <button
              className="btn btn-primary flex-1"
              disabled={advancing}
              onClick={() => onAdvanceStatus(order, nextStatus)}
            >
              {advancing ? 'Updating…' : `Mark ${STATUS_LABELS[nextStatus]}`}
            </button>
          )}
          {order.status === 'CONFIRMED' && (
            <button className="btn btn-secondary" disabled={advancing} onClick={() => onCancel(order)}>
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
