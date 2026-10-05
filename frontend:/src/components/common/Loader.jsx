export default function Loader({ label = 'Loading…', fullPage = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-canteen-muted">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-canteen-border border-t-canteen-primary"
        aria-hidden="true"
      />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[60vh] items-center justify-center">{content}</div>;
  }

  return content;
}
