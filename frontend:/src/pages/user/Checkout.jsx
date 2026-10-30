import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import pickupApi from '../../services/pickupApi';
import orderApi from '../../services/orderApi';
import paymentApi from '../../services/paymentApi';
import PickupSlotPicker from '../../components/pickup/PickupSlotPicker';
import CartSummary from '../../components/cart/CartSummary';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { formatCurrency } from '../../utils/formatters';
import { toast } from '../../components/common/Toast';

/**
 * Loads the Razorpay checkout script on demand.
 *
 * ASSUMPTION (report per DEVELOPMENT_RULES.md section 7): API_CONTRACT.md
 * says only "use an approved gateway" without naming one. Razorpay is
 * assumed here as a common choice for this kind of project; if Member 6
 * configures a different provider, this function and the `pay()` call
 * below are the only places that need to change.
 */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Convert a slot's date+time into a local-time millisecond timestamp.
 * slot_date: 'YYYY-MM-DD', start_time: 'HH:mm:ss'
 */
function slotStartMs(slot) {
  const dateStr =
    typeof slot.slot_date === 'string'
      ? slot.slot_date.slice(0, 10)
      : new Date(slot.slot_date).toLocaleDateString('en-CA');
  const timeStr = String(slot.start_time).slice(0, 8);
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  const [hr, min, sec] = timeStr.split(':').map(Number);
  return new Date(yr, mo - 1, dy, hr, min, sec || 0).getTime();
}

/** Pickup window is 15 min; a slot is still bookable until the window closes. */
const PICKUP_WINDOW_MS = 15 * 60 * 1000;
/** 1-min grace so the UI and backend agree on the cutoff. */
const GRACE_MS = 60 * 1000;

/** Filter allSlots to only those whose pickup deadline is still in the future. */
function filterFutureSlots(allSlots) {
  const now = Date.now();
  return allSlots.filter((s) => slotStartMs(s) + PICKUP_WINDOW_MS > now - GRACE_MS);
}

