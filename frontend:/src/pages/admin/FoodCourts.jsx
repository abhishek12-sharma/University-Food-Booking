// src/pages/admin/FoodCourts.jsx
//
// GET /admin/food-courts, POST /admin/food-courts, PUT /admin/food-courts/:id,
// PATCH /admin/food-courts/:id/status.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import DataTable from "../../components/admin/DataTable";
import {
  getAdminFoodCourts,
  createFoodCourt,
  updateFoodCourt,
  updateFoodCourtStatus,
} from "../../services/adminApi";
import { Plus, CheckCircle2 } from "lucide-react";

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: "", description: "", location: "", opening_time: "09:00", closing_time: "21:00" };

export default function FoodCourts() {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', form, editingId }
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = () => {
    setLoading(true);
    getAdminFoodCourts()
      .then((res) => setCourts(res?.data ?? []))
      .catch((err) => setError(err?.message || "Failed to load food courts."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(
    () => courts.filter((c) => !search || c.name?.toLowerCase().includes(search.toLowerCase())),
    [courts, search]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => setModal({ mode: "create", form: EMPTY_FORM });
  const openEdit = (court) =>
    setModal({
      mode: "edit",
      editingId: court.id,
      form: {
        name: court.name || "",
        description: court.description || "",
        location: court.location || "",
        opening_time: court.opening_time || "09:00",
        closing_time: court.closing_time || "21:00",
      },
    });

  const saveModal = async () => {
    setSaving(true);
    try {
      if (modal.mode === "create") {
        await createFoodCourt(modal.form);
        setToast("Food court created.");
      } else {
        await updateFoodCourt(modal.editingId, modal.form);
        setToast("Food court updated.");
      }
      setModal(null);
      load();
    } catch (err) {
      setToast(err?.message || "Save failed.");
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const toggleStatus = async (court) => {
    const next = court.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateFoodCourtStatus(court.id, next);
      setCourts((prev) => prev.map((c) => (c.id === court.id ? { ...c, status: next } : c)));
    } catch (err) {
      setToast(err?.message || "Failed to update status.");
      setTimeout(() => setToast(null), 3000);
    }
  };

  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "location", header: "Location", render: (r) => r.location || "—" },
    { key: "hours", header: "Hours", render: (r) => `${r.opening_time || "—"} – ${r.closing_time || "—"}` },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-[12px] font-medium ${
            r.status === "ACTIVE" ? "bg-[#1F5F5B]/10 text-[#1F5F5B]" : "bg-[#8A8676]/10 text-[#6B675C]"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(r)} className="text-[12.5px] text-[#1F5F5B] hover:underline">
            Edit
          </button>
          <button onClick={() => toggleStatus(r)} className="text-[12.5px] text-[#B97300] hover:underline">
            {r.status === "ACTIVE" ? "Deactivate" : "Activate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Food Courts" subtitle="Manage campus dining locations" />
        <main className="flex-1 p-6 space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-[13px] px-3 py-2 rounded-sm bg-[#D98E04] text-[#14231F] font-medium hover:bg-[#C17F03]"
            >
              <Plus className="w-4 h-4" /> New food court
            </button>
          </div>

          <DataTable
            columns={columns}
            rows={paged}
            loading={loading}
            error={error}
            emptyLabel="No food courts yet"
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            searchPlaceholder="Search food courts"
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onRowClick={(row) => navigate(`/admin/food-courts/${row.id}`)}
          />
        </main>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-[#DEDACD] p-6 w-96 space-y-3">
            <h3 className="text-sm font-medium text-[#1B1B18]">
              {modal.mode === "create" ? "New food court" : "Edit food court"}
            </h3>

            <div className="space-y-2">
              <input
                value={modal.form.name}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, name: e.target.value } }))}
                placeholder="Name"
                className="w-full text-sm border border-[#DEDACD] rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D98E04]/40"
              />
              <input
                value={modal.form.location}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, location: e.target.value } }))}
                placeholder="Location"
                className="w-full text-sm border border-[#DEDACD] rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D98E04]/40"
              />
              <textarea
                value={modal.form.description}
                onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, description: e.target.value } }))}
                placeholder="Description"
                rows={2}
                className="w-full text-sm border border-[#DEDACD] rounded-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#D98E04]/40"
              />
              <div className="flex gap-2">
                <input
                  type="time"
                  value={modal.form.opening_time}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, opening_time: e.target.value } }))}
                  className="flex-1 text-sm border border-[#DEDACD] rounded-sm px-3 py-2"
                />
                <input
                  type="time"
                  value={modal.form.closing_time}
                  onChange={(e) => setModal((m) => ({ ...m, form: { ...m.form, closing_time: e.target.value } }))}
                  className="flex-1 text-sm border border-[#DEDACD] rounded-sm px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setModal(null)}
                className="text-[13px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                disabled={saving || !modal.form.name}
                onClick={saveModal}
                className="text-[13px] px-3 py-1.5 rounded-sm bg-[#D98E04] text-[#14231F] font-medium hover:bg-[#C17F03] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
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
