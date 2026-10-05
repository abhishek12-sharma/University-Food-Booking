// src/components/admin/StatsCard.jsx
//
// A single metric card for the dashboard grid. The big number uses a serif
// display face (Fraunces, loaded via index.html <link> — falls back to
// Georgia/serif) to give the numbers weight, while labels stay in the UI
// sans face. This is the one deliberately "loud" element in the admin UI;
// everything else stays quiet.

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ label, value, delta, deltaLabel, tone = "neutral", icon: Icon }) {
  const toneStyles = {
    neutral: "text-[#1B1B18]",
    positive: "text-[#1F5F5B]",
    warning: "text-[#B97300]",
    danger: "text-[#B3261E]",
  };

  const isUp = typeof delta === "number" && delta >= 0;

  return (
    <div className="rounded-sm border border-[#DEDACD] bg-white px-5 py-4 flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#6B675C] tracking-tight">{label}</span>
        {Icon ? <Icon className="w-4 h-4 text-[#B97300]" strokeWidth={1.75} /> : null}
      </div>

      <div
        className={`text-3xl leading-none ${toneStyles[tone]}`}
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {value}
      </div>

      {typeof delta === "number" && (
        <div className="flex items-center gap-1 text-[12.5px]">
          {isUp ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-[#1F5F5B]" strokeWidth={2} />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-[#B3261E]" strokeWidth={2} />
          )}
          <span className={isUp ? "text-[#1F5F5B]" : "text-[#B3261E]"}>
            {Math.abs(delta)}%
          </span>
          {deltaLabel && <span className="text-[#8A8676]">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}
