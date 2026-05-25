import Link from "next/link";
import MangoCard from "./MangoCard";
import { getCatalog, type CatalogEntry } from "@/app/lib/catalog";
import { hashNumericId } from "@/app/lib/hash";

export default async function MangoGrid({ limit }: { limit?: number }) {
  const catalog = await getCatalog();
  const displayVarieties = limit ? catalog.slice(0, limit) : catalog;
  const showExplore = limit && catalog.length > limit;

  return (
    <section id="varieties" className="py-8 px-6 lg:px-12 bg-brand-cream">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="h-px w-12 bg-[#D27E1C] opacity-30"></div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold text-[#1B330F] text-center">
            {limit ? "Our Premium Mango Varieties" : "All Our Mango Varieties"}
          </h2>
          <div className="h-px w-12 bg-[#D27E1C] opacity-30"></div>
        </div>

        {displayVarieties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {displayVarieties.map((mango) => (
              <MangoCard key={mango.id} mango={cardShape(mango)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-brand-primary-green/5">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-primary-green mb-2">
              No mangoes available right now
            </h3>
            <p className="text-brand-primary-green/60">Check back soon for fresh seasonal arrivals.</p>
          </div>
        )}

        {showExplore && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/mangoes"
              className="bg-[#1B330F] text-brand-cream px-10 py-4 rounded-full font-bold flex items-center space-x-3 hover:bg-[#2E4D25] transition-all shadow-lg group"
            >
              <span>Explore More Varieties</span>
              <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// Adapter — MangoCard was built around a numeric id and a strict status union.
function cardShape(entry: CatalogEntry) {
  return {
    id: hashNumericId(entry.id),
    name: entry.name,
    description: entry.description,
    image: entry.image,
    pricePerKg: entry.pricePerKg,
    allowedWeightsKg: entry.allowedWeightsKg,
    status: entry.status,
  };
}

