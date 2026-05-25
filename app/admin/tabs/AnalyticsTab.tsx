"use client";

import type { DashboardAnalytics } from "@/app/actions/analytics";
import { fmtRupees, fmtRupeesShort, fmtNum, STATUS_COLOR } from "./format";
import {
  BarChart3,
  MapPin,
  Map,
  Truck,
  Clock,
  CalendarDays,
  IndianRupee,
  Scale,
  ShoppingBag,
  PieChart,
} from "lucide-react";

export default function AnalyticsTab({ analytics }: { analytics: DashboardAnalytics }) {
  const {
    totals,
    last30Days,
    topVarieties,
    topCities,
    topStates,
    topDepots,
    hourlyPattern,
    weekdayPattern,
    statusBreakdown,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Headline metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric icon={<IndianRupee className="w-5 h-5" />} label="Verified Revenue" value={fmtRupees(totals.verifiedRevenue)} sub={`${totals.ordersVerified} orders`} />
        <Metric icon={<ShoppingBag className="w-5 h-5" />} label="Avg Order Value" value={fmtRupees(totals.avgOrderValue)} sub={`${totals.ordersAll} total orders`} />
        <Metric icon={<Scale className="w-5 h-5" />} label="Mangoes Shipped" value={`${fmtNum(totals.totalKgSold)} kg`} sub="verified orders" />
        <Metric icon={<CalendarDays className="w-5 h-5" />} label="This Month" value={fmtRupeesShort(totals.revenueThisMonth)} sub={`vs ${fmtRupeesShort(totals.revenuePrevMonth)} prev`} />
      </div>

      {/* 30-day bars */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
        <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4" /> Daily revenue · last 30 days
        </h3>
        <DailyBars data={last30Days} />
      </div>

      {/* Donut + Weekday */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
          <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4" /> Status distribution
          </h3>
          <StatusDonut data={statusBreakdown} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
          <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
            <CalendarDays className="w-4 h-4" /> Orders by weekday <span className="text-[10px] text-brand-primary-green/40 font-normal">(last 60 days)</span>
          </h3>
          <WeekdayBars data={weekdayPattern} />
        </div>
      </div>

      {/* Hourly heatmap-like bar */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
        <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4" /> Hour-of-day order activity <span className="text-[10px] text-brand-primary-green/40 font-normal">(last 60 days)</span>
        </h3>
        <HourlyBars data={hourlyPattern} />
      </div>

      {/* Best-selling varieties */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
        <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4" /> Best-selling varieties (verified)
        </h3>
        {topVarieties.length === 0 ? (
          <p className="text-sm text-brand-primary-green/50 py-8 text-center">No verified sales yet.</p>
        ) : (
          <VarietyList data={topVarieties} />
        )}
      </div>

      {/* Geography panels */}
      <div className="grid lg:grid-cols-2 gap-4">
        <RankList
          title="Top destination cities"
          icon={<MapPin className="w-4 h-4" />}
          items={topCities.map((c) => ({ label: c.city, count: c.orders, revenue: c.revenue }))}
        />
        <RankList
          title="Top states"
          icon={<Map className="w-4 h-4" />}
          items={topStates.map((c) => ({ label: c.state, count: c.orders, revenue: c.revenue }))}
        />
      </div>

      <RankList
        title="Top RTC depots"
        icon={<Truck className="w-4 h-4" />}
        items={topDepots.map((c) => ({ label: c.depot, count: c.orders, revenue: c.revenue }))}
      />
    </div>
  );
}

function Metric({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-primary-green/5">
      <div className="flex items-center gap-2 text-brand-primary-green/60 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-bold text-brand-primary-green tabular-nums">{value}</p>
      <p className="text-[11px] text-brand-primary-green/50 mt-0.5">{sub}</p>
    </div>
  );
}

function DailyBars({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  if (data.every((d) => d.revenue === 0)) {
    return <p className="text-sm text-brand-primary-green/50 py-12 text-center">No verified revenue in the last 30 days.</p>;
  }
  return (
    <div className="flex items-end gap-1 h-44">
      {data.map((d) => {
        const h = (d.revenue / max) * 100;
        const date = new Date(d.date);
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="opacity-0 group-hover:opacity-100 text-[9px] font-bold text-brand-primary-green/70 transition whitespace-nowrap">
              {fmtRupeesShort(d.revenue)}
            </div>
            <div className="w-full bg-brand-primary-green/5 rounded-t flex-1 flex items-end overflow-hidden">
              <div
                className="w-full bg-gradient-to-t from-brand-primary-green to-brand-orange rounded-t transition-all group-hover:opacity-100 opacity-90"
                style={{ height: `${h}%`, minHeight: d.revenue > 0 ? "3px" : "0" }}
              />
            </div>
            {date.getDate() % 5 === 0 && (
              <span className="text-[9px] text-brand-primary-green/50 font-mono">
                {date.getDate()}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HourlyBars({ data }: { data: { hour: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.orders));
  if (data.every((d) => d.orders === 0)) {
    return <p className="text-sm text-brand-primary-green/50 py-8 text-center">Not enough activity yet.</p>;
  }
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => {
        const h = (d.orders / max) * 100;
        const intensity = d.orders / max;
        return (
          <div key={d.hour} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-[9px] font-bold text-brand-primary-green/60 opacity-0 group-hover:opacity-100">
              {d.orders}
            </span>
            <div className="w-full bg-brand-primary-green/5 rounded-t flex-1 flex items-end overflow-hidden">
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${h}%`,
                  minHeight: d.orders > 0 ? "3px" : "0",
                  backgroundColor: `rgba(8, 89, 67, ${0.25 + intensity * 0.75})`,
                }}
              />
            </div>
            <span className="text-[9px] text-brand-primary-green/50 font-mono">
              {d.hour.toString().padStart(2, "0")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const DOW_LABEL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function WeekdayBars({ data }: { data: { weekday: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.orders));
  if (data.every((d) => d.orders === 0)) {
    return <p className="text-sm text-brand-primary-green/50 py-8 text-center">Not enough activity yet.</p>;
  }
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const w = (d.orders / max) * 100;
        return (
          <div key={d.weekday} className="flex items-center gap-3">
            <span className="text-xs font-bold w-9 text-brand-primary-green/60">{DOW_LABEL[d.weekday]}</span>
            <div className="flex-1 h-3 bg-brand-primary-green/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary-green to-brand-orange rounded-full"
                style={{ width: `${w}%` }}
              />
            </div>
            <span className="text-xs font-bold text-brand-primary-green tabular-nums w-10 text-right">
              {d.orders}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusDonut({ data }: { data: { status: string; count: number; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) {
    return <p className="text-sm text-brand-primary-green/50 py-12 text-center">No orders yet.</p>;
  }
  const COLOR: Record<string, string> = {
    PENDING: "#f59e0b",
    PENDING_VERIFICATION: "#3b82f6",
    PAID: "#10b981",
    DISPATCHED: "#a855f7",
    DELIVERED: "#16a34a",
    CANCELLED: "#ef4444",
  };
  const R = 60;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg viewBox="-80 -80 160 160" className="w-40 h-40 -rotate-90">
        <circle cx="0" cy="0" r={R} fill="none" stroke="rgba(8,89,67,0.06)" strokeWidth="20" />
        {data
          .filter((d) => d.count > 0)
          .map((d) => {
            const frac = d.count / total;
            const dash = frac * C;
            const offset = -acc;
            acc += dash;
            return (
              <circle
                key={d.status}
                cx="0"
                cy="0"
                r={R}
                fill="none"
                stroke={COLOR[d.status]}
                strokeWidth="20"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={offset}
              />
            );
          })}
        <text x="0" y="-2" textAnchor="middle" dominantBaseline="middle" transform="rotate(90)" className="fill-brand-primary-green font-bold" style={{ fontSize: 20 }}>
          {total}
        </text>
        <text x="0" y="14" textAnchor="middle" dominantBaseline="middle" transform="rotate(90)" className="fill-brand-primary-green/50" style={{ fontSize: 8 }}>
          ORDERS
        </text>
      </svg>
      <ul className="space-y-1.5 text-sm flex-1 min-w-[180px]">
        {data.map((d) => {
          const pct = total > 0 ? (d.count / total) * 100 : 0;
          return (
            <li key={d.status} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLOR[d.status] }} />
                <span className="text-brand-primary-green/80 text-xs font-bold uppercase tracking-wider">
                  {d.status.replace(/_/g, " ")}
                </span>
              </span>
              <span className="tabular-nums text-xs font-bold text-brand-primary-green">
                {d.count} <span className="opacity-50">({pct.toFixed(0)}%)</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function VarietyList({ data }: { data: { variety: string; kg: number; revenue: number; orders: number }[] }) {
  const max = Math.max(1, ...data.map((v) => v.revenue));
  return (
    <div className="space-y-3">
      {data.map((v) => {
        const w = (v.revenue / max) * 100;
        return (
          <div key={v.variety} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-brand-primary-green">{v.variety}</span>
              <span className="text-xs text-brand-primary-green/60 tabular-nums">
                {fmtNum(v.kg)} kg · {v.orders} orders ·{" "}
                <span className="text-brand-primary-green font-bold">{fmtRupees(v.revenue)}</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-brand-primary-green/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-primary-green to-brand-orange rounded-full transition-all"
                style={{ width: `${w}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RankList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { label: string; count: number; revenue: number }[];
}) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
      <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
        {icon} {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-brand-primary-green/50 py-6 text-center">No data yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c, i) => (
            <li key={c.label + i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-brand-primary-green/10 text-brand-primary-green font-bold flex items-center justify-center text-xs shrink-0">
                  {i + 1}
                </span>
                <span className="font-semibold text-brand-primary-green truncate">{c.label}</span>
              </div>
              <div className="flex items-baseline gap-3 shrink-0">
                <span className="text-brand-primary-green/60 text-xs">{c.count} orders</span>
                <span className="font-bold text-brand-primary-green tabular-nums">{fmtRupees(c.revenue)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
