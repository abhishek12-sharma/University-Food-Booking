import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi from '../../services/notificationApi';
import { connectSocket, ORDER_EVENTS } from '../../sockets/socket';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const refresh = async () => {
    try {
      const res = await notificationApi.getAll();
      const list = res.data?.notifications || res.data || [];
      setUnreadCount(list.filter((n) => !n.is_read).length);
    } catch {
      // Silently ignore — the bell is a convenience indicator, not
      // critical path, and the Notifications page shows real errors.
    }
  };

  useEffect(() => {
    refresh();
    const socket = connectSocket();
    const handleUpdate = () => refresh();
    ORDER_EVENTS.forEach((eventName) => socket.on(eventName, handleUpdate));
    return () => ORDER_EVENTS.forEach((eventName) => socket.off(eventName, handleUpdate));
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      className="relative rounded-full p-2 text-canteen-ink hover:bg-canteen-bg"
      aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 8a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 12.5 6 8Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 17.5a2.5 2.5 0 0 0 5 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-chip bg-canteen-warn px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
