import Link from "next/link";
import { Globe, Send, Share2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1B330F] text-brand-cream pt-12 pb-8 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-6">
            <h2 className="font-[family-name:var(--font-telugu)] text-4xl font-bold">పల్లె మామిడి</h2>
            <p className="text-brand-cream/60 text-sm leading-relaxed">
              Bringing the authentic taste of naturally ripened village mangoes straight to your doorstep. Pure, chemical-free, and delicious.
            </p>
            <div className="flex items-center space-x-4">
              {[Globe, Send, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-brand-cream hover:text-[#1B330F] transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl">Quick Links</h3>
            <ul className="space-y-4 text-brand-cream/60 text-sm font-medium">
              <li><Link href="/" className="hover:text-brand-cream transition-colors">Home</Link></li>
              <li><Link href="/mangoes" className="hover:text-brand-cream transition-colors">Our Mangoes</Link></li>
              <li><a href="#about" className="hover:text-brand-cream transition-colors">About Us</a></li>
              <li><a href="#why" className="hover:text-brand-cream transition-colors">Why Choose Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl">Contact Us</h3>
            <ul className="space-y-4 text-brand-cream/60 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 shrink-0 text-[#D27E1C]" />
                <span>Palle Mamidi Orchards, Andhra Pradesh, India</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 shrink-0 text-[#D27E1C]" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 shrink-0 text-[#D27E1C]" />
                <span>orders@pallemamidi.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="font-bold text-xl">Stay Updated</h3>
            <p className="text-brand-cream/60 text-sm leading-relaxed">
              Subscribe to get notified about new harvests and seasonal offers.
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="bg-white/5 border border-white/10 rounded-l-xl px-4 py-3 text-sm focus:outline-none w-full"
              />
              <button className="bg-brand-cream text-[#1B330F] px-6 rounded-r-xl font-bold hover:bg-[#DE8A24] hover:text-white transition-all">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-brand-cream/30 font-bold uppercase tracking-widest">
          <p>© 2026 Palle Mamidi. All Rights Reserved.</p>
          <div className="flex items-center space-x-8">
            <a href="#" className="hover:text-brand-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-cream transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