export default function Checkout() {
  const { cart, subtotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  // All slots returned by the API (today only, from backend)
  const allSlotsRef = useRef([]);
  // Slots currently visible (real-time filtered)
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  // ── Load slots from backend ──────────────────────────────────────────────
  useEffect(() => {
    if (!cart.foodCourtId) {
      navigate('/cart', { replace: true });
      return;
    }

    const loadSlots = async () => {
      setLoadingSlots(true);
      setError('');
      try {
        const res = await pickupApi.getSlotsByFoodCourt(cart.foodCourtId);
        // Backend returns { data: { pickupSlots: [...] } }
        const raw = res?.data?.pickupSlots ?? res?.data ?? [];
        const all = Array.isArray(raw) ? raw : [];

        // Deduplicate by id (guard against DB duplication)
        const seen = new Set();
        const unique = all.filter((s) => {
          if (seen.has(String(s.id))) return false;
          seen.add(String(s.id));
          return true;
        });

        // Sort chronologically by start_time (backend only returns today)
        unique.sort((a, b) => slotStartMs(a) - slotStartMs(b));

        allSlotsRef.current = unique;
        // Apply real-time filter immediately
        setSlots(filterFutureSlots(unique));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.foodCourtId]);

  // ── Real-time clock: re-filter every 30 s ────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const updated = filterFutureSlots(allSlotsRef.current);
      setSlots(updated);
      // If the selected slot has just passed, deselect it
      setSelectedSlotId((prev) => {
        if (prev == null) return prev;
        const still = updated.some((s) => String(s.id) === String(prev));
        if (!still) {
          toast.error('Your selected slot has just passed. Please choose another.');
        }
        return still ? prev : null;
      });
    };

    const interval = setInterval(tick, 30_000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedSlotId) {
      toast.error('Please select a pickup slot');
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Create the order. The backend re-validates every item,
      // quantity, and price and returns the authoritative total
      // (DEVELOPMENT_RULES.md section 10).
      // Send IDs as numbers — the validator accepts both but numbers are safest.
      const orderRes = await orderApi.create({
        foodCourtId: Number(cart.foodCourtId),
        pickupSlotId: Number(selectedSlotId),
        items: cart.items.map((i) => ({
          foodItemId: Number(i.foodItemId),
          quantity: Number(i.quantity),
        })),
      });
      const order = orderRes.data?.order || orderRes.data;

      // 2. Start payment for that order.
      const paymentRes = await paymentApi.create(order.id);
      const paymentOrder = paymentRes.data?.payment || paymentRes.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error('Payment gateway could not load. Please try again.');
        setPlacingOrder(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: paymentOrder.key || paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || 'INR',
        order_id: paymentOrder.provider_order_id || paymentOrder.providerOrderId,
        name: 'Campus Eats',
        description: `Order #${order.order_number || order.id}`,
        handler: async (response) => {
          try {
            // 3. The backend, not this callback, decides whether the
            // payment is genuinely valid (DEVELOPMENT_RULES.md section 11).
            await paymentApi.verify({
              orderId: order.id,
              provider_order_id: response.razorpay_order_id,
              provider_payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment confirmed!');
            navigate(`/orders/${order.id}/confirmation`, { replace: true });
          } catch (err) {
            toast.error(
              err.message ||
                'We could not verify your payment. Contact support with your order ID.'
            );
          }
        },
        modal: {
          ondismiss: () => setPlacingOrder(false),
        },
        theme: { color: '#1F4B3F' },
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.message || 'Could not place your order. Please try again.');
      setPlacingOrder(false);
    }
  };

  if (!cart.foodCourtId) return null;

  const noSlots = !loadingSlots && !error && slots.length === 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Checkout</h1>
          <p className="mt-1 text-sm text-canteen-muted">{cart.foodCourtName}</p>
        </div>

        <section className="card p-5">
          <h2 className="font-display text-base font-bold">Order items</h2>
          <ul className="mt-3 divide-y divide-canteen-border">
            {cart.items.map((item) => (
              <li key={item.foodItemId} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {item.quantity} × {item.name}
                </span>
                <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-base font-bold">Pickup slot</h2>
          <p className="mt-1 text-sm text-canteen-muted">
            Choose a time to collect your order today.
          </p>
          <div className="mt-4">
            {loadingSlots && <Loader label="Loading slots…" />}
            {!loadingSlots && error && <ErrorState message={error} />}
            {noSlots && (
              <p className="rounded-lg bg-canteen-warnLight px-4 py-3 text-sm text-canteen-warn">
                No more pickup slots available for today. Slots open daily from 10:30 AM.
              </p>
            )}
            {!loadingSlots && !error && slots.length > 0 && (
              <PickupSlotPicker
                slots={slots}
                selectedId={selectedSlotId}
                onSelect={setSelectedSlotId}
              />
            )}
          </div>
        </section>

        <section className="card border-canteen-accent/40 bg-canteen-accent/5 p-5">
          <h2 className="font-display text-sm font-bold text-canteen-accentDark">Pickup policy</h2>
          <p className="mt-2 text-sm text-canteen-ink/80">
            You'll have a <strong>15-minute pickup window</strong> after your selected pickup time.
            Orders not collected within that window automatically expire, and{' '}
            <strong>no refund is issued after expiry</strong>, per project policy. Please make sure
            you can collect your order on time.
          </p>
        </section>
      </div>

      <div>
        <CartSummary
          subtotal={subtotal}
          itemCount={itemCount}
          ctaLabel={placingOrder ? 'Processing…' : 'Place order & pay'}
          ctaDisabled={placingOrder || !selectedSlotId || noSlots}
          onCta={handlePlaceOrder}
          note="Prices are recalculated and verified by the server before payment."
        />
      </div>
    </div>
  );
}

