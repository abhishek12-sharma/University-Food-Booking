import { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { getFoodItemImage } from '../../utils/images';

export default function FoodItemCard({ item, onAdd, onViewDetails }) {
  const available = item.is_available && item.quantity_available > 0;
  const imgSrc = getFoodItemImage(item);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="card flex flex-col overflow-hidden">
      <button
        type="button"
        onClick={() => onViewDetails?.(item)}
        className="relative h-36 overflow-hidden bg-canteen-bg text-left"
      >
        {!imgError ? (
          <img
            src={imgSrc}
            alt={item.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-canteen-bg">
            <span className="font-display text-2xl font-bold text-canteen-border">
              {item.name?.[0] || '?'}
            </span>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-canteen-warn">
              Sold out
            </span>
          </div>
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
