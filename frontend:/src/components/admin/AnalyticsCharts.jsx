// src/components/admin/AnalyticsCharts.jsx
//
// Chart primitives used by AdminDashboard.jsx and Analytics.jsx. Every chart
// takes real data as props — none of these fabricate values. If data is
// empty, each renders a quiet empty state instead of a misleading chart.

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const AMBER = "#D98E04";
const TEAL = "#1F5F5B";
const INK = "#1B1B18";
const GRID = "#EEEBE1";
const PIE_COLORS = ["#D98E04", "#1F5F5B", "#8A8676", "#B3261E", "#6B675C", "#C9A24B"];

function ChartFrame({ title, children, empty }) {
  return (
    <div className="border border-[#DEDACD] bg-white rounded-sm p-4">
      <h3 className="text-[13px] font-medium text-[#6B675C] mb-3">{title}</h3>
      {empty ? (
        <div className="h-56 flex items-center justify-center text-[#8A8676] text-sm">No data yet</div>
      ) : (
        <div className="h-56">{children}</div>
      )}
    </div>
  );
}

export function RevenueTrendChart({ data = [] }) {
  return (
    <ChartFrame title="Revenue trend" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Line type="monotone" dataKey="revenue" stroke={AMBER} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function OrdersTrendChart({ data = [] }) {
  return (
    <ChartFrame title="Orders trend" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Line type="monotone" dataKey="orders" stroke={TEAL} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function FoodCourtComparisonChart({ data = [] }) {
  return (
    <ChartFrame title="Food court performance" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Bar dataKey="revenue" fill={AMBER} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function PopularFoodChart({ data = [] }) {
  return (
    <ChartFrame title="Popular food items" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: INK }} axisLine={false} tickLine={false} width={110} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Bar dataKey="orders" fill={TEAL} radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function PeakHoursChart({ data = [] }) {
  return (
    <ChartFrame title="Peak ordering hours" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#8A8676" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Bar dataKey="orders" fill={AMBER} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function OrderStatusPie({ data = [] }) {
  return (
    <ChartFrame title="Order status distribution" empty={!data.length}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="status" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={entry.status} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, borderColor: "#DEDACD" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
