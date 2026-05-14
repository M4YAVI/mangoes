"use client";

import Link from "next/link";
import MangoCard from "./MangoCard";
import { useCartStore } from "@/app/store/useCartStore";

export const MANGO_VARIETIES = [
  {
    id: 1,
    name: "Banganapalli",
    description: "Sweet, fragrant, and rich in juice. The pride of South India.",
    image: "/mangoes/mango-1.png",
    pricePerKg: 120,
  },
  {
    id: 2,
    name: "Rasalu",
    description: "Extremely sweet and juicy, a traditional royal favorite.",
    image: "/mangoes/mango-2.png",
    pricePerKg: 150,
  },
  {
    id: 3,
    name: "Totapuri",
    description: "Unique oblong shape, perfect for pickles and fresh salads.",
    image: "/mangoes/mango-3.png",
    pricePerKg: 80,
  },
  {
    id: 4,
    name: "Ugadi Mango",
    description: "Tangy, firm, and essential for traditional festive dishes.",
    image: "/mangoes/mango-4.png",
    pricePerKg: 100,
  },
  {
    id: 5,
    name: "Suvarnarekha",
    description: "Beautiful golden skin with a sweet, fiberless pulp.",
    image: "/mangoes/mango-5.png",
    pricePerKg: 130,
  },
  {
    id: 6,
    name: "Imam Pasand",
    description: "The 'King of Mangoes', creamy, fiberless, and ultra-premium.",
    image: "/mangoes/mango-6.png",
    pricePerKg: 250,
  },
  {
    id: 7,
    name: "Mallika",
    description: "Exquisite hybrid, firm and exceptionally sweet with no fiber.",
    image: "/mangoes/mango-7.png",
    pricePerKg: 180,
  },
];

export default function MangoGrid({ limit }: { limit?: number }) {
  const filteredVarieties = MANGO_VARIETIES;

  const displayVarieties = limit ? filteredVarieties.slice(0, limit) : filteredVarieties;
  const showExplore = limit && filteredVarieties.length > limit;

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {displayVarieties.map((mango) => (
              <MangoCard key={mango.id} mango={mango} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-brand-primary-green/5">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-brand-primary-green mb-2">
              No mangoes found
            </h3>
            <p className="text-brand-primary-green/60">
              Check back soon for more varieties!
            </p>
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
