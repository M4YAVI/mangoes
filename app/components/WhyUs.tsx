import { ShieldCheck, Leaf, Truck, Smile } from "lucide-react";

export default function WhyUs() {
  const features = [
    {
      icon: ShieldCheck,
      title: "Pure & Organic",
      desc: "No pesticides or harmful chemicals. Just pure, natural goodness."
    },
    {
      icon: Leaf,
      title: "Naturally Ripened",
      desc: "We don't use carbides. Our mangoes ripen naturally on the tree."
    },
    {
      icon: Truck,
      title: "Farm Fresh",
      desc: "Harvested and delivered within 24-48 hours for peak freshness."
    },
    {
      icon: Smile,
      title: "Customer First",
      desc: "Your satisfaction is our priority. Quality guaranteed or replacement."
    }
  ];

  return (
    <section id="why" className="py-16 px-6 lg:px-12 bg-brand-primary-green relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 space-y-4">
          <span className="text-brand-cream/60 font-bold uppercase tracking-widest text-xs">The Palle Mamidi Difference</span>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-brand-cream">
            Why Choose Us?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div 
              key={i}
              className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-brand-cream text-brand-primary-green rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-brand-cream text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-brand-cream/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
