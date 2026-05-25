"use server";

import { db } from "@/db/index";
import { orders, orderItems } from "@/db/schema";
import { sql, inArray, gte, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { verifyAuth } from "./auth";

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const session = await verifyAuth(token);
  if (!session || session.role !== "admin") throw new Error("Unauthorized");
}

export interface DashboardAnalytics {
  totals: {
    verifiedRevenue: number;
    pendingVerificationAmount: number;
    pendingAmount: number;
    totalKgSold: number;
    ordersAll: number;
    ordersVerified: number;
    ordersPending: number;
    ordersDispatched: number;
    ordersDelivered: number;
    ordersCancelled: number;
    avgOrderValue: number;
    uniqueCustomers: number;
    repeatCustomers: number;
    revenueToday: number;
    revenueThisMonth: number;
    revenuePrevMonth: number;
    ordersToday: number;
  };
  statusBreakdown: { status: string; count: number; value: number }[];
  last30Days: { date: string; revenue: number; orders: number }[];
  last7Days: { date: string; revenue: number; orders: number }[];
  topVarieties: { variety: string; kg: number; revenue: number; orders: number }[];
  topCities: { city: string; orders: number; revenue: number }[];
  topStates: { state: string; orders: number; revenue: number }[];
  topDepots: { depot: string; orders: number; revenue: number }[];
  hourlyPattern: { hour: number; orders: number }[];
  weekdayPattern: { weekday: number; orders: number }[];
  fulfillment: {
    avgVerifyHours: number | null;
    avgDispatchHours: number | null;
    avgDeliveryDays: number | null;
    sampleSize: number;
  };
  topCustomers: {
    phone: string;
    name: string;
    orders: number;
    revenue: number;
    lastOrder: string;
  }[];
}

