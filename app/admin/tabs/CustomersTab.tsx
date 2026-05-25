"use client";

import { useMemo, useState } from "react";
import type { DashboardAnalytics } from "@/app/actions/analytics";
import type { AdminOrder } from "../AdminDashboard";
import { fmtRupees, fmtDate, STATUS_COLOR } from "./format";
import { Search, Users, UserPlus, Repeat, Crown, Phone } from "lucide-react";

interface CustomerSummary {
  phone: string;
  name: string;
  city: string;
  state: string;
  orders: number;
  revenue: number;
  verifiedOrders: number;
  lastOrder: string;
  firstOrder: string;
  statuses: string[];
}

export default function CustomersTab({
  analytics,
  orders,
}: {
  analytics: DashboardAnalytics;
  orders: AdminOrder[];
}) {
  const [query, setQuery] = useState("");

  const customers = useMemo<CustomerSummary[]>(() => {
    const map = new Map<string, CustomerSummary>();
    for (const o of orders) {
      const k = o.phoneNumber;
      const verified = ["PAID", "DISPATCHED", "DELIVERED"].includes(o.status);
      const amt = Number(o.totalAmount);
      const ex = map.get(k);
      if (!ex) {
        map.set(k, {
          phone: k,
          name: o.customerName,
          city: o.city,
          state: o.state,
          orders: 1,
          revenue: verified ? amt : 0,
          verifiedOrders: verified ? 1 : 0,
          lastOrder: o.createdAt,
          firstOrder: o.createdAt,
          statuses: [o.status],
        });
      } else {
        ex.orders++;
        if (verified) {
          ex.revenue += amt;
          ex.verifiedOrders++;
        }
        if (+new Date(o.createdAt) > +new Date(ex.lastOrder)) {
          ex.lastOrder = o.createdAt;
          ex.name = o.customerName;
          ex.city = o.city;
          ex.state = o.state;
        }
        if (+new Date(o.createdAt) < +new Date(ex.firstOrder)) {
          ex.firstOrder = o.createdAt;
        }
        ex.statuses.push(o.status);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.phone.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, query]);

  const top = customers[0];
  const newCount = customers.filter((c) => c.orders === 1).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Customers" value={analytics.totals.uniqueCustomers.toString()} tone="emerald" />
        <StatCard icon={<Repeat className="w-5 h-5" />} label="Repeat Customers" value={analytics.totals.repeatCustomers.toString()} sub={`${customers.length > 0 ? Math.round((analytics.totals.repeatCustomers / customers.length) * 100) : 0}% retention`} tone="violet" />
        <StatCard icon={<UserPlus className="w-5 h-5" />} label="One-time" value={newCount.toString()} tone="amber" />
        <StatCard
          icon={<Crown className="w-5 h-5" />}
          label="Top Customer"
          value={top ? fmtRupees(top.revenue) : "—"}
          sub={top ? `${top.name} · ${top.orders} orders` : ""}
          tone="blue"
        />
      </div>

      <div className="bg-white rounded-2xl p-4 border border-brand-primary-green/5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-primary-green/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone or city…"
            className="w-full pl-9 pr-3 py-2.5 bg-brand-cream/40 rounded-xl border border-transparent focus:border-brand-primary-green/30 focus:bg-white outline-none text-sm font-medium text-brand-primary-green placeholder:text-brand-primary-green/40"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-brand-primary-green/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-brand-cream/40">
              <tr className="text-[10px] uppercase text-brand-primary-green/60 font-bold tracking-wider">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left">Customer</th>
                <th className="text-left">Location</th>
                <th className="text-center">Orders</th>
                <th className="text-center">Verified</th>
                <th className="text-right">Lifetime ₹</th>
                <th className="text-right">Last Order</th>
                <th className="text-left pl-4">Status</th>
                <th className="text-right pr-4">Tag</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-brand-primary-green/50">
                    No customers match.
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => {
                  const lastStatus = c.statuses[c.statuses.length - 1];
                  const col = STATUS_COLOR[lastStatus];
                  const tag =
                    c.orders >= 5 ? "VIP" : c.orders >= 2 ? "Repeat" : "New";
                  const tagColor =
                    tag === "VIP"
                      ? "bg-amber-100 text-amber-800"
                      : tag === "Repeat"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-blue-100 text-blue-800";
                  return (
                    <tr key={c.phone} className="border-t border-brand-primary-green/5 hover:bg-brand-cream/20 transition">
                      <td className="py-3 px-4 text-brand-primary-green/40 text-xs font-mono">{i + 1}</td>
                      <td>
                        <p className="font-bold text-brand-primary-green">{c.name}</p>
                        <a href={`tel:${c.phone}`} className="text-[11px] font-mono text-brand-primary-green/60 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" /> {c.phone}
                        </a>
                      </td>
                      <td className="text-xs text-brand-primary-green/70">
                        {c.city}, {c.state}
                      </td>
                      <td className="text-center font-bold text-brand-primary-green tabular-nums">{c.orders}</td>
                      <td className="text-center text-brand-primary-green/70 tabular-nums">{c.verifiedOrders}</td>
                      <td className="text-right font-bold text-brand-primary-green tabular-nums">
                        {fmtRupees(c.revenue)}
                      </td>
                      <td className="text-right text-xs text-brand-primary-green/60">{fmtDate(c.lastOrder)}</td>
                      <td className="pl-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${col.bg} ${col.text} px-2 py-0.5 rounded-md`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                          {lastStatus.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="text-right pr-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${tagColor}`}>
                          {tag}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone: keyof typeof TONES;
}) {
  return (
    <div className={`rounded-2xl p-5 border ${TONES[tone]}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="text-[11px] opacity-70 mt-0.5">{sub}</p>}
    </div>
  );
}
