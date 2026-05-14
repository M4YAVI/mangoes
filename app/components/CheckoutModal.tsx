"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Package, Truck, CreditCard, ArrowRight, X } from "lucide-react";
import { useCartStore } from "@/app/store/useCartStore";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState(1);
  const { items, clearCart } = useCartStore();
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      clearCart();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-brand-cream w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-brand-primary-green" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Progress Sidebar */}
          <div className="bg-brand-primary-green p-8 md:w-64 shrink-0 text-brand-cream">
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-10">Checkout</h2>
            
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-brand-cream/20" />
              
              {[
                { s: 1, label: "Shipping", icon: Truck },
                { s: 2, label: "Payment", icon: CreditCard },
                { s: 3, label: "Confirm", icon: CheckCircle2 },
              ].map(({ s, label, icon: Icon }) => (
                <div key={s} className="flex items-center space-x-4 relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    step >= s ? "bg-brand-cream text-brand-primary-green border-brand-cream" : "border-brand-cream/20 bg-brand-primary-green"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`font-bold transition-opacity duration-500 ${step >= s ? "opacity-100" : "opacity-40"}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-20 pt-8 border-t border-brand-cream/10">
              <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">Total Amount</p>
              <p className="text-3xl font-bold font-[family-name:var(--font-playfair)] tabular-nums">₹{subtotal.toLocaleString()}</p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-brand-primary-green">Shipping Details</h3>
                <div className="grid grid-cols-1 gap-4">
                  <input type="text" placeholder="Full Name" className="w-full bg-white border border-[#1B330F]/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-green/20" />
                  <input type="text" placeholder="Phone Number" className="w-full bg-white border border-[#1B330F]/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-green/20" />
                  <textarea placeholder="Delivery Address" rows={3} className="w-full bg-white border border-[#1B330F]/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-green/20" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h3 className="text-2xl font-bold text-brand-primary-green">Payment Method</h3>
                <div className="space-y-3">
                  {['UPI (Google Pay, PhonePe)', 'Credit / Debit Card', 'Cash on Delivery'].map((method) => (
                    <label key={method} className="flex items-center p-4 bg-white border border-[#1B330F]/10 rounded-xl cursor-pointer hover:bg-brand-primary-green/5 transition-colors group">
                      <input type="radio" name="payment" className="w-4 h-4 text-brand-primary-green cursor-pointer" defaultChecked={method.startsWith('UPI')} />
                      <span className="ml-4 font-semibold text-brand-primary-green">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-primary-green">Order Confirmed!</h3>
                  <p className="text-brand-primary-green/60 mt-2">
                    Thank you for choosing Palle Mamidi.<br />Your delicious mangoes are on their way!
                  </p>
                </div>
                <div className="bg-white/50 border border-dashed border-[#1B330F]/20 rounded-2xl p-6 w-full">
                  <p className="text-xs uppercase tracking-widest font-bold text-brand-primary-green/40 mb-2">Estimated Delivery</p>
                  <p className="font-bold text-brand-primary-green">May 15 - May 18, 2026</p>
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-end">
              <button 
                onClick={handleNextStep}
                className="bg-brand-primary-green text-brand-cream py-4 px-10 rounded-2xl font-bold flex items-center space-x-3 hover:shadow-xl transition-all group overflow-hidden relative cursor-pointer"
              >
                <span className="relative z-10">
                  {step === 1 ? "Next: Payment" : step === 2 ? "Confirm Order" : "Back to Home"}
                </span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
