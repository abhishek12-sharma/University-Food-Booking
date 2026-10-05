export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-canteen-warn/30 bg-canteen-warnLight px-6 py-10 text-center">
      <p className="font-display text-base font-bold text-canteen-warn">Something went wrong</p>
      <p className="max-w-sm text-sm text-canteen-warn/90">
        {message || 'We could not load this. Check your connection and try again.'}
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-secondary">
          Try again
        </button>
      )}
    </div>
  );
}
