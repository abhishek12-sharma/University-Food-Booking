import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { recordFoodWaste, getFoodWasteRecords, getWasteAnalytics } from '../../services/wasteApi';
import { getInventoryForFoodCourt } from '../../services/inventoryApi';
import { LoadingState, ErrorState, EmptyState } from '../../components/shopkeeper/StateViews';

const EMPTY_FORM = {
  food_item_id: '',
  waste_date: new Date().toISOString().slice(0, 10),
  prepared_quantity: '',
  sold_quantity: '',
  remaining_quantity: '',
  wasted_quantity: ''
};

export default function FoodWaste() {
  const { foodCourtId } = useAuth();
  const [items, setItems] = useState([]);
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsRes, recordsRes, analyticsRes] = await Promise.allSettled([
        getInventoryForFoodCourt(foodCourtId),
        getFoodWasteRecords(),
        getWasteAnalytics()
      ]);
      if (itemsRes.status === 'fulfilled') setItems(itemsRes.value.data || []);
      if (recordsRes.status === 'fulfilled') setRecords(recordsRes.value.data || []);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data || null);
      if (recordsRes.status === 'rejected') throw recordsRes.reason;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [foodCourtId]);

  useEffect(() => {
    load();
  }, [load]);

  // DATABASE_SCHEMA.md constraints: all quantities non-negative,
  // wasted_quantity <= prepared_quantity. Client-side check is a UX guard only.
  function validate() {
    const { prepared_quantity: p, sold_quantity: s, remaining_quantity: r, wasted_quantity: w, food_item_id } = form;
    if (!food_item_id) return 'Select a food item.';
    const nums = [p, s, r, w].map(Number);
    if (nums.some((n) => Number.isNaN(n) || n < 0)) return 'Quantities must be non-negative numbers.';
    if (Number(w) > Number(p)) return 'Wasted quantity cannot exceed prepared quantity.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await recordFoodWaste({
        food_item_id: Number(form.food_item_id),
        waste_date: form.waste_date,
        prepared_quantity: Number(form.prepared_quantity),
        sold_quantity: Number(form.sold_quantity),
        remaining_quantity: Number(form.remaining_quantity),
        wasted_quantity: Number(form.wasted_quantity)
      });
      setForm({ ...EMPTY_FORM, waste_date: form.waste_date });
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading food waste…" />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Food waste</h1>

      {analytics && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="card">
            <p className="text-xs text-gray-400">Waste rate</p>
            <p className="text-xl font-bold text-red-600">
              {analytics.waste_rate != null ? `${Number(analytics.waste_rate).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Total prepared</p>
            <p className="text-xl font-bold text-gray-800">{analytics.total_prepared ?? '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Total sold</p>
            <p className="text-xl font-bold text-gray-800">{analytics.total_sold ?? '—'}</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-400">Total wasted</p>
            <p className="text-xl font-bold text-gray-800">{analytics.total_wasted ?? '—'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card grid grid-cols-2 gap-4 md:grid-cols-6">
        <div className="col-span-2">
          <label className="label" htmlFor="food_item_id">Food item</label>
          <select
            id="food_item_id"
            className="input"
            value={form.food_item_id}
            onChange={(e) => setForm((f) => ({ ...f, food_item_id: e.target.value }))}
          >
            <option value="">Select…</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="waste_date">Date</label>
          <input
            id="waste_date"
            type="date"
            className="input"
            value={form.waste_date}
            onChange={(e) => setForm((f) => ({ ...f, waste_date: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="prepared">Prepared</label>
          <input id="prepared" type="number" min="0" className="input" value={form.prepared_quantity}
            onChange={(e) => setForm((f) => ({ ...f, prepared_quantity: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="sold">Sold</label>
          <input id="sold" type="number" min="0" className="input" value={form.sold_quantity}
            onChange={(e) => setForm((f) => ({ ...f, sold_quantity: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="remaining">Remaining</label>
          <input id="remaining" type="number" min="0" className="input" value={form.remaining_quantity}
            onChange={(e) => setForm((f) => ({ ...f, remaining_quantity: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="wasted">Wasted</label>
          <input id="wasted" type="number" min="0" className="input" value={form.wasted_quantity}
            onChange={(e) => setForm((f) => ({ ...f, wasted_quantity: e.target.value }))} />
        </div>
        <div className="col-span-2 flex items-end md:col-span-6">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Recording…' : 'Record waste'}
          </button>
        </div>
        {formError && <p className="col-span-2 text-xs text-red-600 md:col-span-6">{formError}</p>}
      </form>

      {error && <ErrorState message={error} onRetry={load} />}

      {records.length === 0 ? (
        <EmptyState message="No waste records yet." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Prepared</th>
                <th className="px-4 py-3">Sold</th>
                <th className="px-4 py-3">Remaining</th>
                <th className="px-4 py-3">Wasted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-gray-700">{r.waste_date}</td>
                  <td className="px-4 py-3 text-gray-900">{r.food_item_name || r.food_item_id}</td>
                  <td className="px-4 py-3 text-gray-700">{r.prepared_quantity}</td>
                  <td className="px-4 py-3 text-gray-700">{r.sold_quantity}</td>
                  <td className="px-4 py-3 text-gray-700">{r.remaining_quantity}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{r.wasted_quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
