// src/pages/admin/Users.jsx
//
// GET /admin/users, PATCH /admin/users/:userId/status. Search/role filter
// are applied client-side against the fetched page unless the backend
// documents server-side query params — adjust `getUsers` params once the
// team confirms supported filters in API_CONTRACT.md.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import UserTable from "../../components/admin/UserTable";
import { getUsers, updateUserStatus } from "../../services/adminApi";
import { CheckCircle2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, nextStatus }
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getUsers()
      .then((res) => {
        if (!cancelled) setUsers(res?.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load users.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const requestStatusChange = (user) => {
    const nextStatus = user.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    setConfirmTarget({ user, nextStatus });
  };

  const confirmStatusChange = async () => {
    if (!confirmTarget) return;
    const { user, nextStatus } = confirmTarget;
    try {
      await updateUserStatus(user.id, nextStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      setToast(`${user.name}'s account is now ${nextStatus.toLowerCase()}.`);
    } catch (err) {
      setToast(err?.message || "Failed to update user status.");
    } finally {
      setConfirmTarget(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Users" subtitle="Manage student and staff accounts" />
        <main className="flex-1 p-6 space-y-4">
          <UserTable
            users={paged}
            loading={loading}
            error={error}
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            roleFilter={roleFilter}
            onRoleFilterChange={(v) => {
              setRoleFilter(v);
              setPage(1);
            }}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          />

          {/* Row-level status toggle lives in UserDetails; list stays scannable. */}
        </main>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-[#DEDACD] p-5 w-80">
            <h3 className="text-sm font-medium text-[#1B1B18] mb-2">Confirm status change</h3>
            <p className="text-[13px] text-[#6B675C] mb-4">
              Set <strong>{confirmTarget.user.name}</strong>'s status to{" "}
              <strong>{confirmTarget.nextStatus}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="text-[13px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="text-[13px] px-3 py-1.5 rounded-sm bg-[#B97300] text-white hover:bg-[#94590A]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 bg-[#14231F] text-white text-[13px] px-4 py-2.5 rounded-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-[#D98E04]" />
          {toast}
        </div>
      )}
    </div>
  );
}
