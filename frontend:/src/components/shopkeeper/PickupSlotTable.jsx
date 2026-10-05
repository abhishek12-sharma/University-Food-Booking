function formatTime(t) {
  if (!t) return '—';
  return t.slice(0, 5);
}

export default function PickupSlotTable({ slots, onToggleStatus, togglingId }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Time window</th>
            <th className="px-4 py-3">Capacity</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {slots.map((slot) => {
            const pct = slot.capacity > 0 ? Math.min(100, Math.round((slot.booked_count / slot.capacity) * 100)) : 0;
            return (
              <tr key={slot.id}>
                <td className="px-4 py-3 text-gray-700">{slot.slot_date}</td>
                <td className="px-4 py-3 text-gray-700">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full ${pct >= 100 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {slot.booked_count}/{slot.capacity}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      slot.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : slot.status === 'FULL'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {slot.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {slot.status !== 'FULL' && (
                    <button
                      className="btn btn-secondary px-3 py-1.5 text-xs"
                      disabled={togglingId === slot.id}
                      onClick={() => onToggleStatus(slot, slot.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    >
                      {slot.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {slots.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                No pickup slots configured yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
