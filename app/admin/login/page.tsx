"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await login(password);
      if (result.success) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B330F] flex items-center justify-center p-4">
      <div className="bg-brand-cream w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden isolate">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary-green/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-brand-primary-green text-brand-cream rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-brand-primary-green">
            Admin Portal
          </h1>
          <p className="text-sm text-brand-primary-green/60 mt-2">
            Secure access to Palle Mamidi operations.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl flex items-start space-x-3 text-sm animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-brand-primary-green/60 uppercase mb-2 tracking-wider">
              Secure Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full bg-white border border-[#1B330F]/10 rounded-xl p-4 text-brand-primary-green focus:outline-none focus:ring-2 focus:ring-brand-primary-green/20 font-mono tracking-widest transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-brand-primary-green text-brand-cream py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 hover:shadow-xl transition-all disabled:opacity-50 group cursor-pointer"
          >
            <span>{isLoading ? "Authenticating..." : "Login to Dashboard"}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
      </div>
    </div>
  );
}
