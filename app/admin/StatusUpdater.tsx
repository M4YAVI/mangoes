"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin";
import type { OrderStatus } from "@/db/schema";

interface StatusUpdaterProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUSES: OrderStatus[] = [
  "PENDING",
  "PENDING_VERIFICATION",
  "PAID",
  "DISPATCHED",
  "DELIVERED",
  "CANCELLED",
];

const COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PENDING_VERIFICATION: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  DISPATCHED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-200 text-green-900",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function StatusUpdater({ orderId, currentStatus }: StatusUpdaterProps) {
  const [busy, setBusy] = useState<OrderStatus | null>(null);
  const [, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const handle = (newStatus: OrderStatus) => {
    setErr(null);
    setBusy(newStatus);
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) setErr(res.error || "Update failed");
      setBusy(null);
    });
  };

  return (
    <div className="space-y-2 mt-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const active = s === currentStatus;
          return (
            <button
              key={s}
              type="button"
              onClick={() => handle(s)}
              disabled={busy !== null || active}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                active
                  ? `${COLORS[s]} cursor-default ring-2 ring-brand-primary-green/20`
                  : "bg-black/5 text-brand-primary-green hover:bg-brand-orange hover:text-white"
              } disabled:opacity-50`}
            >
              {busy === s ? "…" : s.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
