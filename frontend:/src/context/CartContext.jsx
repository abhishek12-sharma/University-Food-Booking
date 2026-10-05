import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const CartContext = createContext(null);

const STORAGE_KEY = 'campus_eats_cart';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { foodCourtId: null, foodCourtName: null, items: [] };
  } catch {
    return { foodCourtId: null, foodCourtName: null, items: [] };
  }
}

/**
 * Cart is a client-side convenience for building an order before
 * checkout. The subtotal shown here is informational only — the
 * backend recalculates and verifies the real total when the order is
 * created (DEVELOPMENT_RULES.md section 9, brief section 5/6).
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  // Adding an item from a different food court replaces the cart,
  // since an order can only belong to one food court (brief section 5:
  // "Food court validation").
  const addItem = useCallback((foodItem, foodCourt, quantity = 1) => {
    setCart((prev) => {
      const sameCourt = prev.foodCourtId === foodCourt.id;
      const baseItems = sameCourt ? prev.items : [];
      const existing = baseItems.find((i) => i.foodItemId === foodItem.id);

      const items = existing
        ? baseItems.map((i) =>
            i.foodItemId === foodItem.id ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [
            ...baseItems,
            {
              foodItemId: foodItem.id,
              name: foodItem.name,
              price: foodItem.price,
              quantityAvailable: foodItem.quantity_available ?? foodItem.quantityAvailable,
              imageUrl: foodItem.image_url ?? foodItem.imageUrl,
              quantity,
            },
          ];

      return { foodCourtId: foodCourt.id, foodCourtName: foodCourt.name, items };
    });
  }, []);

  const updateQuantity = useCallback((foodItemId, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const items = prev.items.filter((i) => i.foodItemId !== foodItemId);
        return { ...prev, items, foodCourtId: items.length ? prev.foodCourtId : null };
      }
      const items = prev.items.map((i) =>
        i.foodItemId === foodItemId
          ? { ...i, quantity: Math.min(quantity, i.quantityAvailable ?? quantity) }
          : i
      );
      return { ...prev, items };
    });
  }, []);

  const removeItem = useCallback((foodItemId) => {
    setCart((prev) => {
      const items = prev.items.filter((i) => i.foodItemId !== foodItemId);
      return { foodCourtId: items.length ? prev.foodCourtId : null, foodCourtName: items.length ? prev.foodCourtName : null, items };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({ foodCourtId: null, foodCourtName: null, items: [] });
  }, []);

  const subtotal = useMemo(
    () => cart.items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
    [cart.items]
  );

  const itemCount = useMemo(() => cart.items.reduce((sum, i) => sum + i.quantity, 0), [cart.items]);

  const value = useMemo(
    () => ({ cart, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount }),
    [cart, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
