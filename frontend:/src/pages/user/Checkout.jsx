import { useEffect, useState } from 'react';
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

export default function Checkout() {
  const { cart, subtotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [error, setError] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

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
        setSlots(res.data?.pickupSlots || res.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.foodCourtId]);

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
      const orderRes = await orderApi.create({
        foodCourtId: cart.foodCourtId,
        pickupSlotId: selectedSlotId,
        items: cart.items.map((i) => ({ foodItemId: i.foodItemId, quantity: i.quantity })),
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
            // payment is genuinely valid (DEVELOPMENT_RULES.md
            // section 11).
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
            toast.error(err.message || 'We could not verify your payment. Contact support with your order ID.');
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
          <p className="mt-1 text-sm text-canteen-muted">Choose when you'll collect your order.</p>
          <div className="mt-4">
            {loadingSlots && <Loader label="Loading slots…" />}
            {!loadingSlots && error && <ErrorState message={error} />}
            {!loadingSlots && !error && slots.length === 0 && (
              <p className="text-sm text-canteen-muted">No pickup slots are available for this food court right now.</p>
            )}
            {!loadingSlots && !error && slots.length > 0 && (
              <PickupSlotPicker slots={slots} selectedId={selectedSlotId} onSelect={setSelectedSlotId} />
            )}
          </div>
        </section>

        <section className="card border-canteen-accent/40 bg-canteen-accent/5 p-5">
          <h2 className="font-display text-sm font-bold text-canteen-accentDark">Pickup policy</h2>
          <p className="mt-2 text-sm text-canteen-ink/80">
            You'll have a <strong>15-minute pickup window</strong> after your selected pickup time. Orders not
            collected within that window automatically expire, and{' '}
            <strong>no refund is issued after expiry</strong>, per project policy. Please make sure you can collect
            your order on time.
          </p>
        </section>
      </div>

      <div>
        <CartSummary
          subtotal={subtotal}
          itemCount={itemCount}
          ctaLabel={placingOrder ? 'Processing…' : 'Place order & pay'}
          ctaDisabled={placingOrder || !selectedSlotId}
          onCta={handlePlaceOrder}
          note="Prices are recalculated and verified by the server before payment."
        />
      </div>
    </div>
  );
}
