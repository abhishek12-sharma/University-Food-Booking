export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-canteen-border px-6 py-12 text-center">
      <p className="font-display text-lg font-bold text-canteen-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-canteen-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
