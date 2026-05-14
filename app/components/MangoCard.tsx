"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, ShoppingBasket, Check } from "lucide-react";
import { useCartStore } from "@/app/store/useCartStore";

interface MangoCardProps {
  mango: {
    id: number;
    name: string;
    description: string;
    image: string;
    pricePerKg: number;
  };
}

export default function MangoCard({ mango }: MangoCardProps) {
  const [weight, setWeight] = useState<number | string>(3);
  const [isAdded, setIsAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const toggleCart = useCartStore((state) => state.toggleCart);

  // Parse weight to number safely, default to 0 if invalid
  const numericWeight = typeof weight === "number" ? weight : parseFloat(weight) || 0;
  const price = Math.round(numericWeight * mango.pricePerKg);

  const handleWeightChange = (val: number | string) => {
    if (typeof val === "number") {
      if (val >= 0) setWeight(val);
    } else {
      // Allow empty string for typing
      if (val === "" || /^\d*\.?\d*$/.test(val)) {
        setWeight(val);
      }
    }
  };

  const handleAddToCart = () => {
    if (numericWeight <= 0) return;

    addItem({
      id: mango.id,
      name: mango.name,
      image: mango.image,
      weight: numericWeight,
      pricePerKg: mango.pricePerKg,
    });
    
    setIsAdded(true);
    toggleCart(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <div className="bg-brand-primary-green rounded-2xl border border-white/10 p-2.5 flex flex-col items-center text-center hover:shadow-[0_20px_50px_rgba(27,51,15,0.4)] transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden isolate">
      {/* Dynamic Background Glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700 pointer-events-none -z-10" />
      
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] mb-2 overflow-hidden rounded-xl bg-white/5 flex items-center justify-center p-2">
        <Image
          src={mango.image}
          alt={mango.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-contain group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute top-2 right-2 bg-brand-cream/10 backdrop-blur-md border border-white/10 text-brand-cream text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full pointer-events-none">
          Fresh Arrival
        </div>
      </div>

      {/* Info */}
      <div className="mb-2 relative z-10">
        <h3 className="font-[family-name:var(--font-playfair)] text-xl md:text-2xl font-bold text-brand-orange group-hover:text-brand-orange transition-colors duration-300">
          {mango.name}
        </h3>
        <p className="text-brand-cream/80 text-[11px] leading-relaxed h-9 overflow-hidden">
          {mango.description}
        </p>
      </div>

      {/* Weight Selector */}
      <div className="w-full space-y-1.5 mb-2 relative z-10">
        <div className="flex justify-between items-center bg-black/20 rounded-2xl p-1 gap-1">
          {[3, 5, 10].map((w) => (
            <button
              key={w}
              onClick={() => setWeight(w)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer relative z-20 ${
                numericWeight === w 
                  ? "bg-brand-cream text-brand-primary-green shadow-xl scale-[1.02]" 
                  : "text-brand-cream/60 hover:text-brand-cream hover:bg-white/5"
              }`}
            >
              {w}kg
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded-xl p-1 border border-white/10 group/weight transition-all hover:bg-white/10 relative z-20">
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => { e.stopPropagation(); handleWeightChange(Math.max(1, numericWeight - 1)); }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-cream hover:bg-brand-orange hover:text-white transition-all cursor-pointer active:scale-90 relative z-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center min-w-[50px] relative z-30">
              <div className="flex items-baseline space-x-1">
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  className="bg-transparent border-none outline-none text-brand-cream font-bold text-xl w-10 text-center p-0 placeholder:text-brand-cream/20 cursor-text"
                  placeholder="0"
                />
                <span className="text-brand-cream/40 text-[10px] uppercase font-bold">Kg</span>
              </div>
              <span className="text-[8px] text-brand-cream/20 uppercase font-black tracking-widest">Enter Weight</span>
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); handleWeightChange(numericWeight + 1); }}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-brand-cream hover:bg-brand-orange hover:text-white transition-all cursor-pointer active:scale-90 relative z-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="text-right border-l border-white/10 pl-4 relative z-30">
            <span className="block text-brand-cream/40 text-[10px] uppercase font-bold mb-0.5">Total Price</span>
            <div className="flex items-center justify-end text-brand-cream font-bold text-2xl tabular-nums animate-in fade-in slide-in-from-bottom-2 duration-300">
              <span className="text-sm mr-0.5 opacity-60 font-medium">₹</span>
              {price.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={handleAddToCart}
        disabled={isAdded}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 transform active:scale-95 cursor-pointer relative z-10 text-sm ${
          isAdded 
            ? "bg-green-500 text-white" 
            : "bg-brand-cream text-brand-primary-green hover:shadow-[0_10px_20px_rgba(242,232,207,0.3)]"
        }`}
      >
        {isAdded ? (
          <>
            <Check className="w-5 h-5" />
            <span>Added to Cart</span>
          </>
        ) : (
          <>
            <ShoppingBasket className="w-5 h-5" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
}
