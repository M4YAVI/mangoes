import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <main className="relative w-full overflow-hidden bg-brand-cream">
      {/* Hero Image - Using img tag to ensure zero cropping and perfect aspect ratio */}
      <img 
        src="/hero-2.png" 
        alt="Palla Mamidi Hero" 
        className="w-full h-auto block"
      />

      {/* Overlay Content */}
      <div className="absolute inset-0 z-10 w-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="max-w-xl">
            <h2 className="font-[family-name:var(--font-playfair)] text-[#1B330F] text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-4 tracking-tight">
              From our orchards<br />
              to your home,<br />
              with love...
            </h2>
            
            <p className="text-[#3F4E34] text-lg md:text-xl mb-6 max-w-sm leading-relaxed italic opacity-90">
              Straight from our farms,<br />
              delivered with care.
            </p>

            {/* CTA Button */}
            <a 
              href="#varieties"
              className="bg-[#3F6322] hover:bg-[#2E4D25] transition-all hover:scale-105 active:scale-95 text-white rounded-full py-3 px-8 text-base font-semibold inline-flex items-center space-x-3 shadow-xl group w-fit"
            >
              <span>Shop Mangoes Now</span>
              <div className="bg-white rounded-full p-1 text-[#3F6322] group-hover:text-[#2E4D25] transition-colors">
                <ArrowRight className="w-5 h-5" strokeWidth={3} />
              </div>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
