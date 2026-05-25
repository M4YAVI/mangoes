"use client";

import { useState, useTransition } from "react";
import { updateVariety, deleteVariety } from "@/app/actions/inventory";
import type { CatalogEntry, VarietyStatus } from "@/app/lib/catalog";
import { Save, Trash2, Image as ImageIcon, AlertCircle, CheckCircle2 } from "lucide-react";

const STATUS_OPTIONS: { value: VarietyStatus; label: string; chip: string }[] = [
  { value: "AVAILABLE",     label: "Available",     chip: "bg-emerald-100 text-emerald-800" },
  { value: "PREBOOKING",    label: "Pre-book",      chip: "bg-cyan-100 text-cyan-800" },
  { value: "OUT_OF_SEASON", label: "Out of Season", chip: "bg-amber-100 text-amber-800" },
  { value: "SOLD_OUT",      label: "Sold Out",      chip: "bg-red-100 text-red-800" },
];

export default function VarietyEditor({ variety }: { variety: CatalogEntry }) {
  const [form, setForm] = useState({
    name: variety.name,
    description: variety.description,
    image: variety.image,
    pricePerKg: variety.pricePerKg,
    allowedWeightsKg: variety.allowedWeightsKg.join(","),
    status: variety.status,
    sortOrder: variety.sortOrder,
  });
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isDirty =
    form.name !== variety.name ||
    form.description !== variety.description ||
    form.image !== variety.image ||
    form.pricePerKg !== variety.pricePerKg ||
    form.allowedWeightsKg !== variety.allowedWeightsKg.join(",") ||
    form.status !== variety.status ||
    form.sortOrder !== variety.sortOrder;

  const save = () => {
    setErr(null);
    setSaved(false);
    const weights = form.allowedWeightsKg
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (weights.length === 0) {
      setErr("At least one valid box weight is required (e.g. 1,5,10).");
      return;
    }
    if (!(form.pricePerKg > 0)) {
      setErr("Price per kg must be greater than 0.");
      return;
    }

    startTransition(async () => {
      const res = await updateVariety(variety.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        pricePerKg: Number(form.pricePerKg),
        allowedWeightsKg: weights,
        status: form.status,
        sortOrder: Number(form.sortOrder),
      });
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setErr(res.error || "Save failed");
      }
    });
  };

  const remove = () => {
    if (!confirm(`Deactivate "${variety.name}"? It will be hidden from the website. Past order history is preserved.`)) return;
    startTransition(async () => {
      const res = await deleteVariety(variety.id);
      if (!res.success) setErr(res.error || "Delete failed");
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-primary-green/5">
      <div className="grid md:grid-cols-[120px_1fr_auto] gap-6 items-start">
        <div className="relative w-full aspect-square bg-brand-cream/40 rounded-2xl flex items-center justify-center overflow-hidden">
          {form.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt={form.name} className="object-contain w-full h-full"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-brand-primary-green/30" />
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3 flex-1 min-w-0">
          <Field label="Variety name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="inp" />
          </Field>
          <Field label="Price per kg (₹)">
            <input
              type="number"
              min={1}
              step={1}
              value={form.pricePerKg}
              onChange={(e) => setForm({ ...form, pricePerKg: Number(e.target.value) })}
              className="inp"
            />
          </Field>
          <Field label="Allowed box weights (kg, csv)">
            <input
              value={form.allowedWeightsKg}
              onChange={(e) => setForm({ ...form, allowedWeightsKg: e.target.value })}
              placeholder="e.g. 1,5,10"
              className="inp font-mono"
            />
          </Field>
          <Field label="Display order">
            <input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              className="inp"
            />
          </Field>
          <Field label="Image path (in /public)" className="sm:col-span-2">
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/mangoes/mango-1.png" className="inp font-mono" />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea
              value={form.description}
              rows={2}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="inp"
            />
          </Field>

          <div className="sm:col-span-2">
            <p className="text-[10px] uppercase font-bold text-brand-primary-green/50 mb-2 tracking-widest">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, status: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    form.status === opt.value ? `${opt.chip} ring-2 ring-brand-primary-green/20` : "bg-black/5 text-brand-primary-green/60 hover:bg-black/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[120px]">
          <button
            type="button"
            onClick={save}
            disabled={pending || !isDirty}
            className="bg-brand-primary-green text-brand-cream px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-30"
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved" : pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="bg-red-50 text-red-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition disabled:opacity-30"
          >
            <Trash2 className="w-4 h-4" /> Deactivate
          </button>
        </div>
      </div>

      {err && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{err}</span>
        </div>
      )}

      <style jsx>{`
        :global(.inp) {
          width: 100%;
          background: white;
          border: 1px solid rgba(27, 51, 15, 0.1);
          border-radius: 0.75rem;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          outline: none;
          transition: box-shadow 0.15s;
        }
        :global(.inp:focus) { box-shadow: 0 0 0 3px rgba(27, 51, 15, 0.15); }
      `}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold text-brand-primary-green/50 uppercase mb-1 tracking-widest">{label}</label>
      {children}
    </div>
  );
}
