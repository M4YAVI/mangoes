import { Truck, CircleHelp, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/app/lib/config";

export default function TopBar() {
  return (
    <div className="hidden md:flex bg-[#1B330F] text-brand-cream text-[11px] py-1.5 px-6 lg:px-12 justify-between items-center z-50 relative">
      <div className="text-[#b5c7a4]">
        From our village to your home... <span className="text-brand-cream">Pure as nature</span>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6 text-[#b5c7a4]">
        <div className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
          <CircleHelp className="w-4 h-4" />
          <span>Help & Support</span>
        </div>
        <div className="w-px h-4 bg-[#4F5939]"></div>
        <a href={SITE_CONFIG.contact.phoneLink} className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
          <Phone className="w-4 h-4" />
          <span>{SITE_CONFIG.contact.phone}</span>
        </a>
      </div>
    </div>
  );
}
