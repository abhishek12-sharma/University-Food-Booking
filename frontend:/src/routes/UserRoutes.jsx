import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';
import UserLayout from '../layouts/UserLayout';

import Login from '../pages/user/Login';
import Register from '../pages/user/Register';
import Dashboard from '../pages/user/Dashboard';
import FoodCourts from '../pages/user/FoodCourts';
import FoodCourtDetails from '../pages/user/FoodCourtDetails';
import FoodItemDetails from '../pages/user/FoodItemDetails';
import Cart from '../pages/user/Cart';
import Checkout from '../pages/user/Checkout';
import OrderConfirmation from '../pages/user/OrderConfirmation';
import ActiveOrder from '../pages/user/ActiveOrder';
import OrderHistory from '../pages/user/OrderHistory';
import OrderDetails from '../pages/user/OrderDetails';
import Notifications from '../pages/user/Notifications';
import Profile from '../pages/user/Profile';

/**
 * Route table for the USER module only.
 *
 * Per DEVELOPMENT_RULES.md / brief section 16, this app never mounts
 * admin or shopkeeper routes — those live in Member 4's and
 * Member 5's own applications.
 */
export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/food-courts" element={<FoodCourts />} />
        <Route path="/food-courts/:foodCourtId" element={<FoodCourtDetails />} />
        <Route path="/food-items/:foodItemId" element={<FoodItemDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/orders/:orderId" element={<OrderDetails />} />
        <Route path="/orders/:orderId/track" element={<ActiveOrder />} />
        <Route path="/orders/:orderId/confirmation" element={<OrderConfirmation />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