const VERIFIED_STATUSES = ["PAID", "DISPATCHED", "DELIVERED"] as const;
const PENDING_VERIFY_STATUSES = ["PENDING_VERIFICATION"] as const;
const PENDING_STATUSES = ["PENDING"] as const;

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  await requireAdmin();

  // ---------- Aggregates per status ----------
  const statusRows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
    })
    .from(orders)
    .groupBy(orders.status);

  const byStatus = Object.fromEntries(
    statusRows.map((r) => [r.status, { count: r.count, sum: Number(r.sum) }])
  ) as Record<string, { count: number; sum: number }>;

  const sumFor = (keys: readonly string[]) =>
    keys.reduce((s, k) => s + (byStatus[k]?.sum || 0), 0);
  const countFor = (keys: readonly string[]) =>
    keys.reduce((s, k) => s + (byStatus[k]?.count || 0), 0);

  const verifiedRevenue = sumFor(VERIFIED_STATUSES);
  const pendingVerificationAmount = sumFor(PENDING_VERIFY_STATUSES);
  const pendingAmount = sumFor(PENDING_STATUSES);

  const ordersAll = statusRows.reduce((s, r) => s + r.count, 0);
  const ordersVerified = countFor(VERIFIED_STATUSES);
  const ordersCancelled = byStatus["CANCELLED"]?.count || 0;

  const statusBreakdown = (
    ["PENDING", "PENDING_VERIFICATION", "PAID", "DISPATCHED", "DELIVERED", "CANCELLED"] as const
  ).map((s) => ({
    status: s,
    count: byStatus[s]?.count || 0,
    value: byStatus[s]?.sum || 0,
  }));

  // ---------- Verified-order line items (variety totals + kg) ----------
  const verifiedOrderIds = await db
    .select({ id: orders.id })
    .from(orders)
    .where(inArray(orders.status, VERIFIED_STATUSES as any));

  let totalKgSold = 0;
  const varietyTotals: Record<string, { kg: number; revenue: number; orders: Set<string> }> = {};

  if (verifiedOrderIds.length > 0) {
    const ids = verifiedOrderIds.map((r) => r.id);
    const itemRows = await db
      .select({
        variety: orderItems.variety,
        quantityKg: orderItems.quantityKg,
        priceAtPurchase: orderItems.priceAtPurchase,
        orderId: orderItems.orderId,
      })
      .from(orderItems)
      .where(inArray(orderItems.orderId, ids));

    for (const r of itemRows) {
      totalKgSold += r.quantityKg;
      const v = (varietyTotals[r.variety] ||= { kg: 0, revenue: 0, orders: new Set() });
      v.kg += r.quantityKg;
      v.revenue += r.quantityKg * Number(r.priceAtPurchase);
      v.orders.add(r.orderId);
    }
  }

  const topVarieties = Object.entries(varietyTotals)
    .map(([variety, v]) => ({ variety, kg: v.kg, revenue: v.revenue, orders: v.orders.size }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ---------- Top cities / states / depots (verified) ----------
  const cityRows = await db
    .select({
      city: orders.city,
      count: sql<number>`count(*)::int`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
    })
    .from(orders)
    .where(inArray(orders.status, VERIFIED_STATUSES as any))
    .groupBy(orders.city)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const topCities = cityRows.map((r) => ({
    city: r.city,
    orders: r.count,
    revenue: Number(r.sum),
  }));

  const stateRows = await db
    .select({
      state: orders.state,
      count: sql<number>`count(*)::int`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
    })
    .from(orders)
    .where(inArray(orders.status, VERIFIED_STATUSES as any))
    .groupBy(orders.state)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const topStates = stateRows.map((r) => ({
    state: r.state,
    orders: r.count,
    revenue: Number(r.sum),
  }));

  const depotRows = await db
    .select({
      depot: orders.rtcDepotName,
      count: sql<number>`count(*)::int`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, VERIFIED_STATUSES as any),
        sql`${orders.rtcDepotName} is not null`
      )
    )
    .groupBy(orders.rtcDepotName)
    .orderBy(sql`count(*) desc`)
    .limit(8);

  const topDepots = depotRows
    .filter((r) => r.depot)
    .map((r) => ({
      depot: r.depot as string,
      orders: r.count,
      revenue: Number(r.sum),
    }));

  // ---------- Daily revenue: last 30 days ----------
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const dayRows = await db
    .select({
      day: sql<string>`to_char(coalesce(${orders.paidAt}, ${orders.createdAt})::date, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
    })
    .from(orders)
    .where(and(inArray(orders.status, VERIFIED_STATUSES as any), gte(orders.createdAt, thirtyDaysAgo)))
    .groupBy(sql`coalesce(${orders.paidAt}, ${orders.createdAt})::date`)
    .orderBy(sql`coalesce(${orders.paidAt}, ${orders.createdAt})::date asc`);

  const byDay = Object.fromEntries(
    dayRows.map((r) => [r.day, { revenue: Number(r.sum), orders: r.count }])
  );

  const last30Days: DashboardAnalytics["last30Days"] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const entry = byDay[key] || { revenue: 0, orders: 0 };
    last30Days.push({ date: key, revenue: entry.revenue, orders: entry.orders });
  }
  const last7Days = last30Days.slice(-7);

  // ---------- Hourly + weekday pattern (all orders, last 60d) ----------
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  const patternRows = await db
    .select({
      hour: sql<number>`extract(hour from ${orders.createdAt})::int`,
      dow: sql<number>`extract(dow from ${orders.createdAt})::int`,
    })
    .from(orders)
    .where(gte(orders.createdAt, sixtyDaysAgo));

  const hourCounts = new Array(24).fill(0) as number[];
  const dowCounts = new Array(7).fill(0) as number[];
  for (const r of patternRows) {
    if (r.hour >= 0 && r.hour < 24) hourCounts[r.hour]++;
    if (r.dow >= 0 && r.dow < 7) dowCounts[r.dow]++;
  }
  const hourlyPattern = hourCounts.map((c, i) => ({ hour: i, orders: c }));
  const weekdayPattern = dowCounts.map((c, i) => ({ weekday: i, orders: c }));

  // ---------- Fulfillment timings ----------
  const fulfillmentRows = await db
    .select({
      createdAt: orders.createdAt,
      utrSubmittedAt: orders.utrSubmittedAt,
      paidAt: orders.paidAt,
      dispatchedAt: orders.dispatchedAt,
      deliveredAt: orders.deliveredAt,
    })
    .from(orders)
    .where(inArray(orders.status, VERIFIED_STATUSES as any));

  let verifySum = 0,
    verifyN = 0,
    dispatchSum = 0,
    dispatchN = 0,
    deliverSum = 0,
    deliverN = 0;
  for (const r of fulfillmentRows) {
    if (r.utrSubmittedAt && r.paidAt) {
      const h = (+r.paidAt - +r.utrSubmittedAt) / 36e5;
      if (h >= 0 && h < 720) {
        verifySum += h;
        verifyN++;
      }
    }
    if (r.paidAt && r.dispatchedAt) {
      const h = (+r.dispatchedAt - +r.paidAt) / 36e5;
      if (h >= 0 && h < 720) {
        dispatchSum += h;
        dispatchN++;
      }
    }
    if (r.dispatchedAt && r.deliveredAt) {
      const d = (+r.deliveredAt - +r.dispatchedAt) / 864e5;
      if (d >= 0 && d < 60) {
        deliverSum += d;
        deliverN++;
      }
    }
  }

  const fulfillment = {
    avgVerifyHours: verifyN > 0 ? verifySum / verifyN : null,
    avgDispatchHours: dispatchN > 0 ? dispatchSum / dispatchN : null,
    avgDeliveryDays: deliverN > 0 ? deliverSum / deliverN : null,
    sampleSize: fulfillmentRows.length,
  };

  // ---------- Customers (group by phone) ----------
  const customerRows = await db
    .select({
      phone: orders.phoneNumber,
      name: sql<string>`(array_agg(${orders.customerName} order by ${orders.createdAt} desc))[1]`,
      orders: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(case when ${orders.status} in ('PAID','DISPATCHED','DELIVERED') then ${orders.totalAmount} else 0 end), 0)::text`,
      lastOrder: sql<string>`max(${orders.createdAt})::text`,
    })
    .from(orders)
    .groupBy(orders.phoneNumber)
    .orderBy(sql`count(*) desc`);

  const uniqueCustomers = customerRows.length;
  const repeatCustomers = customerRows.filter((r) => r.orders > 1).length;
  const topCustomers = customerRows.slice(0, 10).map((r) => ({
    phone: r.phone,
    name: r.name,
    orders: r.orders,
    revenue: Number(r.revenue),
    lastOrder: r.lastOrder,
  }));

  // ---------- Today / This month / Prev month revenue ----------
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
  const startOfPrevMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth() - 1, 1);
  const endOfPrevMonth = new Date(startOfMonth.getTime() - 1);

  const revenueWindowRows = await db
    .select({
      day: sql<string>`to_char(coalesce(${orders.paidAt}, ${orders.createdAt})::date, 'YYYY-MM-DD')`,
      sum: sql<string>`coalesce(sum(${orders.totalAmount}),0)::text`,
      count: sql<number>`count(*)::int`,
      createdAt: sql<string>`min(coalesce(${orders.paidAt}, ${orders.createdAt}))::text`,
    })
    .from(orders)
    .where(
      and(inArray(orders.status, VERIFIED_STATUSES as any), gte(orders.createdAt, startOfPrevMonth))
    )
    .groupBy(sql`coalesce(${orders.paidAt}, ${orders.createdAt})::date`);

  let revenueToday = 0,
    revenueThisMonth = 0,
    revenuePrevMonth = 0;
  for (const r of revenueWindowRows) {
    const d = new Date(r.day);
    const amt = Number(r.sum);
    if (d >= startOfToday) revenueToday += amt;
    if (d >= startOfMonth) revenueThisMonth += amt;
    else if (d >= startOfPrevMonth && d <= endOfPrevMonth) revenuePrevMonth += amt;
  }

  const ordersTodayRow = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(orders)
    .where(gte(orders.createdAt, startOfToday));
  const ordersToday = ordersTodayRow[0]?.c || 0;

  return {
    totals: {
      verifiedRevenue,
      pendingVerificationAmount,
      pendingAmount,
      totalKgSold,
      ordersAll,
      ordersVerified,
      ordersPending: countFor(PENDING_STATUSES) + countFor(PENDING_VERIFY_STATUSES),
      ordersDispatched: byStatus["DISPATCHED"]?.count || 0,
      ordersDelivered: byStatus["DELIVERED"]?.count || 0,
      ordersCancelled,
      avgOrderValue: ordersVerified > 0 ? verifiedRevenue / ordersVerified : 0,
      uniqueCustomers,
      repeatCustomers,
      revenueToday,
      revenueThisMonth,
      revenuePrevMonth,
      ordersToday,
    },
    statusBreakdown,
    last30Days,
    last7Days,
    topVarieties,
    topCities,
    topStates,
    topDepots,
    hourlyPattern,
    weekdayPattern,
    fulfillment,
    topCustomers,
  };
}
