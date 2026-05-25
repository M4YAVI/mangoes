"use client";

import type { DashboardAnalytics } from "@/app/actions/analytics";
import type { AdminOrder } from "../AdminDashboard";
import { fmtRupees, fmtRupeesShort, fmtNum, fmtDate, STATUS_COLOR } from "./format";
import {
  IndianRupee,
  ShieldCheck,
  Scale,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Users,
  CalendarDays,
  ArrowUpRight,
  Clock,
  Truck,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function OverviewTab({
  analytics,
  orders,
  onJumpToOrders,
}: {
  analytics: DashboardAnalytics;
  orders: AdminOrder[];
  onJumpToOrders: () => void;
}) {
  const { totals, last30Days, statusBreakdown, fulfillment } = analytics;

  const monthDelta =
    totals.revenuePrevMonth > 0
      ? ((totals.revenueThisMonth - totals.revenuePrevMonth) / totals.revenuePrevMonth) * 100
      : totals.revenueThisMonth > 0
      ? 100
      : 0;

  const recent = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Today's Revenue"
          value={fmtRupees(totals.revenueToday)}
          sub={`${totals.ordersToday} orders today`}
          tone="emerald"
        />
        <KpiCard
          icon={<CalendarDays className="w-5 h-5" />}
          label="This Month"
          value={fmtRupeesShort(totals.revenueThisMonth)}
          sub={
            <span className={`flex items-center gap-1 ${monthDelta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              {monthDelta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(monthDelta).toFixed(1)}% vs last month
            </span>
          }
          tone="violet"
        />
        <KpiCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Awaiting UTR"
          value={fmtRupees(totals.pendingVerificationAmount)}
          sub={`${statusBreakdown.find((s) => s.status === "PENDING_VERIFICATION")?.count || 0} orders to verify`}
          tone="blue"
        />
        <KpiCard
          icon={<Users className="w-5 h-5" />}
          label="Customers"
          value={fmtNum(totals.uniqueCustomers)}
          sub={`${totals.repeatCustomers} repeat (${
            totals.uniqueCustomers > 0
              ? Math.round((totals.repeatCustomers / totals.uniqueCustomers) * 100)
              : 0
          }%)`}
          tone="amber"
        />
      </div>

      {/* Status pill bar */}
      <div className="bg-white rounded-2xl p-4 border border-brand-primary-green/5">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {statusBreakdown.map((s) => {
            const c = STATUS_COLOR[s.status];
            return (
              <button
                key={s.status}
                onClick={onJumpToOrders}
                className={`text-left ${c.bg} rounded-xl p-3 hover:scale-[1.02] transition cursor-pointer`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${c.text}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                </div>
                <p className={`text-xl font-bold ${c.text}`}>{s.count}</p>
                <p className={`text-[10px] ${c.text} opacity-70`}>{fmtRupeesShort(s.value)}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trend chart + Fulfillment */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-brand-primary-green/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-brand-primary-green flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Revenue · last 30 days
            </h3>
            <span className="text-xs text-brand-primary-green/50">
              Total: {fmtRupees(last30Days.reduce((s, d) => s + d.revenue, 0))}
            </span>
          </div>
          <RevenueArea data={last30Days} />
        </div>

        <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5 space-y-4">
          <h3 className="font-bold text-brand-primary-green flex items-center gap-2">
            <Truck className="w-4 h-4" /> Fulfillment timings
          </h3>
          <FulfillmentRow
            icon={<ShieldCheck className="w-4 h-4 text-blue-600" />}
            label="UTR → Verified"
            value={fulfillment.avgVerifyHours != null ? `${fulfillment.avgVerifyHours.toFixed(1)} h` : "—"}
          />
          <FulfillmentRow
            icon={<Clock className="w-4 h-4 text-purple-600" />}
            label="Paid → Dispatched"
            value={fulfillment.avgDispatchHours != null ? `${fulfillment.avgDispatchHours.toFixed(1)} h` : "—"}
          />
          <FulfillmentRow
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
            label="Dispatched → Delivered"
            value={fulfillment.avgDeliveryDays != null ? `${fulfillment.avgDeliveryDays.toFixed(1)} d` : "—"}
          />
          <p className="text-[10px] text-brand-primary-green/40 pt-2 border-t border-brand-primary-green/5">
            Averages across {fulfillment.sampleSize} verified orders.
          </p>
        </div>
      </div>

      {/* Recent orders quick view */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-brand-primary-green">Recent orders</h3>
          <button
            onClick={onJumpToOrders}
            className="text-xs font-bold text-brand-primary-green/60 hover:text-brand-primary-green flex items-center gap-1 cursor-pointer"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-brand-primary-green/50 py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase text-brand-primary-green/50 font-bold tracking-wider border-b border-brand-primary-green/5">
                  <th className="text-left py-2">Order</th>
                  <th className="text-left">Customer</th>
                  <th className="text-left">City</th>
                  <th className="text-right">Amount</th>
                  <th className="text-left pl-4">Status</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const c = STATUS_COLOR[o.status];
                  return (
                    <tr key={o.id} className="border-b border-brand-primary-green/5 last:border-0">
                      <td className="py-3 font-mono text-xs text-brand-primary-green/70">{o.orderNumber}</td>
                      <td className="font-semibold text-brand-primary-green">{o.customerName}</td>
                      <td className="text-brand-primary-green/70">{o.city}</td>
                      <td className="text-right font-bold text-brand-primary-green tabular-nums">
                        {fmtRupees(Number(o.totalAmount))}
                      </td>
                      <td className="pl-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} px-2 py-1 rounded-md`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                          {o.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-right text-xs text-brand-primary-green/60">{fmtDate(o.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory shortcut */}
      <Link
        href="/admin/inventory"
        className="block bg-gradient-to-r from-brand-primary-green to-brand-primary-green/90 text-brand-cream rounded-3xl p-6 hover:shadow-lg transition group"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Variety controller</p>
            <p className="text-xl font-bold mt-1">Manage prices, stock & seasonal varieties</p>
          </div>
          <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
        </div>
      </Link>
    </div>
  );
}

function FulfillmentRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-brand-primary-green/70">{label}</span>
      </div>
      <span className="font-bold text-brand-primary-green tabular-nums">{value}</span>
    </div>
  );
}

function RevenueArea({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const W = 600;
  const H = 160;
  const PAD = 8;
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => {
    const x = PAD + i * stepX;
    const y = H - PAD - (d.revenue / max) * (H - PAD * 2);
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${pts[0][0]},${H - PAD} ` +
    pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1][0]},${H - PAD} Z`;

  if (data.every((d) => d.revenue === 0)) {
    return <p className="text-sm text-brand-primary-green/50 py-12 text-center">No verified revenue in the last 30 days.</p>;
  }

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-44">
        <defs>
          <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(245 158 11)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="rgb(245 158 11)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#rev-area)" />
        <path d={linePath} fill="none" stroke="rgb(8 89 67)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([x, y], i) =>
          data[i].revenue > 0 ? (
            <circle key={i} cx={x} cy={y} r="2" fill="rgb(8 89 67)" />
          ) : null
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-brand-primary-green/50 mt-1 px-1">
        <span>{fmtDate(data[0].date)}</span>
        <span>{fmtDate(data[Math.floor(data.length / 2)].date)}</span>
        <span>{fmtDate(data[data.length - 1].date)}</span>
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
};

function KpiCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: React.ReactNode;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${TONES[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] opacity-80 mt-0.5">{sub}</p>
    </div>
  );
}
