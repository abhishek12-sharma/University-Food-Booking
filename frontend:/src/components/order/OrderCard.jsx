import { Link } from 'react-router-dom';
import { formatCurrency, formatDateTime, orderStatusMeta } from '../../utils/formatters';

const TONE_CLASSES = {
  ok: 'bg-canteen-okLight text-canteen-primaryDark',
  accent: 'bg-canteen-accent/15 text-canteen-accentDark',
  warn: 'bg-canteen-warnLight text-canteen-warn',
  muted: 'bg-canteen-border/60 text-canteen-muted',
};

export default function OrderCard({ order }) {
  const meta = orderStatusMeta(order.status);

  return (
    <Link
      to={`/orders/${order.id}`}
      className="card flex items-center justify-between gap-4 p-4 transition-shadow hover:shadow-lg"
    >
      <div className="min-w-0">
        <p className="font-mono text-xs font-semibold text-canteen-muted">#{order.order_number || order.id}</p>
        <p className="truncate font-display text-sm font-bold">{order.food_court_name || 'Food court'}</p>
        <p className="text-xs text-canteen-muted">{formatDateTime(order.created_at)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className={`chip ${TONE_CLASSES[meta.tone]}`}>{meta.label}</span>
        <span className="text-sm font-bold">{formatCurrency(order.total_amount)}</span>
      </div>
    </Link>
  );
}
