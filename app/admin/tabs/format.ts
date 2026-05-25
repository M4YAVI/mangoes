export function fmtRupees(n: number): string {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export function fmtRupeesShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e7) return "₹" + (n / 1e7).toFixed(2) + "Cr";
  if (abs >= 1e5) return "₹" + (n / 1e5).toFixed(2) + "L";
  if (abs >= 1e3) return "₹" + (n / 1e3).toFixed(1) + "k";
  return fmtRupees(n);
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-IN");
}

export function fmtDate(s: string | Date): string {
  return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export function fmtDateTime(s: string | Date): string {
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  PENDING_VERIFICATION: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500" },
  PAID: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  DISPATCHED: { bg: "bg-purple-50", text: "text-purple-800", dot: "bg-purple-500" },
  DELIVERED: { bg: "bg-green-100", text: "text-green-900", dot: "bg-green-600" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
};
