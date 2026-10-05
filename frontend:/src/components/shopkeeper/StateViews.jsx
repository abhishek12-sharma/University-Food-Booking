export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-400">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card border-red-200 bg-red-50 text-center">
      <p className="text-sm font-medium text-red-700">{message || 'Something went wrong.'}</p>
      {onRetry && (
        <button className="btn btn-secondary mt-3" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="card border-dashed text-center text-sm text-gray-400">
      {message}
    </div>
  );
}
