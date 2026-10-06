import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFoodCourtItems, deleteFoodItem } from '../../services/shopkeeperApi';
import { LoadingState, ErrorState, EmptyState } from '../../components/shopkeeper/StateViews';

export default function MenuManagement() {
  const { foodCourtId } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFoodCourtItems(foodCourtId);
      const val = res?.data ?? res;
      setItems(Array.isArray(val) ? val : (val?.foodItems ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [foodCourtId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(item) {
    if (!window.confirm(`Remove "${item.name}" from the menu?`)) return;
    setDeletingId(item.id);
    try {
      await deleteFoodItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading menu…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Menu</h1>
        <Link to="/shopkeeper/menu/add" className="btn btn-primary">+ Add food item</Link>
      </div>

      {items.length === 0 ? (
        <EmptyState message="No food items yet. Add your first item to get started." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">₹{Number(item.price).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700">{item.quantity_available}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {item.is_available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <Link to={`/shopkeeper/menu/edit/${item.id}`} className="text-blue-600 hover:underline">
                        Edit
                      </Link>
                      <button
                        className="text-red-600 hover:underline disabled:opacity-40"
                        disabled={deletingId === item.id}
                        onClick={() => handleDelete(item)}
                      >
                        {deletingId === item.id ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
