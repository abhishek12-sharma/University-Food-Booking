import { useEffect, useRef, useState } from 'react';

// Uses html5-qrcode (works well on tablet/mobile cameras — spec section 12).
// This component's ONLY job is to read a QR code into a string and hand it
// to the caller. It does not parse, validate, or interpret the token in any
// way — DEVELOPMENT_RULES.md section 12: "Never allow the frontend to
// declare an order picked up" / "Trust frontend QR validation" is a DO-NOT.
// Validation happens exclusively via POST /pickup/verify (qrApi.js).

const SCANNER_ELEMENT_ID = 'shopkeeper-qr-scanner-region';

export default function QRScannerComponent({ onScan, paused }) {
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let html5QrCode;

    async function start() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        html5QrCode = new Html5Qrcode(SCANNER_ELEMENT_ID);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!paused) onScan(decodedText);
          },
          () => {
            // per-frame decode failures are expected while aiming the camera; ignore
          }
        );
        setReady(true);
      } catch (err) {
        setError(err?.message || 'Unable to access camera. Check permissions.');
      }
    }

    start();

    return () => {
      cancelled = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          scannerRef.current?.clear?.();
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card flex flex-col items-center gap-3">
      <div id={SCANNER_ELEMENT_ID} className="w-full max-w-sm overflow-hidden rounded-lg bg-black" />
      {!ready && !error && <p className="text-sm text-gray-400">Starting camera…</p>}
      {error && (
        <p className="text-sm text-red-600">
          {error} You can also enter the pickup code manually below.
        </p>
      )}
      {paused && <p className="text-sm font-medium text-blue-600">Verifying scanned code…</p>}
    </div>
  );
}
