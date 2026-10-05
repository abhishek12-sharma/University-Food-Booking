import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ShopkeeperSidebar from '../components/shopkeeper/ShopkeeperSidebar';
import ShopkeeperDashboard from '../pages/shopkeeper/ShopkeeperDashboard';
import MenuManagement from '../pages/shopkeeper/MenuManagement';
import AddFoodItem from '../pages/shopkeeper/AddFoodItem';
import EditFoodItem from '../pages/shopkeeper/EditFoodItem';
import Inventory from '../pages/shopkeeper/Inventory';
import PickupSlots from '../pages/shopkeeper/PickupSlots';
import Orders from '../pages/shopkeeper/Orders';
import OrderDetails from '../pages/shopkeeper/OrderDetails';
import QRScanner from '../pages/shopkeeper/QRScanner';
import FoodWaste from '../pages/shopkeeper/FoodWaste';
import Analytics from '../pages/shopkeeper/Analytics';
import { LoadingState } from '../components/shopkeeper/StateViews';

// RBAC gate: this module never assumes it can render for a non-shopkeeper.
// Real role enforcement lives in the backend (DEVELOPMENT_RULES.md section 10);
// this is only the frontend UX guard (spec section 11: "Frontend should hide
// unauthorized information").
function ShopkeeperLayout() {
  const { loading, isShopkeeper, foodCourtId } = useAuth();

  if (loading) return <LoadingState label="Checking your session…" />;
  if (!isShopkeeper) return <Navigate to="/login" replace />;
  if (!foodCourtId) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div className="card max-w-md">
          <p className="font-semibold text-gray-800">No food court assigned yet</p>
          <p className="mt-2 text-sm text-gray-500">
            Your account isn't linked to a food court (shopkeeper_assignments). Contact an admin for approval.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <ShopkeeperSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function ShopkeeperRoutes() {
  return (
    <Routes>
      <Route element={<ShopkeeperLayout />}>
        <Route path="dashboard" element={<ShopkeeperDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:orderId" element={<OrderDetails />} />
        <Route path="menu" element={<MenuManagement />} />
        <Route path="menu/add" element={<AddFoodItem />} />
        <Route path="menu/edit/:foodItemId" element={<EditFoodItem />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="pickup-slots" element={<PickupSlots />} />
        <Route path="qr-scanner" element={<QRScanner />} />
        <Route path="waste" element={<FoodWaste />} />
        <Route path="analytics" element={<Analytics />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
}
