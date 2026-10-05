import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodItemForm from '../../components/shopkeeper/FoodItemForm';
import { createFoodItem } from '../../services/shopkeeperApi';
import { ErrorState } from '../../components/shopkeeper/StateViews';

export default function AddFoodItem() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError(null);
    try {
      // food_court_id is not sent — the backend derives it from the
      // authenticated shopkeeper's assignment (DEVELOPMENT_RULES.md section 13).
      await createFoodItem(payload);
      navigate('/shopkeeper/menu');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">Add food item</h1>
      {error && <ErrorState message={error} />}
      <FoodItemForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Add item" />
    </div>
  );
}
