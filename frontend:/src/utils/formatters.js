/**
 * Shared display formatters. Keeping these in one place avoids six
 * slightly-different date/currency formats across pages built by
 * different pages in the user module.
 */

export function formatCurrency(amount) {
  const value = Number(amount);
  if (Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatTime(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
}

// Matches the order status enum in DATABASE_SCHEMA.md / API_CONTRACT.md.
export const ORDER_STATUS_META = {
  CONFIRMED: { label: 'Confirmed', tone: 'ok' },
  PREPARING: { label: 'Preparing', tone: 'accent' },
  READY: { label: 'Ready for pickup', tone: 'accent' },
  PICKED_UP: { label: 'Picked up', tone: 'ok' },
  EXPIRED: { label: 'Expired', tone: 'warn' },
  CANCELLED: { label: 'Cancelled', tone: 'warn' },
};

export function orderStatusMeta(status) {
  return ORDER_STATUS_META[status] || { label: status || 'Unknown', tone: 'muted' };
}

/** Countdown text for a pickup deadline, e.g. "12m left" or "Expired". */
export function pickupCountdown(pickupDeadlineIso) {
  if (!pickupDeadlineIso) return null;
  const diffMs = new Date(pickupDeadlineIso).getTime() - Date.now();
  if (diffMs <= 0) return 'Pickup window closed';
  const minutes = Math.floor(diffMs / 60000);
  const seconds = Math.floor((diffMs % 60000) / 1000);
  if (minutes >= 1) return `${minutes}m ${seconds}s left to pick up`;
  return `${seconds}s left to pick up`;
}
