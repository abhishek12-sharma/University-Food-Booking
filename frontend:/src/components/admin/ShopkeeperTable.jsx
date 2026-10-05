// src/components/admin/ShopkeeperTable.jsx
//
// Wraps DataTable with the column set for GET /admin/shopkeepers, including
// inline Approve/Reject actions for pending shopkeepers. Actions call back
// to the parent page — this component never calls the API directly.

import DataTable from "./DataTable";
import { Check, X } from "lucide-react";

const STATUS_STYLES = {
  ACTIVE: "bg-[#1F5F5B]/10 text-[#1F5F5B]",
  INACTIVE: "bg-[#8A8676]/10 text-[#6B675C]",
  PENDING: "bg-[#D98E04]/15 text-[#B97300]",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-medium ${STATUS_STYLES[status] || ""}`}>
      {status}
    </span>
  );
}

export default function ShopkeeperTable({
  shopkeepers,
  loading,
  error,
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  onApprove,
  onReject,
}) {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "food_court", header: "Food Court", render: (row) => row.food_court_name || "Unassigned" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "actions",
      header: "",
      render: (row) =>
        row.status === "PENDING" ? (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => onApprove(row)}
              className="flex items-center gap-1 text-[12.5px] px-2 py-1 rounded-sm bg-[#1F5F5B] text-white hover:bg-[#174743]"
            >
              <Check className="w-3 h-3" /> Approve
            </button>
            <button
              onClick={() => onReject(row)}
              className="flex items-center gap-1 text-[12.5px] px-2 py-1 rounded-sm border border-[#DEDACD] text-[#6B675C] hover:bg-[#F1EFE8]"
            >
              <X className="w-3 h-3" /> Reject
            </button>
          </div>
        ) : (
          <span className="text-[#8A8676] text-[12.5px]">—</span>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={shopkeepers}
      loading={loading}
      error={error}
      emptyLabel="No shopkeepers match your search"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name or email"
      filters={[
        {
          label: "All statuses",
          value: statusFilter,
          onChange: onStatusFilterChange,
          options: [
            { label: "Pending", value: "PENDING" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
          ],
        },
      ]}
      page={page}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onRowClick={onRowClick}
    />
  );
}
