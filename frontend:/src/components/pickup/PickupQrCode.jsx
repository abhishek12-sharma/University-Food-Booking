import { pickupCountdown } from '../../utils/formatters';

/**
 * Displays the secure pickup token/QR returned by
 * GET /orders/:orderId/pickup-qr. This component never generates or
 * validates a pickup credential itself — that is the backend and
 * shopkeeper scanner's job (DEVELOPMENT_RULES.md section 12).
 */
export default function PickupQrCode({ qrImageUrl, qrToken, pickupDeadline }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-6 text-center">
      <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-canteen-border bg-canteen-bg">
        {qrImageUrl ? (
          <img src={qrImageUrl} alt="Pickup QR code" className="h-full w-full object-contain p-2" />
        ) : qrToken ? (
          <span className="break-all px-4 font-mono text-xs text-canteen-muted">{qrToken}</span>
        ) : (
          <span className="text-xs text-canteen-muted">QR not available yet</span>
        )}
      </div>
      <p className="text-xs text-canteen-muted">Show this at the counter for the shopkeeper to scan</p>
      {pickupDeadline && (
        <p className="chip bg-canteen-accent/15 font-mono text-canteen-accentDark">{pickupCountdown(pickupDeadline)}</p>
      )}
    </div>
  );
}
