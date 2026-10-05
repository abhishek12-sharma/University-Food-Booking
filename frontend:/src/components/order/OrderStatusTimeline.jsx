const HAPPY_PATH = ['CONFIRMED', 'PREPARING', 'READY', 'PICKED_UP'];
const STEP_LABELS = {
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  PICKED_UP: 'Picked up',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export default function OrderStatusTimeline({ status }) {
  const isTerminalBad = status === 'EXPIRED' || status === 'CANCELLED';
  const steps = isTerminalBad
    ? [...HAPPY_PATH.slice(0, HAPPY_PATH.indexOf('READY') + 1), status]
    : HAPPY_PATH;

  const currentIndex = steps.indexOf(status);

  return (
    <ol className="flex items-center">
      {steps.map((step, index) => {
        const done = index <= currentIndex;
        const isLast = index === steps.length - 1;
        const bad = isTerminalBad && step === status;

        return (
          <li key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  bad
                    ? 'bg-canteen-warn text-white'
                    : done
                      ? 'bg-canteen-primary text-white'
                      : 'bg-canteen-border text-canteen-muted'
                }`}
              >
                {done && !bad ? '✓' : index + 1}
              </span>
              <span className={`text-[11px] font-semibold ${done ? 'text-canteen-ink' : 'text-canteen-muted'}`}>
                {STEP_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <span className={`mx-1.5 mb-4 h-0.5 flex-1 rounded ${index < currentIndex ? 'bg-canteen-primary' : 'bg-canteen-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
