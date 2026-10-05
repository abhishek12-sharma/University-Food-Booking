import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import foodCourtApi from '../../services/foodCourtApi';
import orderApi from '../../services/orderApi';
import { useAuth } from '../../hooks/useAuth';
import FoodCourtCard from '../../components/food/FoodCourtCard';
import OrderCard from '../../components/order/OrderCard';
import OrderStatusTimeline from '../../components/order/OrderStatusTimeline';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const ACTIVE_STATUSES = ['CONFIRMED', 'PREPARING', 'READY'];

export default function Dashboard() {
  const { user } = useAuth();
  const [foodCourts, setFoodCourts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [courtsRes, ordersRes] = await Promise.all([foodCourtApi.getAll(), orderApi.getMyOrders()]);
      setFoodCourts(courtsRes.data?.foodCourts || courtsRes.data || []);
      setOrders(ordersRes.data?.orders || ordersRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader fullPage label="Loading your dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const activeOrder = orders.find((o) => ACTIVE_STATUSES.includes(o.status));
  const recentOrders = orders.slice(0, 3);
  const openCourts = foodCourts.filter((fc) => fc.status === 'ACTIVE').slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold">Hi{user?.name ? `, ${user.name.split(' ')[0]}` : ''}</h1>
        <p className="mt-1 text-sm text-canteen-muted">What are you in the mood for today?</p>
      </div>

      {activeOrder && (
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Active order</h2>
            <Link to={`/orders/${activeOrder.id}/track`} className="text-sm font-semibold text-canteen-primary hover:underline">
              View details
            </Link>
          </div>
          <p className="mt-1 text-sm text-canteen-muted">{activeOrder.food_court_name || 'Food court'}</p>
          <div className="mt-5">
            <OrderStatusTimeline status={activeOrder.status} />
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Food courts</h2>
          <Link to="/food-courts" className="text-sm font-semibold text-canteen-primary hover:underline">
            View all
          </Link>
        </div>
        {openCourts.length === 0 ? (
          <div className="mt-3">
            <EmptyState title="No food courts available right now" description="Check back a little later." />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {openCourts.map((fc) => (
              <FoodCourtCard key={fc.id} foodCourt={fc} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent orders</h2>
          <Link to="/orders" className="text-sm font-semibold text-canteen-primary hover:underline">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No orders yet"
              description="Browse a food court and place your first pre-order."
              action={
                <Link to="/food-courts" className="btn-primary">
                  Browse food courts
                </Link>
              }
            />
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {recentOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
