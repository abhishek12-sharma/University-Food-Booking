/**
 * Shopkeeper-facing Socket.IO connection.
 *
 * Shopkeepers receive NEW_ORDER and order-lifecycle events scoped to their
 * assigned food court room (`foodcourt:{id}`). The room join is handled
 * server-side by socketService.js after verifying the JWT.
 *
 * Event names match API_CONTRACT.md section 20 exactly.
 */

import { io } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from '../utils/api';

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export function connectShopkeeperSocket(foodCourtId) {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  socket = io(socketUrl, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.auth = { token: localStorage.getItem(TOKEN_STORAGE_KEY) };
  socket.connect();

  return socket;
}

export function disconnectShopkeeperSocket() {
  if (socket?.connected) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to all shopkeeper-facing order events.
 * Returns an unsubscribe function.
 */
export function subscribeToOrderEvents(handlers = {}) {
  if (!socket) return () => {};

  const EVENTS = [
    'NEW_ORDER',
    'ORDER_CONFIRMED',
    'ORDER_PREPARING',
    'ORDER_READY',
    'ORDER_PICKED_UP',
    'ORDER_EXPIRED',
    'ORDER_CANCELLED',
  ];

  EVENTS.forEach((event) => {
    if (typeof handlers[event] === 'function') {
      socket.on(event, handlers[event]);
    }
  });

  return () => {
    EVENTS.forEach((event) => {
      if (typeof handlers[event] === 'function') {
        socket.off(event, handlers[event]);
      }
    });
  };
}
