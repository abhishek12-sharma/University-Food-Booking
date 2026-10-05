// src/components/admin/AdminSidebar.jsx
//
// Left navigation for the admin panel. Route guarding happens in
// AdminRoutes.jsx, not here — this is presentation only.

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  ClipboardList,
  CreditCard,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/shopkeepers", label: "Shopkeepers", icon: Store },
  { to: "/admin/food-courts", label: "Food Courts", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ClipboardList },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-[#14231F] text-[#EFEDE4] flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-white/10">
        <div className="text-[15px] font-semibold tracking-tight">Campus Dining</div>
        <div className="text-[12px] text-[#9CB3AC]">Admin Console</div>
      </div>

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-sm text-[13.5px] transition-colors ${
                isActive
                  ? "bg-[#D98E04] text-[#14231F] font-medium"
                  : "text-[#D7D3C4] hover:bg-white/5"
              }`
            }
          >
            <Icon className="w-4 h-4" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10 text-[11.5px] text-[#7E9591]">
        University Food Pre-Booking System
      </div>
    </aside>
  );
}
