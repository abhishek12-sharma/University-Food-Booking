import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/shopkeeper/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/shopkeeper/orders', label: 'Orders', icon: '🧾' },
  { to: '/shopkeeper/menu', label: 'Menu', icon: '🍔' },
  { to: '/shopkeeper/inventory', label: 'Inventory', icon: '📦' },
  { to: '/shopkeeper/pickup-slots', label: 'Pickup Slots', icon: '⏰' },
  { to: '/shopkeeper/qr-scanner', label: 'QR Scanner', icon: '📷' },
  { to: '/shopkeeper/waste', label: 'Food Waste', icon: '🗑️' },
  { to: '/shopkeeper/analytics', label: 'Analytics', icon: '📊' }
];

export default function ShopkeeperSidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-56 flex-col justify-between border-r border-gray-200 bg-white">
      <div>
        <div className="px-4 py-5">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Food Court</p>
          <p className="truncate text-lg font-bold text-gray-900">
            {user?.foodCourtName || 'Your Food Court'}
          </p>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="border-t border-gray-200 p-4">
        <p className="truncate text-sm font-medium text-gray-800">{user?.name || 'Shopkeeper'}</p>
        <p className="truncate text-xs text-gray-400">{user?.email}</p>
        <button onClick={logout} className="btn btn-secondary mt-3 w-full">
          Log out
        </button>
      </div>
    </aside>
  );
}
