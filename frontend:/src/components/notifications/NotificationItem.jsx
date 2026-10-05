import { formatDateTime } from '../../utils/formatters';

export default function NotificationItem({ notification, onMarkRead }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 border-b border-canteen-border px-4 py-3.5 last:border-b-0 ${
        notification.is_read ? '' : 'bg-canteen-okLight/40'
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {!notification.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-canteen-accent" aria-hidden="true" />}
          <p className="text-sm font-semibold">{notification.title}</p>
        </div>
        <p className="mt-0.5 text-sm text-canteen-muted">{notification.message}</p>
        <p className="mt-1 text-xs text-canteen-muted">{formatDateTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 whitespace-nowrap text-xs font-semibold text-canteen-primary hover:underline"
        >
          Mark read
        </button>
      )}
    </div>
  );
}
