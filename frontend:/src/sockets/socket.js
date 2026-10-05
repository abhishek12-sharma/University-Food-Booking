import { io } from 'socket.io-client';
import { TOKEN_STORAGE_KEY } from '../utils/api';

/**
 * Single shared Socket.IO connection for the user module.
 *
 * The event names below are exactly the ones listed in
 * API_CONTRACT.md section 20 — do not rename or add events here
 * without updating that contract first.
 */

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const ORDER_EVENTS = [
  'ORDER_CONFIRMED',
  'ORDER_PREPARING',
  'ORDER_READY',
  'ORDER_PICKED_UP',
  'ORDER_EXPIRED',
  'ORDER_CANCELLED',
  // NEW_ORDER is a shopkeeper-facing event and is intentionally not
  // subscribed to here.
];

let socket = null;

/**
 * Lazily creates the socket connection, authenticated with the same
 * JWT used for REST calls so the backend can enforce per-user /
 * per-order authorization when joining rooms (ARCHITECTURE.md
 * section 13).
 */
export function getSocket() {
  if (socket) return socket;

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  socket = io(socketUrl, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  // Refresh the auth token in case it changed since the socket was
  // first created (e.g. after login).
  s.auth = { token: localStorage.getItem(TOKEN_STORAGE_KEY) };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (socket?.connected) socket.disconnect();
}
