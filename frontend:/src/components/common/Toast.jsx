import { useEffect, useState } from 'react';

/**
 * Minimal toast system. `toast.success(...)` / `toast.error(...)` can be
 * called from anywhere (services, pages, hooks) without needing a
 * context provider — <ToastViewport /> just listens and renders.
 */

let idCounter = 0;
const listeners = new Set();

function emit(toastItem) {
  listeners.forEach((listener) => listener(toastItem));
}

export const toast = {
  success(message) {
    emit({ id: ++idCounter, tone: 'ok', message });
  },
  error(message) {
    emit({ id: ++idCounter, tone: 'warn', message });
  },
  info(message) {
    emit({ id: ++idCounter, tone: 'info', message });
  },
};

const TONE_STYLES = {
  ok: 'border-canteen-primary/30 bg-canteen-okLight text-canteen-primaryDark',
  warn: 'border-canteen-warn/30 bg-canteen-warnLight text-canteen-warn',
  info: 'border-canteen-border bg-white text-canteen-ink',
};

export default function ToastViewport() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const listener = (item) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      }, 4000);
    };
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  if (!items.length) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {items.map((item) => (
        <div
          key={item.id}
          role="status"
          className={`pointer-events-auto w-full max-w-sm rounded-card border px-4 py-3 text-sm font-medium shadow-card ${TONE_STYLES[item.tone]}`}
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
