import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import foodCourtApi from '../../services/foodCourtApi';
import foodApi from '../../services/foodApi';
import { useCart } from '../../hooks/useCart';
import FoodItemCard from '../../components/food/FoodItemCard';
import CategoryFilter from '../../components/food/CategoryFilter';
import SearchBar from '../../components/food/SearchBar';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { toast } from '../../components/common/Toast';

export default function FoodCourtDetails() {
  const { foodCourtId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [foodCourt, setFoodCourt] = useState(null);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [courtRes, itemsRes] = await Promise.all([
        foodCourtApi.getById(foodCourtId),
        foodApi.getByFoodCourt(foodCourtId),
      ]);
      setFoodCourt(courtRes.data?.foodCourt || courtRes.data);
      setItems(itemsRes.data?.foodItems || itemsRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foodCourtId]);

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))],
    [items]
  );

  const filtered = items.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || item.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = (item) => {
    if (!item.is_available || item.quantity_available <= 0) return;
    addItem(item, foodCourt);
    toast.success(`Added ${item.name} to cart`);
  };

  if (loading) return <Loader fullPage label="Loading menu…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!foodCourt) return <EmptyState title="Food court not found" />;

  return (
    <div className="space-y-5">
      <div>
        <button type="button" onClick={() => navigate('/food-courts')} className="text-sm font-semibold text-canteen-muted hover:text-canteen-ink">
          ← All food courts
        </button>
        <h1 className="mt-2 font-display text-2xl font-extrabold">{foodCourt.name}</h1>
        <p className="mt-1 text-sm text-canteen-muted">
          {foodCourt.location} {foodCourt.opening_time && `· ${foodCourt.opening_time}–${foodCourt.closing_time}`}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={search} onChange={setSearch} />
        <CategoryFilter categories={categories} active={category} onChange={setCategory} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No items match" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item) => (
            <FoodItemCard
              key={item.id}
              item={item}
              onAdd={handleAdd}
              onViewDetails={(i) => navigate(`/food-items/${i.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
