import { Star } from "lucide-react";

export default function CustomerReviews() {
  const reviews = [
    {
      name: "Srinivas Rao",
      role: "Miyapur, Hyderabad",
      text: "The Banganapalle mangoes were incredibly sweet and fresh. Reminded me of my childhood visits to the village orchards. Highly recommended!",
      stars: 5
    },
    {
      name: "Anjali Sharma",
      role: "Gachibowli",
      text: "I've been looking for carbide-free mangoes for a long time. Palle Mamidi is now my go-to for the entire season. The Imam Pasand was divine.",
      stars: 5
    },
    {
      name: "Karthik Raja",
      role: "Kukatpally",
      text: "Excellent packaging and timely delivery. The mangoes arrived in perfect condition. Great variety and even better taste.",
      stars: 5
    }
  ];

  return (
    <section id="reviews" className="py-16 px-6 lg:px-12 bg-brand-cream">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-4">
            <span className="text-[#D27E1C] font-bold uppercase tracking-widest text-xs">Testimonials</span>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-[#1B330F]">
              What Our Customers Say
            </h2>
          </div>
          <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-sm border border-[#1B330F]/5">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="font-bold text-[#1B330F]">4.9/5 Average Rating</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#1B330F]/5 flex flex-col justify-between hover:shadow-xl transition-shadow duration-500">
              <div className="space-y-6">
                <div className="flex text-yellow-400">
                  {[...Array(r.stars)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#3F4E34] text-lg leading-relaxed italic">"{r.text}"</p>
              </div>
              <div className="mt-8 flex items-center space-x-4">
                <div className="w-12 h-12 bg-brand-primary-green/10 rounded-full flex items-center justify-center font-bold text-brand-primary-green">
                  {r.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-[#1B330F]">{r.name}</h4>
                  <p className="text-xs text-[#D27E1C] font-semibold">{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
