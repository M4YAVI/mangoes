"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, Truck, MapPin } from "lucide-react";
import { useCartStore } from "@/app/store/useCartStore";

export default function MobileNavBar() {
  const pathname = usePathname();
  const { toggleCart, items, _hasHydrated } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide mobile bottom navigation bar on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const cartItemCount = items.length;

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      name: "Order",
      href: "/mangoes",
      // Custom SVG skewer icon matching the user's reference image
      customIcon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <line x1="5" y1="19" x2="19" y2="5" />
          <circle cx="9" cy="15" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
          <circle cx="15" cy="9" r="2.2" fill="currentColor" stroke="none" />
        </svg>
      ),
      isActive: pathname?.startsWith("/mangoes"),
    },
    {
      name: "Cart",
      onClick: () => toggleCart(true),
      icon: ShoppingCart,
      isCart: true,
      isActive: false, // Opens as a drawer rather than a route
    },
    {
      name: "Track",
      href: "/track",
      icon: Truck,
      isActive: pathname?.startsWith("/track"),
    },
    {
      name: "Location",
      href: "/contact",
      icon: MapPin,
      isActive: pathname?.startsWith("/contact"),
    },
  ];

  return (
    <>
      {/* Spacer to push content up so the fixed navbar doesn't cover footer info */}
      <div className="h-16 lg:hidden" />

      {/* Fixed Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-45 bg-brand-cream border-t border-brand-primary-green/10 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
        <nav className="flex justify-around items-stretch h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const content = (
              <div className="flex flex-col items-center justify-center gap-1 h-full w-full py-2">
                <div className="relative">
                  {item.customIcon ? (
                    item.customIcon
                  ) : (
                    Icon && <Icon className="w-5 h-5 stroke-[2]" />
                  )}
                  {item.isCart && isMounted && _hasHydrated && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-brand-orange text-white text-[9px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full border border-brand-cream animate-in zoom-in duration-300">
                      {cartItemCount}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold tracking-wide font-sans">{item.name}</span>
              </div>
            );

            // Active gets the yellow-orange brand highlight, inactive is green-toned
            const baseClasses = `flex-grow flex-1 flex items-center justify-center transition-all ${
              item.isActive
                ? "bg-[#DE8A24] text-[#1B330F]"
                : "text-[#1B330F] hover:bg-brand-primary-green/5"
            }`;

            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className={`${baseClasses} border-none outline-none focus:outline-none`}
                  type="button"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href || "#"}
                className={baseClasses}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
