import type { DashboardAnalytics } from "@/app/actions/analytics";
import { IndianRupee, ShieldCheck, Scale, ShoppingBag, TrendingUp, MapPin, BarChart3 } from "lucide-react";

function fmtRupees(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function AnalyticsPanel({ data }: { data: DashboardAnalytics }) {
  const { totals, last7Days, topVarieties, topCities } = data;
  const maxRevenue = Math.max(1, ...last7Days.map((d) => d.revenue));
  const maxVarietyRevenue = Math.max(1, ...topVarieties.map((v) => v.revenue));

  return (
    <section className="space-y-6">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<IndianRupee className="w-5 h-5" />}
          label="Verified Revenue"
          value={fmtRupees(totals.verifiedRevenue)}
          sub={`${totals.ordersVerified} verified orders`}
          tone="emerald"
        />
        <KpiCard
          icon={<ShieldCheck className="w-5 h-5" />}
          label="Pending Verification"
          value={fmtRupees(totals.pendingVerificationAmount)}
          sub="UTR submitted, not verified"
          tone="blue"
        />
        <KpiCard
          icon={<Scale className="w-5 h-5" />}
          label="Total Mangoes Shipped"
          value={`${totals.totalKgSold.toLocaleString("en-IN")} kg`}
          sub="across verified orders"
          tone="amber"
        />
        <KpiCard
          icon={<ShoppingBag className="w-5 h-5" />}
          label="Avg Order Value"
          value={fmtRupees(totals.avgOrderValue)}
          sub={`${totals.ordersAll} total orders`}
          tone="violet"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* 7-day revenue chart */}
        <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-brand-primary-green flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Revenue · last 7 days
            </h3>
            <span className="text-xs text-brand-primary-green/50">
              Total: {fmtRupees(last7Days.reduce((s, d) => s + d.revenue, 0))}
            </span>
          </div>
          {last7Days.every((d) => d.revenue === 0) ? (
            <p className="text-sm text-brand-primary-green/50 py-8 text-center">No verified revenue in the last 7 days.</p>
          ) : (
            <div className="flex items-end gap-2 h-32">
              {last7Days.map((d) => {
                const heightPct = (d.revenue / maxRevenue) * 100;
                const day = new Date(d.date).toLocaleDateString("en-IN", { weekday: "short" });
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] text-brand-primary-green/60 font-mono opacity-0 group-hover:opacity-100 transition">
                      {fmtRupees(d.revenue)}
                    </span>
                    <div className="w-full bg-brand-primary-green/5 rounded-t-lg flex-1 flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-brand-primary-green to-brand-orange rounded-t-lg transition-all"
                        style={{ height: `${heightPct}%`, minHeight: d.revenue > 0 ? "4px" : "0" }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-brand-primary-green/60">{day}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top cities */}
        <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
          <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4" /> Top destination cities
          </h3>
          {topCities.length === 0 ? (
            <p className="text-sm text-brand-primary-green/50 py-8 text-center">No verified shipments yet.</p>
          ) : (
            <ul className="space-y-3">
              {topCities.map((c, i) => (
                <li key={c.city} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-primary-green/10 text-brand-primary-green font-bold flex items-center justify-center text-xs">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-brand-primary-green">{c.city}</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-brand-primary-green/60">{c.orders} orders</span>
                    <span className="font-bold text-brand-primary-green tabular-nums">{fmtRupees(c.revenue)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Best-selling varieties */}
      <div className="bg-white rounded-3xl p-6 border border-brand-primary-green/5">
        <h3 className="font-bold text-brand-primary-green flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4" /> Best-selling varieties (by revenue)
        </h3>
        {topVarieties.length === 0 ? (
          <p className="text-sm text-brand-primary-green/50 py-8 text-center">
            No verified sales yet. Sales appear here once orders are marked PAID.
          </p>
        ) : (
          <div className="space-y-3">
            {topVarieties.map((v) => {
              const widthPct = (v.revenue / maxVarietyRevenue) * 100;
              return (
                <div key={v.variety} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-brand-primary-green">{v.variety}</span>
                    <span className="text-xs text-brand-primary-green/60 tabular-nums">
                      {v.kg.toLocaleString("en-IN")} kg · {v.orders} orders ·{" "}
                      <span className="text-brand-primary-green font-bold">{fmtRupees(v.revenue)}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-brand-primary-green/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-primary-green to-brand-orange rounded-full transition-all"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const TONES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue:    "bg-blue-50 text-blue-700 border-blue-100",
  amber:   "bg-amber-50 text-amber-700 border-amber-100",
  violet:  "bg-violet-50 text-violet-700 border-violet-100",
};

function KpiCard({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: keyof typeof TONES }) {
  return (
    <div className={`rounded-2xl p-5 border ${TONES[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] opacity-70 mt-0.5">{sub}</p>
    </div>
  );
}
