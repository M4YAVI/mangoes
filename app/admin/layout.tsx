import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifyAuth } from "@/app/actions/auth";
import Link from "next/link";
import { LayoutDashboard, LogOut, Package } from "lucide-react";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const session = await verifyAuth(token);

  // If there's no valid session, just render the children (e.g., the login page) without the admin shell
  if (!session) {
    return <>{children}</>;
  }

  // If authenticated, render the full Admin Dashboard Shell
  return (
    <div className="min-h-screen bg-brand-cream/50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand-primary-green text-brand-cream flex flex-col">
        <div className="p-6 border-b border-brand-cream/10">
          <Link href="/admin" className="block text-2xl font-[family-name:var(--font-playfair)] font-bold tracking-wide">
            Palle Mamidi
            <span className="block text-xs font-sans text-brand-orange mt-1 uppercase tracking-widest">Admin Portal</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-4 py-3 bg-brand-cream/10 rounded-xl font-medium transition-colors hover:bg-brand-cream/15"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/inventory"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors hover:bg-brand-cream/10 text-brand-cream/80"
          >
            <Package className="w-5 h-5" />
            <span>Inventory</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-brand-cream/10">
          <form action={logout}>
            <button className="flex items-center space-x-3 px-4 py-3 w-full text-left text-brand-cream/60 hover:text-brand-orange hover:bg-white/5 rounded-xl transition-colors cursor-pointer font-medium">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
