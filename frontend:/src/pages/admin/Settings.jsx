// src/pages/admin/Settings.jsx
//
// API_CONTRACT.md and ARCHITECTURE.md describe system-wide policies
// (operating hours in §12, the 15-minute pickup window in §11) as
// "configurable where possible and enforced server-side," but no
// GET/PUT settings endpoint is documented yet. Rather than inventing one,
// this page displays the documented policy values as read-only reference
// and flags what a future settings endpoint would need to expose.

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { Info } from "lucide-react";

const POLICIES = [
  {
    label: "Shopkeeper setup opens",
    value: "9:30 AM",
    source: "ARCHITECTURE.md §12",
  },
  {
    label: "User ordering opens",
    value: "10:30 AM",
    source: "ARCHITECTURE.md §12",
  },
  {
    label: "Pickup window",
    value: "15 minutes after selected pickup time",
    source: "API_CONTRACT.md §12, ARCHITECTURE.md §11",
  },
  {
    label: "Refund after expiry",
    value: "Not permitted",
    source: "API_CONTRACT.md §12",
  },
];

export default function Settings() {
  return (
    <div className="flex min-h-screen bg-[#F1EFE8]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader title="Settings" subtitle="Platform policy reference" />
        <main className="flex-1 p-6 space-y-4">
          <div className="flex items-start gap-2 text-[12.5px] text-[#6B675C] bg-[#D98E04]/10 border border-[#D98E04]/30 rounded-sm px-3 py-2 max-w-2xl">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#B97300]" />
            These values are documented in the project's contracts but there's
            no settings read/write endpoint yet. This page is read-only until
            the team adds one (e.g. <code>GET/PUT /admin/settings</code>) to
            API_CONTRACT.md — editing operating hours or the pickup window here
            would otherwise silently do nothing.
          </div>

          <div className="max-w-2xl bg-white border border-[#DEDACD] rounded-sm divide-y divide-[#EEEBE1]">
            {POLICIES.map((p) => (
              <div key={p.label} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm text-[#1B1B18]">{p.label}</div>
                  <div className="text-[11.5px] text-[#8A8676]">{p.source}</div>
                </div>
                <div className="text-sm font-medium text-[#1B1B18]">{p.value}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
