// src/components/admin/UserTable.jsx
//
// Wraps DataTable with the column set for GET /admin/users. Status changes
// are dispatched back to the parent page (Users.jsx) via onStatusChange —
// this component never calls the API directly, so the confirmation flow
// stays in one place.

import DataTable from "./DataTable";

const STATUS_STYLES = {
  ACTIVE: "bg-[#1F5F5B]/10 text-[#1F5F5B]",
  INACTIVE: "bg-[#8A8676]/10 text-[#6B675C]",
  SUSPENDED: "bg-[#B3261E]/10 text-[#B3261E]",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-medium ${STATUS_STYLES[status] || ""}`}>
      {status}
    </span>
  );
}

export default function UserTable({
  users,
  loading,
  error,
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  page,
  totalPages,
  onPageChange,
  onRowClick,
}) {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "created_at",
      header: "Joined",
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      loading={loading}
      error={error}
      emptyLabel="No users match your search"
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name or email"
      filters={[
        {
          label: "All roles",
          value: roleFilter,
          onChange: onRoleFilterChange,
          options: [
            { label: "Admin", value: "ADMIN" },
            { label: "Shopkeeper", value: "SHOPKEEPER" },
            { label: "User", value: "USER" },
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
