import { getAllVarietiesForAdmin } from "@/app/lib/catalog";
import VarietyEditor from "./VarietyEditor";
import VarietyCreator from "./VarietyCreator";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const varieties = await getAllVarietiesForAdmin();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <header className="space-y-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-bold text-brand-primary-green/60 hover:text-brand-primary-green"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-[family-name:var(--font-playfair)] font-bold text-brand-primary-green flex items-center gap-3">
              <Package className="w-8 h-8" /> Variety Controller
            </h1>
            <p className="text-brand-primary-green/60 mt-2 max-w-2xl text-sm">
              Update prices, toggle availability, or add seasonal varieties. Changes go live instantly — no redeploy
              needed. The live website reads from this list.
            </p>
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-widest font-bold text-brand-primary-green/60">
          Current Varieties ({varieties.length})
        </h2>
        <div className="grid gap-4">
          {varieties.map((v) => (
            <VarietyEditor key={v.id} variety={v} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm uppercase tracking-widest font-bold text-brand-primary-green/60">
          Add a New Variety
        </h2>
        <VarietyCreator />
      </section>
    </div>
  );
}
