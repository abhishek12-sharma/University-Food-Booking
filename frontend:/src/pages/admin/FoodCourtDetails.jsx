// src/pages/admin/FoodCourtDetails.jsx
//
// GET /admin/food-courts/:id. Assigned-shopkeeper info is displayed if the
// backend includes it on this response (per shopkeeper_assignments in
// DATABASE_SCHEMA.md) — no separate endpoint is invented here.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminFoodCourtById } from "../../services/adminApi";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function FoodCourtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdminFoodCourtById(id)
      .then((res) => !cancelled && setCourt(res?.data ?? res))
      .catch((err) => !cancelled && setError(err?.message || "Failed to load food court."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Food court details" subtitle={`Food court #${id}`} />
        <main className="flex-1 p-6">
          <button
            onClick={() => navigate("/admin/food-courts")}
            className="flex items-center gap-1.5 text-[13px] text-[#6B675C] hover:text-[#1B1B18] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to food courts
          </button>

          {loading && (
            <div className="flex items-center gap-2 text-[#8A8676] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading…
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-2 text-[#B3261E] bg-[#B3261E]/5 border border-[#B3261E]/30 rounded-sm px-4 py-2.5 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          {!loading && !error && court && (
            <div className="max-w-xl bg-white border border-[#DEDACD] rounded-sm p-6 space-y-5">
              <div>
                <div className="text-lg font-medium text-[#1B1B18]">{court.name}</div>
                <div className="text-[13px] text-[#8A8676]">{court.location || "No location set"}</div>
              </div>

              {court.description && <p className="text-sm text-[#1B1B18]">{court.description}</p>}

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Hours</dt>
                  <dd className="text-[#1B1B18]">
                    {court.opening_time || "—"} – {court.closing_time || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Status</dt>
                  <dd className="text-[#1B1B18]">{court.status}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Assigned shopkeeper</dt>
                  <dd className="text-[#1B1B18]">{court.shopkeeper_name || "Unassigned"}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Created</dt>
                  <dd className="text-[#1B1B18]">
                    {court.created_at ? new Date(court.created_at).toLocaleDateString() : "—"}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
