import { useEffect, useState } from 'react';
import { connectSocket, ORDER_EVENTS } from '../sockets/socket';

/**
 * Tracks live status updates for one order via Socket.IO
 * (API_CONTRACT.md section 20, ARCHITECTURE.md section 13).
 *
 * The backend, not this hook, decides which room/order events a
 * client is allowed to receive — this hook only listens.
 */
export function useOrderSocket(orderId) {
  const [liveStatus, setLiveStatus] = useState(null);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    if (!orderId) return undefined;

    const socket = connectSocket();

    const handlers = {};
    ORDER_EVENTS.forEach((eventName) => {
      handlers[eventName] = (payload) => {
        if (!payload || payload.orderId === orderId || payload.order_id === orderId) {
          const status = eventName.replace('ORDER_', '');
          setLiveStatus(status);
          setLastEvent({ type: eventName, payload, at: new Date().toISOString() });
        }
      };
      socket.on(eventName, handlers[eventName]);
    });

    return () => {
      ORDER_EVENTS.forEach((eventName) => socket.off(eventName, handlers[eventName]));
    };
  }, [orderId]);

  return { liveStatus, lastEvent };
}
