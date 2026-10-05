// src/pages/admin/ShopkeeperDetails.jsx
//
// GET /admin/shopkeepers/:id, PATCH /admin/shopkeepers/:id/status,
// POST /admin/shopkeepers/:id/approve, POST /admin/shopkeepers/:id/reject.
//
// Food court assignment itself is created via shopkeeper_assignments
// (DATABASE_SCHEMA.md), which is not exposed as an admin-facing write
// endpoint in API_CONTRACT.md yet. This page displays the assignment
// read-only and flags the gap rather than inventing a write call.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import {
  getShopkeeperById,
  approveShopkeeper,
  rejectShopkeeper,
  updateShopkeeperStatus,
} from "../../services/adminApi";
import { ArrowLeft, Loader2, AlertTriangle, Check, X } from "lucide-react";

export default function ShopkeeperDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shopkeeper, setShopkeeper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const load = () => {
    setLoading(true);
    getShopkeeperById(id)
      .then((res) => setShopkeeper(res?.data ?? res))
      .catch((err) => setError(err?.message || "Failed to load shopkeeper."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const runAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction === "approve") await approveShopkeeper(id);
      else if (confirmAction === "reject") await rejectShopkeeper(id);
      else if (confirmAction === "deactivate") await updateShopkeeperStatus(id, "INACTIVE");
      else if (confirmAction === "activate") await updateShopkeeperStatus(id, "ACTIVE");
      load();
    } catch (err) {
      setError(err?.message || "Action failed.");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Shopkeeper details" subtitle={`Shopkeeper #${id}`} />
        <main className="flex-1 p-6">
          <button
            onClick={() => navigate("/admin/shopkeepers")}
            className="flex items-center gap-1.5 text-[13px] text-[#6B675C] hover:text-[#1B1B18] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to shopkeepers
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

          {!loading && !error && shopkeeper && (
            <div className="max-w-xl bg-white border border-[#DEDACD] rounded-sm p-6 space-y-5">
              <div>
                <div className="text-lg font-medium text-[#1B1B18]">{shopkeeper.name}</div>
                <div className="text-[13px] text-[#8A8676]">{shopkeeper.email}</div>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Assigned food court</dt>
                  <dd className="text-[#1B1B18]">{shopkeeper.food_court_name || "Unassigned"}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Status</dt>
                  <dd className="text-[#1B1B18]">{shopkeeper.status}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Phone</dt>
                  <dd className="text-[#1B1B18]">{shopkeeper.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Applied</dt>
                  <dd className="text-[#1B1B18]">
                    {shopkeeper.created_at ? new Date(shopkeeper.created_at).toLocaleString() : "—"}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-[#EEEBE1] pt-4 flex gap-2 flex-wrap">
                {shopkeeper.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => setConfirmAction("approve")}
                      className="flex items-center gap-1 text-[12.5px] px-3 py-1.5 rounded-sm bg-[#1F5F5B] text-white hover:bg-[#174743]"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setConfirmAction("reject")}
                      className="flex items-center gap-1 text-[12.5px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
                {shopkeeper.status === "ACTIVE" && (
                  <button
                    onClick={() => setConfirmAction("deactivate")}
                    className="text-[12.5px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
                  >
                    Deactivate
                  </button>
                )}
                {shopkeeper.status === "INACTIVE" && (
                  <button
                    onClick={() => setConfirmAction("activate")}
                    className="text-[12.5px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-[#DEDACD] p-5 w-80">
            <h3 className="text-sm font-medium text-[#1B1B18] mb-2">Confirm action</h3>
            <p className="text-[13px] text-[#6B675C] mb-4">
              {confirmAction === "approve" && "Approve this shopkeeper's application?"}
              {confirmAction === "reject" && "Reject this shopkeeper's application?"}
              {confirmAction === "deactivate" && "Deactivate this shopkeeper?"}
              {confirmAction === "activate" && "Reactivate this shopkeeper?"}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="text-[13px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                onClick={runAction}
                className="text-[13px] px-3 py-1.5 rounded-sm bg-[#B97300] text-white hover:bg-[#94590A]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
