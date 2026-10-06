// src/pages/admin/Shopkeepers.jsx
//
// GET /admin/shopkeepers, POST /admin/shopkeepers/:id/approve,
// POST /admin/shopkeepers/:id/reject, PATCH /admin/shopkeepers/:id/status.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import ShopkeeperTable from "../../components/admin/ShopkeeperTable";
import {
  getShopkeepers,
  approveShopkeeper,
  rejectShopkeeper,
} from "../../services/adminApi";
import { CheckCircle2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function Shopkeepers() {
  const navigate = useNavigate();
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'reject', shopkeeper }
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getShopkeepers()
      .then((res) => {
        const raw = res?.data ?? res;
        setShopkeepers(Array.isArray(raw) ? raw : (raw?.shopkeepers ?? []));
      })
      .catch((err) => setError(err?.message || "Failed to load shopkeepers."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return shopkeepers.filter((s) => {
      const matchesSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [shopkeepers, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const runConfirmedAction = async () => {
    if (!confirmAction) return;
    const { type, shopkeeper } = confirmAction;
    try {
      if (type === "approve") {
        await approveShopkeeper(shopkeeper.id);
        setToast(`${shopkeeper.name} approved.`);
      } else {
        await rejectShopkeeper(shopkeeper.id);
        setToast(`${shopkeeper.name} rejected.`);
      }
      load();
    } catch (err) {
      setToast(err?.message || "Action failed.");
    } finally {
      setConfirmAction(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Shopkeepers" subtitle="Approve vendors and manage food court staff" />
        <main className="flex-1 p-6 space-y-4">
          <ShopkeeperTable
            shopkeepers={paged}
            loading={loading}
            error={error}
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/admin/shopkeepers/${row.id}`)}
            onApprove={(shopkeeper) => setConfirmAction({ type: "approve", shopkeeper })}
            onReject={(shopkeeper) => setConfirmAction({ type: "reject", shopkeeper })}
          />
        </main>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-[#DEDACD] p-5 w-80">
            <h3 className="text-sm font-medium text-[#1B1B18] mb-2">
              {confirmAction.type === "approve" ? "Approve shopkeeper" : "Reject shopkeeper"}
            </h3>
            <p className="text-[13px] text-[#6B675C] mb-4">
              {confirmAction.type === "approve" ? "Approve" : "Reject"}{" "}
              <strong>{confirmAction.shopkeeper.name}</strong>'s application?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="text-[13px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                onClick={runConfirmedAction}
                className={`text-[13px] px-3 py-1.5 rounded-sm text-white ${
                  confirmAction.type === "approve"
                    ? "bg-[#1F5F5B] hover:bg-[#174743]"
                    : "bg-[#B3261E] hover:bg-[#921E18]"
                }`}
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
