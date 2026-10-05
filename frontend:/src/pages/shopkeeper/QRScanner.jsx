import { useState, useCallback } from 'react';
import QRScannerComponent from '../../components/shopkeeper/QRScannerComponent';
import { verifyPickupToken } from '../../services/qrApi';

const RESULT_STYLES = {
  success: 'border-green-300 bg-green-50 text-green-800',
  error: 'border-red-300 bg-red-50 text-red-800'
};

export default function QRScanner() {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null); // { type: 'success'|'error', message, order }
  const [manualToken, setManualToken] = useState('');
  const [lastToken, setLastToken] = useState(null);

  const verify = useCallback(async (token) => {
    if (!token || token === lastToken) return; // avoid re-firing on repeated camera frames
    setLastToken(token);
    setVerifying(true);
    setResult(null);
    try {
      // The ONLY source of truth for whether pickup is valid: the backend
      // response from POST /pickup/verify. Nothing here decides success
      // independently (API_CONTRACT.md section 14, DEVELOPMENT_RULES.md section 12).
      const res = await verifyPickupToken(token);
      setResult({
        type: 'success',
        message: res.message || 'Pickup verified — order marked as picked up.',
        order: res.data
      });
    } catch (err) {
      setResult({ type: 'error', message: err.message || 'Verification failed.' });
    } finally {
      setVerifying(false);
      setTimeout(() => setLastToken(null), 3000);
    }
  }, [lastToken]);

  function handleManualSubmit(e) {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verify(manualToken.trim());
    setManualToken('');
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">QR pickup scanner</h1>

      <QRScannerComponent onScan={verify} paused={verifying} />

      <form onSubmit={handleManualSubmit} className="card flex gap-2">
        <input
          className="input"
          placeholder="Or enter pickup code manually"
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={verifying}>
          Verify
        </button>
      </form>

      {result && (
        <div className={`card border ${RESULT_STYLES[result.type]}`}>
          <p className="font-semibold">{result.type === 'success' ? '✅ Verified' : '❌ Not verified'}</p>
          <p className="mt-1 text-sm">{result.message}</p>
          {result.order && (
            <p className="mt-2 text-xs opacity-80">
              Order #{result.order.order_number || result.order.id}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
