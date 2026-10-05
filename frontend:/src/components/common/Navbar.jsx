import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import NotificationBell from '../notifications/NotificationBell';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/food-courts', label: 'Food courts' },
  { to: '/orders', label: 'Orders' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-canteen-border bg-canteen-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-8">
          <NavLink to="/dashboard" className="font-display text-lg font-extrabold tracking-tight text-canteen-primary">
            Campus Eats
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-chip px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-canteen-okLight text-canteen-primaryDark' : 'text-canteen-muted hover:text-canteen-ink'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <NotificationBell />

          <NavLink to="/cart" className="relative rounded-full p-2 text-canteen-ink hover:bg-canteen-bg" aria-label="Cart">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h1.6l2.1 12.2a2 2 0 0 0 2 1.65h8.6a2 2 0 0 0 1.98-1.7L20.4 8H6" />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="17" cy="20" r="1.4" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-chip bg-canteen-accent px-1 text-[11px] font-bold text-canteen-ink">
                {itemCount}
              </span>
            )}
          </NavLink>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-chip border border-canteen-border px-3 py-1.5 text-sm font-semibold text-canteen-ink hover:border-canteen-primary"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-canteen-primary text-xs font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Account'}</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 w-44 rounded-card border border-canteen-border bg-white py-1 shadow-card">
                <NavLink
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 text-sm text-canteen-ink hover:bg-canteen-bg"
                >
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-canteen-warn hover:bg-canteen-warnLight"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-canteen-border px-4 py-1.5 md:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-chip px-3 py-1.5 text-sm font-semibold ${
                isActive ? 'bg-canteen-okLight text-canteen-primaryDark' : 'text-canteen-muted'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
