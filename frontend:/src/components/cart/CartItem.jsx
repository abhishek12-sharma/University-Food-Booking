import { formatCurrency } from '../../utils/formatters';

export default function CartItem({ item, onIncrease, onDecrease, onRemove }) {
  const atMax = item.quantityAvailable != null && item.quantity >= item.quantityAvailable;

  return (
    <div className="flex items-center gap-4 border-b border-canteen-border py-4 last:border-b-0">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-canteen-bg font-display text-lg font-bold text-canteen-border">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full rounded-lg object-cover" />
        ) : (
          item.name?.[0] || '?'
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{item.name}</p>
        <p className="text-xs text-canteen-muted">{formatCurrency(item.price)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          aria-label={`Decrease quantity of ${item.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-canteen-border text-canteen-ink hover:border-canteen-primary"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={atMax}
          aria-label={`Increase quantity of ${item.name}`}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-canteen-border text-canteen-ink hover:border-canteen-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <span className="w-20 shrink-0 text-right text-sm font-bold">{formatCurrency(item.price * item.quantity)}</span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 text-canteen-muted hover:text-canteen-warn"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  );
}
