// src/components/admin/DataTable.jsx
//
// Generic, presentation-only data table shared by every admin list page
// (Users, Shopkeepers, Food Courts, Orders, Audit Logs). Handles search,
// column-based filters, pagination, and loading/error/empty states so
// individual pages only need to describe columns + fetch data.
//
// This component does not call any API and does not know about roles —
// it is pure UI, kept reusable per Development Rules §9 ("use reusable
// components").

import { Search, Inbox, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTable({
  columns,
  rows,
  loading = false,
  error = null,
  emptyLabel = "No records found",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters, // optional: array of { label, value, options: [{label, value}], onChange }
  page = 1,
  totalPages = 1,
  onPageChange,
  onRowClick,
  rowKey = (row) => row.id,
}) {
  return (
    <div className="border border-[#DEDACD] bg-white rounded-sm overflow-hidden">
      {(onSearchChange || filters?.length) && (
        <div className="flex flex-wrap items-center gap-3 border-b border-[#DEDACD] px-4 py-3 bg-[#FAF8F2]">
          {onSearchChange && (
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8A8676]" />
              <input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#DEDACD] rounded-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D98E04]/40 focus:border-[#D98E04]"
              />
            </div>
          )}
          {filters?.map((f) => (
            <select
              key={f.label}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="text-sm border border-[#DEDACD] rounded-sm px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#D98E04]/40"
            >
              <option value="">{f.label}</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DEDACD] bg-[#FAF8F2] text-left">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2.5 font-medium text-[#6B675C] text-[12.5px] whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#8A8676]">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading…
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#B3261E]">
                  <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#8A8676]">
                  <Inbox className="w-5 h-5 mx-auto mb-2" />
                  {emptyLabel}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-[#EEEBE1] last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-[#FAF8F2]" : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-[#1B1B18] whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {onPageChange && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#DEDACD] bg-[#FAF8F2]">
          <span className="text-[12.5px] text-[#8A8676]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 border border-[#DEDACD] rounded-sm bg-white disabled:opacity-40 hover:bg-[#F1EFE8]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-1.5 border border-[#DEDACD] rounded-sm bg-white disabled:opacity-40 hover:bg-[#F1EFE8]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
