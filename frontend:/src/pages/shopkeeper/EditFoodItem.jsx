import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import FoodItemForm from '../../components/shopkeeper/FoodItemForm';
import { getFoodItem, updateFoodItem } from '../../services/shopkeeperApi';
import { LoadingState, ErrorState } from '../../components/shopkeeper/StateViews';

export default function EditFoodItem() {
  const { foodItemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getFoodItem(foodItemId);
        if (!cancelled) setItem(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [foodItemId]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError(null);
    try {
      // Prevent editing another food court's item client-side as a UX guard;
      // the backend independently rejects this per DEVELOPMENT_RULES.md section 13.
      await updateFoodItem(foodItemId, payload);
      navigate('/shopkeeper/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Loading item…" />;
  if (error && !item) return <ErrorState message={error} />;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Edit food item</h1>
      {error && <ErrorState message={error} />}
      <FoodItemForm initialValue={item} onSubmit={handleSubmit} submitting={submitting} submitLabel="Save changes" />
    </div>
  );
}
