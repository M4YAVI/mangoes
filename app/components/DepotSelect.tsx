"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, MapPin, Search, Check } from "lucide-react";
import { RTC_DEPOTS, STATE_LABELS, type RtcDepot } from "@/app/lib/rtcDepots";

interface DepotSelectProps {
  value: string | null;
  onChange: (code: string, depot: RtcDepot) => void;
  preferredState?: string; // narrow when customer's shipping state is known
}

export default function DepotSelect({ value, onChange, preferredState }: DepotSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(() => RTC_DEPOTS.find((d) => d.code === value), [value]);

  // Click-outside to close
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Auto-focus search when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Filter + sort. Match on name/city/aliases/state. Prefer customer's state to the top.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const score = (d: RtcDepot): number => {
      let s = 0;
      if (preferredState) {
        const stateMap: Record<string, RtcDepot["state"]> = {
          "andhra pradesh": "AP", ap: "AP",
          "telangana": "TG", tg: "TG",
          "karnataka": "KA", ka: "KA",
          "tamil nadu": "TN", tn: "TN",
          "odisha": "OD", od: "OD",
          "maharashtra": "MH", mh: "MH",
        };
        if (stateMap[preferredState.toLowerCase()] === d.state) s += 100;
      }
      if (!q) return s;
      const hay = [d.name, d.city, d.landmark || "", STATE_LABELS[d.state], ...(d.aliases || [])]
        .join(" ")
        .toLowerCase();
      if (hay.includes(q)) s += 50;
      if (d.name.toLowerCase().startsWith(q)) s += 30;
      if (d.city.toLowerCase().startsWith(q)) s += 30;
      if (d.aliases?.some((a) => a.toLowerCase().startsWith(q))) s += 20;
      return s;
    };

    const list = q
      ? RTC_DEPOTS.filter((d) => {
          const hay = [d.name, d.city, d.landmark || "", STATE_LABELS[d.state], ...(d.aliases || [])]
            .join(" ")
            .toLowerCase();
          return hay.includes(q);
        })
      : RTC_DEPOTS;

    return [...list].sort((a, b) => score(b) - score(a));
  }, [query, preferredState]);

  // Group by state for the unsearched view
  const grouped = useMemo(() => {
    if (query.trim()) return null;
    const map = new Map<RtcDepot["state"], RtcDepot[]>();
    for (const d of filtered) {
      const arr = map.get(d.state) || [];
      arr.push(d);
      map.set(d.state, arr);
    }
    return Array.from(map.entries());
  }, [filtered, query]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full bg-white border border-brand-primary-green/10 rounded-xl px-4 py-3.5 text-left text-sm flex items-center justify-between gap-3 hover:border-brand-primary-green/30 focus:outline-none focus:border-brand-primary-green/40 focus:ring-4 focus:ring-brand-primary-green/10 transition-all duration-200"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-brand-primary-green/50 shrink-0" />
          {selected ? (
            <span className="truncate">
              <span className="font-semibold text-brand-primary-green">{selected.name}</span>
              {selected.city !== "—" && (
                <span className="text-brand-primary-green/50"> · {selected.city}, {STATE_LABELS[selected.state]}</span>
              )}
            </span>
          ) : (
            <span className="text-brand-primary-green/50">Select your nearest RTC bus depot…</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-brand-primary-green/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-brand-primary-green/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="border-b border-brand-primary-green/5 p-2 flex items-center gap-2 bg-brand-cream/40">
            <Search className="w-4 h-4 text-brand-primary-green/40 ml-2" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, station name (e.g. MGBS, Vijayawada, Tirupati)…"
              className="flex-1 bg-transparent text-sm py-2 focus:outline-none text-brand-primary-green"
            />
          </div>

          <div className="max-h-[320px] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-brand-primary-green/50 text-center py-8">
                No depot matches "{query}". Pick "Other" and share details in notes.
              </p>
            ) : grouped ? (
              grouped.map(([state, items]) => (
                <div key={state}>
                  <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-1.5 text-[10px] font-bold text-brand-primary-green/40 uppercase tracking-widest border-b border-brand-primary-green/5">
                    {STATE_LABELS[state]}
                  </div>
                  {items.map((d) => (
                    <DepotOption key={d.code} depot={d} active={d.code === value} onPick={() => { onChange(d.code, d); setOpen(false); setQuery(""); }} />
                  ))}
                </div>
              ))
            ) : (
              filtered.map((d) => (
                <DepotOption key={d.code} depot={d} active={d.code === value} onPick={() => { onChange(d.code, d); setOpen(false); setQuery(""); }} />
              ))
            )}
          </div>

          <div className="border-t border-brand-primary-green/5 px-4 py-2 text-[10px] text-brand-primary-green/40 bg-brand-cream/30">
            {RTC_DEPOTS.length - 1} bus stations across {Object.keys(STATE_LABELS).length} states
          </div>
        </div>
      )}
    </div>
  );
}

function DepotOption({ depot, active, onPick }: { depot: RtcDepot; active: boolean; onPick: () => void }) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-brand-cream/40 transition group ${
        active ? "bg-brand-primary-green/5" : ""
      }`}
    >
      <div className="mt-0.5">
        {active ? (
          <Check className="w-4 h-4 text-brand-primary-green" />
        ) : (
          <MapPin className="w-4 h-4 text-brand-primary-green/30 group-hover:text-brand-primary-green/60" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${active ? "text-brand-primary-green" : "text-brand-primary-green/90"}`}>
          {depot.name}
        </p>
        <p className="text-xs text-brand-primary-green/50">
          {depot.city !== "—" ? `${depot.city} · ${STATE_LABELS[depot.state]}` : depot.landmark}
          {depot.landmark && depot.city !== "—" && ` · ${depot.landmark}`}
        </p>
      </div>
    </button>
  );
}
