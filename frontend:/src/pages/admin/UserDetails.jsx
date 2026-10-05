// src/pages/admin/UserDetails.jsx
//
// GET /admin/users/:userId, PATCH /admin/users/:userId/status.

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getUserById, updateUserStatus } from "../../services/adminApi";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export default function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUserById(userId)
      .then((res) => !cancelled && setUser(res?.data ?? res))
      .catch((err) => !cancelled && setError(err?.message || "Failed to load user."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const applyStatus = async () => {
    if (!confirmStatus) return;
    setSaving(true);
    try {
      await updateUserStatus(userId, confirmStatus);
      setUser((prev) => ({ ...prev, status: confirmStatus }));
    } catch (err) {
      setError(err?.message || "Failed to update status.");
    } finally {
      setSaving(false);
      setConfirmStatus(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="User details" subtitle={`User #${userId}`} />
        <main className="flex-1 p-6">
          <button
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 text-[13px] text-[#6B675C] hover:text-[#1B1B18] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to users
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

          {!loading && !error && user && (
            <div className="max-w-xl bg-white border border-[#DEDACD] rounded-sm p-6 space-y-5">
              <div>
                <div className="text-lg font-medium text-[#1B1B18]">{user.name}</div>
                <div className="text-[13px] text-[#8A8676]">{user.email}</div>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Role</dt>
                  <dd className="text-[#1B1B18]">{user.role}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Phone</dt>
                  <dd className="text-[#1B1B18]">{user.phone || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Joined</dt>
                  <dd className="text-[#1B1B18]">
                    {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#8A8676] text-[12px]">Current status</dt>
                  <dd className="text-[#1B1B18]">{user.status}</dd>
                </div>
              </dl>

              <div className="border-t border-[#EEEBE1] pt-4">
                <div className="text-[12.5px] text-[#8A8676] mb-2">Change status</div>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      disabled={s === user.status}
                      onClick={() => setConfirmStatus(s)}
                      className={`text-[12.5px] px-3 py-1.5 rounded-sm border ${
                        s === user.status
                          ? "border-[#DEDACD] text-[#B7B3A4] cursor-not-allowed"
                          : "border-[#DEDACD] text-[#1B1B18] hover:bg-[#F1EFE8]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {confirmStatus && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-sm border border-[#DEDACD] p-5 w-80">
            <h3 className="text-sm font-medium text-[#1B1B18] mb-2">Confirm status change</h3>
            <p className="text-[13px] text-[#6B675C] mb-4">
              Set this user's status to <strong>{confirmStatus}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmStatus(null)}
                className="text-[13px] px-3 py-1.5 rounded-sm border border-[#DEDACD] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={applyStatus}
                className="text-[13px] px-3 py-1.5 rounded-sm bg-[#B97300] text-white hover:bg-[#94590A] disabled:opacity-60"
              >
                {saving ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
