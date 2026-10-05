import { formatCurrency } from '../../utils/formatters';

export default function CartSummary({ subtotal, serverTotal, itemCount, ctaLabel, onCta, ctaDisabled, note }) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-base font-bold">Order summary</h3>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-canteen-muted">
          <span>Items ({itemCount})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {serverTotal != null ? (
          <div className="flex justify-between border-t border-canteen-border pt-2 font-bold">
            <span>Total (confirmed by server)</span>
            <span>{formatCurrency(serverTotal)}</span>
          </div>
        ) : (
          <p className="border-t border-canteen-border pt-2 text-xs text-canteen-muted">
            This is an estimate. The final amount is calculated and verified by the server at checkout.
          </p>
        )}
      </div>

      {note && <p className="mt-3 rounded-lg bg-canteen-bg p-3 text-xs text-canteen-muted">{note}</p>}

      {ctaLabel && (
        <button type="button" onClick={onCta} disabled={ctaDisabled} className="btn-primary mt-5 w-full">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
