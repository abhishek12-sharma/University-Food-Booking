import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInventoryForFoodCourt, updateItemAvailability, updateItemQuantity } from '../../services/inventoryApi';
import { getShopkeeperOrders } from '../../services/shopkeeperApi';
import InventoryTable from '../../components/shopkeeper/InventoryTable';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';

function computeSoldToday(orders, items) {
  const soldByItemId = {};
  const todayStr = new Date().toDateString();
  orders
    .filter((o) => new Date(o.created_at).toDateString() === todayStr && o.status !== 'CANCELLED')
    .forEach((o) => {
      (o.items || o.order_items || []).forEach((li) => {
        const id = li.food_item_id || li.id;
        soldByItemId[id] = (soldByItemId[id] || 0) + li.quantity;
      });
    });
  items.forEach((i) => {
    if (!(i.id in soldByItemId)) soldByItemId[i.id] = 0;
  });
  return soldByItemId;
}

export default function Inventory() {
  const { foodCourtId } = useAuth();
  const [items, setItems] = useState([]);
  const [soldByItemId, setSoldByItemId] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, ordersRes] = await Promise.all([
        getInventoryForFoodCourt(foodCourtId),
        getShopkeeperOrders().catch(() => ({ data: [] }))
      ]);
      const itemsVal = itemsRes?.data ?? itemsRes;
      const nextItems = Array.isArray(itemsVal) ? itemsVal : (itemsVal?.foodItems ?? []);
      const ordersVal = ordersRes?.data ?? ordersRes;
      const orderList = Array.isArray(ordersVal) ? ordersVal : (ordersVal?.orders ?? []);
      setItems(nextItems);
      setSoldByItemId(computeSoldToday(orderList, nextItems));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [foodCourtId]);

  useEffect(() => {
    load();
  }, [load]);

  // Optimistic update, then refresh from backend — backend remains the
  // authoritative source of quantity_available (spec section 8).
  async function handleUpdateQuantity(item, newQty) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, quantity_available: newQty } : i)));
    try {
      await updateItemQuantity(item.id, newQty);
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  async function handleToggleAvailability(item, nextAvailable) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_available: nextAvailable } : i)));
    try {
      await updateItemAvailability(item.id, nextAvailable);
    } catch (err) {
      setError(err.message);
      load();
    }
  }

  if (loading) return <LoadingState label="Loading inventory…" />;
  if (error && items.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
        <button className="btn btn-secondary" onClick={load}>Refresh</button>
      </div>
      {error && <ErrorState message={error} onRetry={load} />}
      <InventoryTable
        items={items}
        soldByItemId={soldByItemId}
        onUpdateQuantity={handleUpdateQuantity}
        onToggleAvailability={handleToggleAvailability}
      />
    </div>
  );
}
