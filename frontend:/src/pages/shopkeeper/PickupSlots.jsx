import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getFoodCourtPickupSlots, createPickupSlot, setPickupSlotStatus } from '../../services/shopkeeperApi';
import PickupSlotTable from '../../components/shopkeeper/PickupSlotTable';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';

const EMPTY_FORM = { slot_date: '', start_time: '', end_time: '', capacity: '' };

export default function PickupSlots() {
  const { foodCourtId } = useAuth();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [formError, setFormError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFoodCourtPickupSlots(foodCourtId);
      const val = res?.data ?? res;
      setSlots(Array.isArray(val) ? val : (val?.slots ?? val?.pickupSlots ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [foodCourtId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.slot_date || !form.start_time || !form.end_time || !form.capacity) {
      setFormError('All fields are required.');
      return;
    }
    if (Number(form.capacity) <= 0) {
      setFormError('Capacity must be greater than zero (DATABASE_SCHEMA.md constraint).');
      return;
    }
    if (form.end_time <= form.start_time) {
      setFormError('End time must be after start time.');
      return;
    }
    setCreating(true);
    try {
      await createPickupSlot({
        food_court_id: foodCourtId,
        slot_date: form.slot_date,
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: Number(form.capacity)
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(slot, nextStatus) {
    setTogglingId(slot.id);
    setSlots((prev) => prev.map((s) => (s.id === slot.id ? { ...s, status: nextStatus } : s)));
    try {
      await setPickupSlotStatus(slot.id, nextStatus);
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <LoadingState label="Loading pickup slots…" />;
  if (error && slots.length === 0) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">Pickup slots</h1>

      <form onSubmit={handleCreate} className="card grid grid-cols-1 gap-4 md:grid-cols-5 md:items-end">
        <div>
          <label className="label" htmlFor="slot_date">Date</label>
          <input
            id="slot_date"
            type="date"
            className="input"
            value={form.slot_date}
            onChange={(e) => setForm((f) => ({ ...f, slot_date: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="start_time">Start time</label>
          <input
            id="start_time"
            type="time"
            className="input"
            value={form.start_time}
            onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="end_time">End time</label>
          <input
            id="end_time"
            type="time"
            className="input"
            value={form.end_time}
            onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
          />
        </div>
        <div>
          <label className="label" htmlFor="capacity">Capacity</label>
          <input
            id="capacity"
            type="number"
            min="1"
            className="input"
            value={form.capacity}
            onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={creating}>
          {creating ? 'Creating…' : '+ Create slot'}
        </button>
        {formError && <p className="md:col-span-5 text-xs text-red-600">{formError}</p>}
      </form>

      {error && <ErrorState message={error} onRetry={load} />}

      <PickupSlotTable slots={slots} onToggleStatus={handleToggleStatus} togglingId={togglingId} />
    </div>
  );
}
