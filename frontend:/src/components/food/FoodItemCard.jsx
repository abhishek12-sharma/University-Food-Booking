import { formatCurrency } from '../../utils/formatters';

export default function FoodItemCard({ item, onAdd, onViewDetails }) {
  const available = item.is_available && item.quantity_available > 0;

  return (
    <div className="card flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onViewDetails?.(item)}
        className="flex h-32 items-center justify-center bg-canteen-bg text-left"
      >
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-2xl font-bold text-canteen-border">{item.name?.[0] || '?'}</span>
        )}
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={() => onViewDetails?.(item)} className="text-left">
            <h4 className="font-display text-sm font-bold leading-tight">{item.name}</h4>
          </button>
          {!available && <span className="chip shrink-0 bg-canteen-warnLight text-canteen-warn">Unavailable</span>}
        </div>

        {item.category && <p className="text-xs text-canteen-muted">{item.category}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-sm font-bold">{formatCurrency(item.price)}</span>
          <button
            type="button"
            disabled={!available}
            onClick={() => onAdd?.(item)}
            className="rounded-chip bg-canteen-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-canteen-primaryLight disabled:cursor-not-allowed disabled:bg-canteen-border disabled:text-canteen-muted"
          >
            {available ? 'Add' : 'Sold out'}
          </button>
        </div>
        {available && item.quantity_available <= 5 && (
          <p className="text-[11px] font-medium text-canteen-accentDark">Only {item.quantity_available} left</p>
        )}
      </div>
    </div>
  );
}
