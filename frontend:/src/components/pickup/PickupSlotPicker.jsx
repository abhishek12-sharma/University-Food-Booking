export default function PickupSlotPicker({ slots, selectedId, onSelect }) {
  if (!slots?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => {
        const full = slot.status === 'FULL' || slot.booked_count >= slot.capacity;
        const disabled = full || slot.status === 'INACTIVE';
        const selected = selectedId === slot.id;

        return (
          <button
            key={slot.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(slot.id)}
            className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
              selected
                ? 'border-canteen-primary bg-canteen-okLight'
                : disabled
                  ? 'cursor-not-allowed border-canteen-border bg-canteen-bg text-canteen-muted'
                  : 'border-canteen-border hover:border-canteen-primary'
            }`}
          >
            <p className="font-semibold">
              {slot.start_time}–{slot.end_time}
            </p>
            <p className="text-xs text-canteen-muted">
              {disabled ? 'Full' : `${slot.capacity - slot.booked_count} spots left`}
            </p>
          </button>
        );
      })}
    </div>
  );
}
