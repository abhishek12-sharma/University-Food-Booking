// src/pages/admin/Payments.jsx
//
// API_CONTRACT.md §13 defines /payments/create, /payments/verify and
// /payments/webhook, but no admin-facing "list payments" endpoint, and
// §15 Admin does not list one either. Rather than inventing an endpoint
// (Dev Rules §3: "do not invent endpoints"), this page derives payment
// monitoring from GET /admin/orders, which already carries payment_status
// and total_amount per order. If the team wants a dedicated payments table
// (e.g. provider IDs, signature_verified from the `payments` table in
// DATABASE_SCHEMA.md), add `GET /admin/payments` to API_CONTRACT.md first,
// then swap the fetch call below.

import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import { getAdminOrders } from "../../services/adminApi";
import { Info } from "lucide-react";

const PAGE_SIZE = 12;
const STATUS_STYLES = {
  PAID: "bg-[#1F5F5B]/10 text-[#1F5F5B]",
  PENDING: "bg-[#D98E04]/15 text-[#B97300]",
  FAILED: "bg-[#B3261E]/10 text-[#B3261E]",
  REFUNDED: "bg-[#8A8676]/10 text-[#6B675C]",
};

export default function Payments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getAdminOrders()
      .then((res) => !cancelled && setOrders(res?.data ?? []))
      .catch((err) => !cancelled && setError(err?.message || "Failed to load payment data."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => orders.filter((o) => !statusFilter || o.payment_status === statusFilter),
    [orders, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: "order_number", header: "Order #" },
    { key: "user_name", header: "User", render: (r) => r.user_name || `#${r.user_id}` },
    { key: "total_amount", header: "Amount", render: (r) => `₹${r.total_amount}` },
    {
      key: "payment_status",
      header: "Payment status",
      render: (r) => (
        <span className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-medium ${STATUS_STYLES[r.payment_status] || ""}`}>
          {r.payment_status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : "—"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Payments" subtitle="Payment status across all orders" />
        <main className="flex-1 p-6 space-y-4">
          <div className="flex items-start gap-2 text-[12.5px] text-[#6B675C] bg-[#D98E04]/10 border border-[#D98E04]/30 rounded-sm px-3 py-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#B97300]" />
            Payment records are shown from order data. A dedicated payments
            endpoint isn't in API_CONTRACT.md yet — ask the team to add one if
            provider-level detail (transaction IDs, signature verification) is
            needed here.
          </div>

          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            error={error}
            emptyLabel="No payment records"
            filters={[
              {
                label: "All statuses",
                value: statusFilter,
                onChange: (v) => {
                  setStatusFilter(v);
                  setPage(1);
                },
                options: [
                  { label: "Paid", value: "PAID" },
                  { label: "Pending", value: "PENDING" },
                  { label: "Failed", value: "FAILED" },
                  { label: "Refunded", value: "REFUNDED" },
                ],
              },
            ]}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
