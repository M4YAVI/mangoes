import { Truck, CircleHelp, Phone } from "lucide-react";

export default function TopBar() {
  return (
    <div className="bg-[#1B330F] text-brand-cream text-[11px] py-1 px-6 lg:px-12 flex flex-col sm:flex-row justify-between items-center z-50 relative">
      <div className="mb-2 sm:mb-0 text-center sm:text-left text-[#b5c7a4]">
        From our village to your home... <span className="text-brand-cream">Pure as nature</span>
      </div>
      <div className="flex items-center space-x-4 sm:space-x-6 text-[#b5c7a4]">
        <div className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
          <CircleHelp className="w-4 h-4" />
          <span>Help & Support</span>
        </div>
        <div className="w-px h-4 bg-[#4F5939]"></div>
        <div className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
          <Phone className="w-4 h-4" />
          <span>+91 98481 60920</span>
        </div>
      </div>
    </div>
  );
}
