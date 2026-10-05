import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ToastViewport from './components/common/Toast';
import UserRoutes from './routes/UserRoutes';
import AdminRoutes from './routes/AdminRoutes';
import ShopkeeperRoutes from './routes/ShopkeeperRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastViewport />
          <Routes>
            {/* Admin panel — all pages under /admin/* */}
            <Route path="/admin/*" element={<AdminRoutes />} />
            {/* Shopkeeper panel — all pages under /shopkeeper/* */}
            <Route path="/shopkeeper/*" element={<ShopkeeperRoutes />} />
            {/* User panel — handles /, /login, /register, /dashboard, /food-courts, etc. */}
            <Route path="/*" element={<UserRoutes />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
