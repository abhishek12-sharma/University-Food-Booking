// src/components/admin/AdminHeader.jsx
//
// Top bar shown on every admin page. Reads the current user from the shared
// AuthContext (owned by Member 1 / Auth). If that context's shape differs
// from the assumption below (`{ user, logout }`), update this one import —
// nothing else in the admin panel depends on auth internals directly.

import { useNavigate } from "react-router-dom";
import { LogOut, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // ASSUMPTION: see file header note

export default function AdminHeader({ title, subtitle }) {
  const navigate = useNavigate();
  const auth = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAuth();
    } catch {
      return { user: { name: "Admin" }, logout: () => {} };
    }
  })();

  const handleLogout = () => {
    auth.logout?.();
    navigate("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-[#DEDACD] bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-medium text-[#1B1B18]">{title}</h1>
        {subtitle && <p className="text-[13px] text-[#8A8676] mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-sm hover:bg-[#F1EFE8] text-[#6B675C]" aria-label="Notifications">
          <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
        </button>
        <div className="flex items-center gap-2 border-l border-[#DEDACD] pl-4">
          <div className="text-right leading-tight">
            <div className="text-[13px] font-medium text-[#1B1B18]">{auth.user?.name || "Admin"}</div>
            <div className="text-[11.5px] text-[#8A8676]">Administrator</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-sm hover:bg-[#F1EFE8] text-[#6B675C]"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
