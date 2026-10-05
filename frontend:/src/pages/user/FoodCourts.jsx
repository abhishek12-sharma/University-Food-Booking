import { useEffect, useState } from 'react';
import foodCourtApi from '../../services/foodCourtApi';
import FoodCourtCard from '../../components/food/FoodCourtCard';
import SearchBar from '../../components/food/SearchBar';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

export default function FoodCourts() {
  const [foodCourts, setFoodCourts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await foodCourtApi.getAll();
      setFoodCourts(res.data?.foodCourts || res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = foodCourts.filter((fc) => fc.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Food courts</h1>
        <p className="mt-1 text-sm text-canteen-muted">Choose a food court to see its menu</p>
      </div>

      <div className="max-w-sm">
        <SearchBar value={search} onChange={setSearch} placeholder="Search food courts…" />
      </div>

      {loading && <Loader label="Loading food courts…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No food courts found" description="Try a different search term." />
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fc) => (
            <FoodCourtCard key={fc.id} foodCourt={fc} />
          ))}
        </div>
      )}
    </div>
  );
}
