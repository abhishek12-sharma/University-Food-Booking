// src/pages/admin/AuditLogs.jsx
//
// See services/adminApi.js note: API_CONTRACT.md does not yet document a
// GET endpoint for audit_logs, only that sensitive admin actions must be
// auditable. This page is wired against a placeholder path and surfaces
// that clearly instead of silently pretending the contract covers it.

import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import { getAuditLogs } from "../../services/adminApi";
import { Info } from "lucide-react";

const PAGE_SIZE = 15;

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpointMissing, setEndpointMissing] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    getAuditLogs()
      .then((res) => !cancelled && setLogs(res?.data ?? []))
      .catch((err) => {
        if (cancelled) return;
        if (err?.message?.includes("404") || err?.status === 404) {
          setEndpointMissing(true);
        } else {
          setError(err?.message || "Failed to load audit logs.");
        }
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paged = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { key: "actor_user_id", header: "Actor", render: (r) => r.actor_name || `User #${r.actor_user_id}` },
    { key: "action", header: "Action" },
    { key: "resource_type", header: "Resource", render: (r) => `${r.resource_type}${r.resource_id ? ` #${r.resource_id}` : ""}` },
    {
      key: "created_at",
      header: "Timestamp",
      render: (r) => (r.created_at ? new Date(r.created_at).toLocaleString() : "—"),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Audit Logs" subtitle="Sensitive admin actions" />
        <main className="flex-1 p-6 space-y-4">
          {endpointMissing && (
            <div className="flex items-start gap-2 text-[12.5px] text-[#6B675C] bg-[#D98E04]/10 border border-[#D98E04]/30 rounded-sm px-3 py-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#B97300]" />
              No audit-log read endpoint is documented in API_CONTRACT.md yet,
              though the <code>audit_logs</code> table exists in
              DATABASE_SCHEMA.md. Add <code>GET /admin/audit-logs</code> to the
              contract (Dev Rules §3) and this page will start working
              immediately — the UI and query wiring are already in place.
            </div>
          )}

          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            error={endpointMissing ? null : error}
            emptyLabel={endpointMissing ? "Endpoint not yet available" : "No audit records"}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </main>
      </div>
    </div>
  );
}
