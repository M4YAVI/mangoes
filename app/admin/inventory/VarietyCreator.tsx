"use client";

import { useState, useTransition } from "react";
import { createVariety } from "@/app/actions/inventory";
import { PlusCircle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VarietyCreator() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    image: "/mangoes/mango-1.png",
    pricePerKg: 150,
    allowedWeightsKg: "1,5,10",
    sortOrder: 100,
  });
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setErr(null);
    setOk(false);
    const weights = form.allowedWeightsKg
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0);

    if (form.name.trim().length < 2) return setErr("Variety name required.");
    if (form.description.trim().length < 2) return setErr("Description required.");
    if (!(form.pricePerKg > 0)) return setErr("Price per kg must be > 0.");
    if (weights.length === 0) return setErr("Enter at least one box weight (e.g. 1,5,10).");

    startTransition(async () => {
      const res = await createVariety({
        name: form.name.trim(),
        description: form.description.trim(),
        image: form.image.trim() || "/mangoes/mango-1.png",
        pricePerKg: Number(form.pricePerKg),
        allowedWeightsKg: weights,
        status: "AVAILABLE",
        sortOrder: Number(form.sortOrder),
        isActive: true,
      });
      if (res.success) {
        setOk(true);
        setForm({ name: "", description: "", image: "/mangoes/mango-1.png", pricePerKg: 150, allowedWeightsKg: "1,5,10", sortOrder: 100 });
        setTimeout(() => { setOk(false); setOpen(false); }, 1500);
      } else {
        setErr(res.error || "Could not create variety.");
      }
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full bg-white border-2 border-dashed border-brand-primary-green/20 rounded-3xl p-8 text-brand-primary-green/70 hover:border-brand-primary-green hover:text-brand-primary-green transition flex items-center justify-center gap-2 font-bold"
      >
        <PlusCircle className="w-5 h-5" /> Add new variety
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-primary-green/10">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Variety name *">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kesar Mango" className="inp" />
        </Field>
        <Field label="Price per kg (₹) *">
          <input type="number" min={1} value={form.pricePerKg} onChange={(e) => setForm({ ...form, pricePerKg: Number(e.target.value) })} className="inp" />
        </Field>
        <Field label="Box weights (kg, csv) *">
          <input value={form.allowedWeightsKg} onChange={(e) => setForm({ ...form, allowedWeightsKg: e.target.value })} className="inp font-mono" placeholder="1,5,10" />
        </Field>
        <Field label="Display order">
          <input type="number" min={0} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="inp" />
        </Field>
        <Field label="Image path *" className="sm:col-span-2">
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/mangoes/your-image.png" className="inp font-mono" />
        </Field>
        <Field label="Short description *" className="sm:col-span-2">
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Sweet, fragrant, premium…" className="inp" />
        </Field>
      </div>

      {err && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{err}</span>
        </div>
      )}
      {ok && (
        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle2 className="w-4 h-4" /> Variety created successfully.
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="bg-brand-primary-green text-brand-cream px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition disabled:opacity-50"
        >
          <PlusCircle className="w-4 h-4" /> {pending ? "Creating…" : "Create variety"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-xl text-brand-primary-green/70 hover:bg-black/5">
          Cancel
        </button>
      </div>

      <style jsx>{`
        :global(.inp) {
          width: 100%; background: white; border: 1px solid rgba(27, 51, 15, 0.1);
          border-radius: 0.75rem; padding: 0.625rem 0.875rem; font-size: 0.875rem;
          outline: none; transition: box-shadow 0.15s;
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
