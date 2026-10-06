// src/pages/admin/Orders.jsx
//
// GET /admin/orders. Read-only monitoring — order status transitions are
// owned by the shopkeeper flow (PATCH /shopkeeper/orders/:orderId/status),
// not the admin panel (Member-4 brief explicitly scopes admin to viewing).

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import { getAdminOrders } from "../../services/adminApi";

const PAGE_SIZE = 12;
const STATUS_STYLES = {
  CONFIRMED: "bg-[#1F5F5B]/10 text-[#1F5F5B]",
  PREPARING: "bg-[#D98E04]/15 text-[#B97300]",
  READY: "bg-[#1F5F5B]/10 text-[#1F5F5B]",
  PICKED_UP: "bg-[#8A8676]/10 text-[#6B675C]",
  EXPIRED: "bg-[#B3261E]/10 text-[#B3261E]",
  CANCELLED: "bg-[#B3261E]/10 text-[#B3261E]",
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getAdminOrders()
      .then((res) => {
        const raw = res?.data ?? res;
        const list = Array.isArray(raw) ? raw : (raw?.orders ?? []);
        if (!cancelled) setOrders(list);
      })
      .catch((err) => !cancelled && setError(err?.message || "Failed to load orders."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
        o.user_name?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: "order_number", header: "Order #" },
    { key: "user_name", header: "User", render: (r) => r.user_name || `#${r.user_id}` },
    { key: "food_court_name", header: "Food Court", render: (r) => r.food_court_name || `#${r.food_court_id}` },
    { key: "total_amount", header: "Amount", render: (r) => `₹${r.total_amount}` },
    {
      key: "payment_status",
      header: "Payment",
      render: (r) => <span className="text-[12.5px] text-[#6B675C]">{r.payment_status}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-medium ${STATUS_STYLES[r.status] || ""}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Placed",
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : "—"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Orders" subtitle="System-wide order monitoring" />
        <main className="flex-1 p-6">
          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            error={error}
            emptyLabel="No orders match your search"
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search by order # or user"
            filters={[
              {
                label: "All statuses",
                value: statusFilter,
                onChange: (v) => {
                  setStatusFilter(v);
                  setPage(1);
                },
                options: [
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Preparing", value: "PREPARING" },
                  { label: "Ready", value: "READY" },
                  { label: "Picked up", value: "PICKED_UP" },
                  { label: "Expired", value: "EXPIRED" },
                  { label: "Cancelled", value: "CANCELLED" },
                ],
              },
            ]}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/admin/orders/${row.id}`)}
          />
        </main>
      </div>
    </div>
  );
}
