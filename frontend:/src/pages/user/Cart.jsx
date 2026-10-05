import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import EmptyState from '../../components/common/EmptyState';

export default function Cart() {
  const { cart, updateQuantity, removeItem, clearCart, subtotal, itemCount } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Add items from a food court's menu to get started."
        action={
          <button type="button" onClick={() => navigate('/food-courts')} className="btn-primary">
            Browse food courts
          </button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold">Your cart</h1>
            <p className="mt-1 text-sm text-canteen-muted">{cart.foodCourtName}</p>
          </div>
          <button type="button" onClick={clearCart} className="text-sm font-semibold text-canteen-warn hover:underline">
            Clear cart
          </button>
        </div>

        <div className="card divide-y divide-canteen-border px-4">
          {cart.items.map((item) => (
            <CartItem
              key={item.foodItemId}
              item={item}
              onIncrease={() => updateQuantity(item.foodItemId, item.quantity + 1)}
              onDecrease={() => updateQuantity(item.foodItemId, item.quantity - 1)}
              onRemove={() => removeItem(item.foodItemId)}
            />
          ))}
        </div>
      </div>

      <div>
        <CartSummary
          subtotal={subtotal}
          itemCount={itemCount}
          ctaLabel="Proceed to checkout"
          onCta={() => navigate('/checkout')}
        />
      </div>
    </div>
  );
}
