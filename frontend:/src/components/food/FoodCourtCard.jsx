import { Link } from 'react-router-dom';

function isOpenNow(openingTime, closingTime) {
  if (!openingTime || !closingTime) return null;
  const now = new Date();
  const [oh, om] = openingTime.split(':').map(Number);
  const [ch, cm] = closingTime.split(':').map(Number);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= oh * 60 + om && nowMinutes <= ch * 60 + cm;
}

export default function FoodCourtCard({ foodCourt }) {
  const open = foodCourt.status === 'ACTIVE' && isOpenNow(foodCourt.opening_time, foodCourt.closing_time);

  return (
    <Link
      to={`/food-courts/${foodCourt.id}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="flex h-28 items-center justify-center bg-gradient-to-br from-canteen-primary to-canteen-primaryDark">
        <span className="font-display text-3xl font-extrabold text-white/90">{foodCourt.name?.[0] || 'F'}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{foodCourt.name}</h3>
          <span
            className={`chip shrink-0 ${
              open ? 'bg-canteen-okLight text-canteen-primaryDark' : 'bg-canteen-border/60 text-canteen-muted'
            }`}
          >
            {open === null ? 'Hours vary' : open ? 'Open now' : 'Closed'}
          </span>
        </div>
        {foodCourt.location && <p className="text-sm text-canteen-muted">{foodCourt.location}</p>}
        {foodCourt.opening_time && foodCourt.closing_time && (
          <p className="mt-auto text-xs font-medium text-canteen-muted">
            {foodCourt.opening_time} – {foodCourt.closing_time}
          </p>
        )}
      </div>
    </Link>
  );
}
