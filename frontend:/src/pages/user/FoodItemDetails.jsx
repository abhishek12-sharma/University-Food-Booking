import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import foodApi from '../../services/foodApi';
import foodCourtApi from '../../services/foodCourtApi';
import { useCart } from '../../hooks/useCart';
import { formatCurrency } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import { toast } from '../../components/common/Toast';

export default function FoodItemDetails() {
  const { foodItemId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [foodCourt, setFoodCourt] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await foodApi.getById(foodItemId);
      const data = res.data?.foodItem || res.data;
      setItem(data);
      if (data?.food_court_id) {
        const courtRes = await foodCourtApi.getById(data.food_court_id);
        setFoodCourt(courtRes.data?.foodCourt || courtRes.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodItemId]);

  if (loading) return <Loader fullPage label="Loading item…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!item) return null;

  const available = item.is_available && item.quantity_available > 0;
  const maxQuantity = Math.max(1, item.quantity_available || 1);

  const handleAdd = () => {
    if (!available || !foodCourt) return;
    addItem(item, foodCourt, quantity);
    toast.success(`Added ${quantity} × ${item.name} to cart`);
    navigate('/cart');
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <button type="button" onClick={() => navigate(-1)} className="text-sm font-semibold text-canteen-muted hover:text-canteen-ink">
        ← Back to menu
      </button>

      <div className="card overflow-hidden">
        <div className="flex h-48 items-center justify-center bg-canteen-bg">
          {item.image_url ? (
            <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-4xl font-bold text-canteen-border">{item.name?.[0]}</span>
          )}
        </div>

        <div className="space-y-4 p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-display text-xl font-extrabold">{item.name}</h1>
              {!available && <span className="chip shrink-0 bg-canteen-warnLight text-canteen-warn">Unavailable</span>}
            </div>
            {foodCourt && <p className="mt-1 text-sm text-canteen-muted">{foodCourt.name}</p>}
          </div>

          {item.description && <p className="text-sm text-canteen-ink/80">{item.description}</p>}

          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-extrabold">{formatCurrency(item.price)}</span>
            {available && <span className="text-xs text-canteen-muted">{item.quantity_available} available</span>}
          </div>

          {available && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-canteen-muted">Quantity</span>
              <div className="flex items-center gap-3 rounded-chip border border-canteen-border px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="text-canteen-ink"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  aria-label="Increase quantity"
                  className="text-canteen-ink"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <button type="button" onClick={handleAdd} disabled={!available} className="btn-primary w-full">
            {available ? 'Add to cart' : 'Sold out'}
          </button>
        </div>
      </div>
    </div>
  );
}
