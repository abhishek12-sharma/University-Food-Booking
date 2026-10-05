// src/pages/admin/OrderDetails.jsx
//
// GET /admin/orders/:orderId. Read-only — admin does not transition order
// status or touch payment/QR verification (those stay server-authoritative
// per Development Rules §10–12).

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { getAdminOrderById } from "../../services/adminApi";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getAdminOrderById(orderId)
      .then((res) => !cancelled && setOrder(res?.data ?? res))
      .catch((err) => !cancelled && setError(err?.message || "Failed to load order."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Order details" subtitle={order?.order_number ? `Order ${order.order_number}` : `Order #${orderId}`} />
        <main className="flex-1 p-6">
          <button
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-1.5 text-[13px] text-[#6B675C] hover:text-[#1B1B18] mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to orders
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

          {!loading && !error && order && (
            <div className="max-w-2xl space-y-4">
              <div className="bg-white border border-[#DEDACD] rounded-sm p-6">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">User</dt>
                    <dd className="text-[#1B1B18]">{order.user_name || `#${order.user_id}`}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Food court</dt>
                    <dd className="text-[#1B1B18]">{order.food_court_name || `#${order.food_court_id}`}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Status</dt>
                    <dd className="text-[#1B1B18]">{order.status}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Payment status</dt>
                    <dd className="text-[#1B1B18]">{order.payment_status}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Pickup slot</dt>
                    <dd className="text-[#1B1B18]">{order.pickup_slot_label || `#${order.pickup_slot_id}`}</dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Pickup deadline</dt>
                    <dd className="text-[#1B1B18]">
                      {order.pickup_deadline ? new Date(order.pickup_deadline).toLocaleString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Placed</dt>
                    <dd className="text-[#1B1B18]">
                      {order.created_at ? new Date(order.created_at).toLocaleString() : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#8A8676] text-[12px]">Total</dt>
                    <dd className="text-[#1B1B18]">₹{order.total_amount}</dd>
                  </div>
                </dl>
              </div>

              {Array.isArray(order.items) && (
                <div className="bg-white border border-[#DEDACD] rounded-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#FAF8F2] border-b border-[#DEDACD] text-left">
                        <th className="px-4 py-2 text-[12.5px] font-medium text-[#6B675C]">Item</th>
                        <th className="px-4 py-2 text-[12.5px] font-medium text-[#6B675C]">Qty</th>
                        <th className="px-4 py-2 text-[12.5px] font-medium text-[#6B675C]">Unit price</th>
                        <th className="px-4 py-2 text-[12.5px] font-medium text-[#6B675C]">Line total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-b border-[#EEEBE1] last:border-0">
                          <td className="px-4 py-2">{item.item_name_snapshot}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">₹{item.unit_price_snapshot}</td>
                          <td className="px-4 py-2">₹{item.line_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
