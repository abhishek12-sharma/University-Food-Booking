import { useEffect, useState } from 'react';
import notificationApi from '../../services/notificationApi';
import NotificationItem from '../../components/notifications/NotificationItem';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../components/common/Toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationApi.getAll();
      setNotifications(res.data?.notifications || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      toast.error(err.message || 'Could not mark as read.');
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">Notifications</h1>
        {unreadCount > 0 && <span className="chip bg-canteen-okLight text-canteen-primaryDark">{unreadCount} unread</span>}
      </div>

      {loading && <Loader label="Loading notifications…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && notifications.length === 0 && (
        <EmptyState title="You're all caught up" description="New order and pickup updates will show up here." />
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="card divide-y divide-canteen-border">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
          ))}
        </div>
      )}
    </div>
  );
}
