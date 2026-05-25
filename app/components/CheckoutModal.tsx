"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  CheckCircle2,
  Truck,
  CreditCard,
  ArrowRight,
  X,
  AlertCircle,
  Smartphone,
  QrCode,
  Copy,
  Loader2,
  User,
  MapPin,
  Building2,
  Globe,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/app/store/useCartStore";
import { submitOrder, submitUtr, type SubmitOrderResult } from "@/app/actions/orders";
import { recordCheckoutEventAction } from "@/app/actions/emails";
import DepotSelect from "./DepotSelect";
import type { RtcDepot } from "@/app/lib/rtcDepots";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentSession = Extract<SubmitOrderResult, { success: true }>;

const INDIAN_STATES = [
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu", "Kerala",
  "Maharashtra", "Gujarat", "Goa", "Odisha", "Chhattisgarh",
  "Madhya Pradesh", "Uttar Pradesh", "Delhi", "Haryana", "Punjab",
  "Rajasthan", "West Bengal", "Bihar", "Jharkhand", "Assam", "Other",
];

function detectIsMobile() {
  if (typeof navigator === "undefined") return false;
  return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { items, clearCart } = useCartStore();

  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    state: "Andhra Pradesh",
    city: "",
    pincode: "",
    rtcLandmark: "",
    customerNotes: "",
  });
  const [depot, setDepot] = useState<RtcDepot | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const [utr, setUtr] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState<"vpa" | "amount" | null>(null);

  const [sessionId, setSessionId] = useState("");
  const sentEventTypes = useRef<Set<string>>(new Set());

  const triggerWarmLead = async () => {
    const hasPhone = /^[6-9]\d{9}$/.test(formData.phoneNumber);
    const hasName = formData.customerName.trim().length >= 2;
    if (
      hasName &&
      hasPhone &&
      !sentEventTypes.current.has("CHECKOUT_STARTED") &&
      !sentEventTypes.current.has("PAYMENT_INTENT") &&
      !sentEventTypes.current.has("PAYMENT_SUBMITTED")
    ) {
      sentEventTypes.current.add("CHECKOUT_STARTED");
      try {
        await recordCheckoutEventAction({
          sessionId,
          customerName: formData.customerName,
          phone: formData.phoneNumber,
          state: formData.state,
          city: formData.city,
          pincode: formData.pincode,
          rtcDepotCode: depot?.code || "",
          rtcDepotName: depot?.name || "",
          rtcLandmark: formData.rtcLandmark,
          customerNotes: formData.customerNotes,
          cartItems: items.map((i) => ({
            variety: i.name,
            weightKg: i.weight,
            quantity: i.quantity,
            price: i.pricePerKg,
          })),
          eventType: "CHECKOUT_STARTED",
        });
      } catch (err) {
        console.error("Error recording Warm Lead:", err);
      }
    }
  };

  const handleClose = async () => {
    await triggerWarmLead();
    onClose();
  };

  // Display-only running total. Server recomputes from DB at submit time — this is just a hint.
  const serverTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.pricePerKg * item.weight * item.quantity, 0),
    [items]
  );

  const totalWeight = useMemo(
    () => items.reduce((sum, item) => sum + item.weight * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setIsSubmitting(false);
      setPayment(null);
      setUtr("");
      setIsMobile(detectIsMobile());
      
      const newSessionId = "pm_sess_" + Math.random().toString(36).substring(2, 15) + "_" + Date.now();
      setSessionId(newSessionId);
      sentEventTypes.current = new Set();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    if (!formData.customerName.trim()) return "Please enter your full name.";
    if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) return "Enter a valid 10-digit Indian mobile number.";
    if (!formData.state.trim()) return "Please select your state.";
    if (!formData.city.trim()) return "Please enter your city.";
    if (!/^\d{6}$/.test(formData.pincode)) return "Pincode must be exactly 6 digits.";
    if (!depot) return "Please pick the RTC bus depot where you'll collect the carton.";
    if (formData.rtcLandmark.trim().length < 3) return "Please add a short landmark or contact note for the depot.";
    if (items.length === 0) return "Your cart is empty.";
    if (totalWeight < 10) return `Minimum order requirement is 10 kg. Your cart has only ${totalWeight} kg.`;
    return null;
  };

  const handleCreateOrder = async () => {
    const issue = validateShipping();
    if (issue) {
      setError(issue);
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        rtcDepotCode: depot!.code,
        items: items.map((i) => ({
          variety: i.name as any,
          weightKg: i.weight,
          quantity: i.quantity,
        })),
      };
      const response = await submitOrder(payload);
      if (response.success) {
        setPayment(response);
        setStep(2);

        // Record PAYMENT_INTENT (Hot Lead)
        if (!sentEventTypes.current.has("PAYMENT_INTENT") && !sentEventTypes.current.has("PAYMENT_SUBMITTED")) {
          sentEventTypes.current.add("PAYMENT_INTENT");
          recordCheckoutEventAction({
            sessionId,
            customerName: formData.customerName,
            phone: formData.phoneNumber,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            rtcDepotCode: depot!.code,
            rtcDepotName: depot!.name,
            rtcLandmark: formData.rtcLandmark,
            customerNotes: formData.customerNotes,
            cartItems: items.map((i) => ({
              variety: i.name,
              weightKg: i.weight,
              quantity: i.quantity,
              price: i.pricePerKg,
            })),
            eventType: "PAYMENT_INTENT",
          }).catch((err) => console.error("Error sending Hot Lead:", err));
        }
      } else {
        setError(response.error);
      }
    } catch {
      setError("Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUtr = async () => {
    if (!payment) return;
    const trimmed = utr.replace(/\s+/g, "");
    if (!/^\d{12}$/.test(trimmed)) {
      setError("UTR must be exactly 12 digits — find it in your UPI app's transaction details.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await submitUtr({
        orderId: payment.orderId,
        phoneNumber: formData.phoneNumber,
        utr: trimmed,
      });
      if (res.success) {
        clearCart();
        setStep(3);

        // Record PAYMENT_SUBMITTED
        if (!sentEventTypes.current.has("PAYMENT_SUBMITTED")) {
          sentEventTypes.current.add("PAYMENT_SUBMITTED");
          recordCheckoutEventAction({
            sessionId,
            customerName: formData.customerName,
            phone: formData.phoneNumber,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            rtcDepotCode: depot!.code,
            rtcDepotName: depot!.name,
            rtcLandmark: formData.rtcLandmark,
            customerNotes: formData.customerNotes,
            cartItems: items.map((i) => ({
              variety: i.name,
              weightKg: i.weight,
              quantity: i.quantity,
              price: i.pricePerKg,
            })),
            eventType: "PAYMENT_SUBMITTED",
            utr: trimmed,
            orderNumber: payment.orderNumber,
            orderId: payment.orderId,
          }).catch((err) => console.error("Error sending Payment Submitted:", err));
        }
      } else {
        setError(res.error || "Could not record UTR.");
      }
    } catch {
      setError("Could not submit UTR. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copy = async (text: string, key: "vpa" | "amount") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  };

  const totalForDisplay = payment ? payment.totalAmount : serverTotal;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center md:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={isSubmitting ? undefined : handleClose} />

      <div className="relative bg-brand-cream w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-4xl md:rounded-3xl shadow-2xl overflow-hidden border-0 md:border md:border-white/20 animate-in zoom-in duration-300 flex flex-col md:flex-row">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-black/10 rounded-full transition-colors z-[210] disabled:opacity-30 cursor-pointer text-brand-cream md:text-brand-primary-green"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress Sidebar - Desktop only */}
        <div className="hidden md:flex bg-brand-primary-green p-8 md:w-80 shrink-0 text-brand-cream flex-col justify-between">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-10">Checkout</h2>
            <div className="space-y-8 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-brand-cream/20" />
              {[
                { s: 1, label: "Shipping Info", icon: Truck },
                { s: 2, label: "Pay via UPI", icon: CreditCard },
                { s: 3, label: "Confirmation", icon: CheckCircle2 },
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
          </div>

          <div className="mt-12 pt-8 border-t border-brand-cream/10">
            <p className="text-xs uppercase tracking-widest font-bold opacity-40 mb-2">Total Amount</p>
            <p className="text-3xl font-bold font-[family-name:var(--font-playfair)] tabular-nums">
              ₹{totalForDisplay.toLocaleString("en-IN")}
            </p>
            {payment && (
              <p className="text-xs opacity-60 mt-3 font-mono">{payment.orderNumber}</p>
            )}
          </div>
        </div>

        {/* Progress Topbar - Mobile only */}
        <div className="flex md:hidden bg-brand-primary-green px-5 py-4 text-brand-cream justify-between items-center shrink-0 border-b border-brand-cream/10 pr-14 z-50">
          <div className="flex items-center space-x-3">
            <div className="text-sm font-bold font-[family-name:var(--font-playfair)]">
              {step === 1 && "Shipping Info"}
              {step === 2 && "Pay via UPI"}
              {step === 3 && "Confirmation"}
            </div>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    step === s
                      ? "bg-brand-cream w-4"
                      : step > s
                      ? "bg-brand-cream"
                      : "bg-brand-cream/35"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase opacity-60 block leading-none font-bold tracking-wider">Total</span>
            <span className="text-base font-bold font-[family-name:var(--font-playfair)]">
              ₹{totalForDisplay.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-12 overflow-y-auto h-full max-h-[calc(100dvh-64px)] md:max-h-[90vh] custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-2xl flex items-start space-x-3 text-sm animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <h3 className="text-2xl font-bold text-brand-primary-green">Shipping Details</h3>
                  <p className="text-xs text-brand-primary-green/60 mt-1">
                    We deliver to the RTC Cargo / bus stand nearest you — drop us the exact landmark.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name *" className="md:col-span-2">
                    <div className="inp-container">
                      <User className="inp-icon" />
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        onBlur={triggerWarmLead}
                        placeholder="Your complete name"
                        className="inp inp-with-icon"
                      />
                    </div>
                  </Field>
                  <Field label="Phone Number *">
                    <div className="inp-container">
                      <Smartphone className="inp-icon" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        onBlur={triggerWarmLead}
                        placeholder="10-digit mobile (e.g. 9876543210)"
                        maxLength={10}
                        inputMode="numeric"
                        className="inp inp-with-icon"
                      />
                    </div>
                  </Field>
                  <Field label="Pincode *">
                    <div className="inp-container">
                      <MapPin className="inp-icon" />
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        placeholder="6 digit code"
                        maxLength={6}
                        inputMode="numeric"
                        className="inp inp-with-icon"
                      />
                    </div>
                  </Field>
                  <Field label="City / Town *">
                    <div className="inp-container">
                      <Building2 className="inp-icon" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Vijayawada"
                        className="inp inp-with-icon"
                      />
                    </div>
                  </Field>
                  <Field label="State *">
                    <div className="inp-container">
                      <Globe className="inp-icon" />
                      <select name="state" value={formData.state} onChange={handleChange} className="inp inp-with-icon">
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <Field label="Nearest RTC Bus Depot *" className="md:col-span-2">
                    <DepotSelect
                      value={depot?.code ?? null}
                      onChange={(_code, picked) => setDepot(picked)}
                      preferredState={formData.state}
                    />
                    {depot && depot.code !== "other" && (
                      <p className="mt-1.5 text-[11px] text-brand-primary-green/60">
                        Carton dispatched to <b>{depot.name}</b>{depot.landmark ? ` (${depot.landmark})` : ""}. You'll
                        collect it from this counter.
                      </p>
                    )}
                  </Field>
                  <Field label="Pickup Landmark / Contact Note *" className="md:col-span-2">
                    <div className="inp-container">
                      <MapPin className="inp-icon text-brand-orange" />
                      <input
                        type="text"
                        name="rtcLandmark"
                        value={formData.rtcLandmark}
                        onChange={handleChange}
                        placeholder="e.g. Cargo counter near Platform 6, will collect by 7pm"
                        className="inp inp-with-icon"
                      />
                    </div>
                  </Field>
                  <Field label="Order Notes (optional)" className="md:col-span-2">
                    <div className="inp-container">
                      <MessageSquare className="textarea-icon" />
                      <textarea
                        name="customerNotes"
                        value={formData.customerNotes}
                        onChange={handleChange}
                        placeholder="Gift pack? Call before dispatch? Tell us here…"
                        rows={2}
                        className="inp inp-with-icon pt-3"
                      />
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && payment && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-brand-primary-green/5 rounded-2xl p-5 border border-brand-primary-green/10 flex items-start space-x-4 animate-in fade-in duration-300">
                  <div className="p-3 bg-brand-primary-green/10 rounded-xl text-brand-primary-green shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-primary-green">Pay via UPI · 0% fees</h3>
                    <p className="text-xs text-brand-primary-green/70 mt-1">
                      Order <span className="font-mono font-bold text-brand-primary-green">{payment.orderNumber}</span> · pay
                      <span className="font-bold text-brand-primary-green"> ₹{payment.totalAmount.toLocaleString("en-IN")}</span> to{" "}
                      <span className="font-mono font-bold text-brand-primary-green">{payment.upiPayeeName}</span>.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Mobile / link */}
                  <div className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                    isMobile
                      ? "bg-brand-primary-green text-brand-cream border-brand-primary-green shadow-lg"
                      : "bg-white border-brand-primary-green/10"
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-5 h-5" />
                          <h4 className="font-bold uppercase tracking-wider text-xs">On your phone</h4>
                        </div>
                        {isMobile && (
                          <span className="text-[9px] uppercase tracking-widest font-bold bg-brand-cream text-brand-primary-green px-2 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mb-6 leading-relaxed ${isMobile ? "opacity-80" : "text-brand-primary-green/70"}`}>
                        Tap below to open Google Pay, PhonePe, Paytm, or any banking app with the amount pre-filled.
                      </p>
                    </div>
                    <div>
                      <a
                        href={isMobile ? payment.upiLink : undefined}
                        onClick={(e) => {
                          if (!isMobile) {
                            e.preventDefault();
                            setError("UPI deep links can only be opened on mobile devices. Please scan the QR code or copy the UPI ID on the right to complete the payment.");
                          }
                        }}
                        className={`block text-center w-full py-3.5 rounded-xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer shadow-md ${
                          isMobile
                            ? "bg-brand-cream text-brand-primary-green hover:bg-white"
                            : "bg-brand-primary-green text-brand-cream hover:bg-brand-primary-green/90"
                        }`}
                      >
                        Pay ₹{payment.totalAmount.toLocaleString("en-IN")} via UPI
                      </a>
                      <p className={`text-[10px] mt-3 leading-tight ${isMobile ? "opacity-60" : "text-brand-primary-green/50"}`}>
                        If nothing opens, scan the QR code or copy the UPI ID on the right.
                      </p>
                    </div>
                  </div>

                  {/* Desktop / QR */}
                  <div className="rounded-2xl p-5 border bg-white border-brand-primary-green/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3 text-brand-primary-green">
                        <div className="flex items-center space-x-2">
                          <QrCode className="w-5 h-5" />
                          <h4 className="font-bold uppercase tracking-wider text-xs">Scan to pay</h4>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                          Amount pre-filled
                        </span>
                      </div>
                      <div className="flex flex-col items-center bg-brand-cream/20 rounded-xl p-4 mb-4 border border-brand-primary-green/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={payment.qrImage}
                          alt={`Scan to pay ₹${payment.totalAmount.toFixed(2)} to ${payment.upiPayeeName}`}
                          className="w-36 h-36 object-contain mix-blend-multiply"
                        />
                        <p className="text-[10px] text-brand-primary-green/60 mt-2 text-center leading-tight">
                          Scan with any UPI app — your phone opens with<br />
                          <b className="text-brand-primary-green">₹{payment.totalAmount.toLocaleString("en-IN")}</b> already filled in.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <CopyRow label="UPI ID" value={payment.upiVpa} onCopy={() => copy(payment.upiVpa, "vpa")} copied={copied === "vpa"} />
                      <CopyRow
                        label="Amount"
                        value={`₹${payment.totalAmount.toFixed(2)}`}
                        onCopy={() => copy(payment.totalAmount.toFixed(2), "amount")}
                        copied={copied === "amount"}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-brand-orange/30 bg-brand-orange/5 p-6 space-y-4 shadow-sm animate-in fade-in duration-500">
                  <div className="flex items-start space-x-3 text-brand-primary-green">
                    <div className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">After paying — enter the 12-digit UTR</h4>
                      <p className="text-xs text-brand-primary-green/70 mt-1 leading-relaxed">
                        Open the payment details in your UPI app and copy the <b>UPI Reference No.</b> (also
                        called Transaction ID or UTR). It is always exactly 12 digits.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      placeholder="e.g. 412345678901"
                      maxLength={12}
                      inputMode="numeric"
                      className="inp utr-input font-mono text-center tracking-[0.25em]"
                    />
                  </div>
                  <p className="text-[10px] text-brand-primary-green/50 text-center">
                    Submitting this marks your order as <b>PENDING VERIFICATION</b>. The farm verifies in their bank app
                    and then dispatches.
                  </p>
                </div>

                <details className="text-xs text-brand-primary-green/70">
                  <summary className="cursor-pointer font-semibold">Order summary</summary>
                  <div className="mt-2 space-y-1">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.weight}`} className="flex justify-between">
                        <span>{item.name} ({item.weight}kg × {item.quantity})</span>
                        <span className="font-semibold">₹{item.totalPrice.toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}

            {step === 3 && payment && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 py-6">
                <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-brand-primary-green">Payment Recorded!</h3>
                  <p className="text-brand-primary-green/60 mt-2">
                    UTR submitted. The farm will verify the deposit in their bank app and dispatch within 24–48 hours.
                  </p>
                </div>
                <div className="bg-white/50 border border-dashed border-[#1B330F]/20 rounded-2xl p-6 w-full max-w-sm space-y-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-brand-primary-green/40">Order #</p>
                    <p className="font-mono font-bold text-brand-primary-green">{payment.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest font-bold text-brand-primary-green/40">Track at</p>
                    <a href={`/track?phone=${formData.phoneNumber}`} className="font-bold text-brand-primary-green underline">
                      /track
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex justify-end gap-3">
              {step === 1 && (
                <button
                  onClick={handleCreateOrder}
                  disabled={isSubmitting || items.length === 0}
                  className="btn-primary"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><span>Next: Payment</span><ArrowRight className="w-5 h-5" /></>)}
                </button>
              )}
              {step === 2 && (
                <button
                  onClick={handleSubmitUtr}
                  disabled={isSubmitting || utr.length !== 12}
                  className="btn-primary"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><span>Submit UTR</span><ArrowRight className="w-5 h-5" /></>)}
                </button>
              )}
              {step === 3 && (
                <button onClick={handleClose} className="btn-primary">
                  <span>Back to Home</span><ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
        :global(.inp) {
          width: 100%;
          background: white;
          border: 1px solid rgba(27, 51, 15, 0.1);
          border-radius: 0.75rem;
          padding: 1rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        :global(.inp:focus) {
          border-color: rgba(46, 77, 37, 0.4);
          box-shadow: 0 0 0 4px rgba(46, 77, 37, 0.1);
        }
        :global(.inp-container) {
          position: relative;
        }
        :global(.inp-icon) {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(46, 77, 37, 0.4);
          width: 1.125rem;
          height: 1.125rem;
          pointer-events: none;
          transition: color 0.2s;
        }
        :global(.inp-container:focus-within .inp-icon) {
          color: #2E4D25;
        }
        :global(.textarea-icon) {
          position: absolute;
          left: 1rem;
          top: 1rem;
          color: rgba(46, 77, 37, 0.4);
          width: 1.125rem;
          height: 1.125rem;
          pointer-events: none;
          transition: color 0.2s;
        }
        :global(.inp-container:focus-within .textarea-icon) {
          color: #2E4D25;
        }
        :global(.inp-with-icon) {
          padding-left: 2.75rem !important;
        }
        :global(.utr-input) {
          letter-spacing: 0.25em;
          font-size: 1.125rem;
          font-weight: 700;
          text-align: center;
          border-color: rgba(222, 138, 36, 0.3) !important;
        }
        :global(.utr-input:focus) {
          border-color: rgba(222, 138, 36, 0.8) !important;
          box-shadow: 0 0 0 4px rgba(222, 138, 36, 0.15) !important;
        }
        :global(.btn-primary) {
          background: #1b330f;
          color: #fdf6e3;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease-out;
        }
        :global(.btn-primary:hover:not(:disabled)) {
          background: #2e4d25;
          box-shadow: 0 10px 25px rgba(46, 77, 37, 0.2);
          transform: translateY(-1px);
        }
        :global(.btn-primary:active:not(:disabled)) {
          transform: translateY(0);
        }
        :global(.btn-primary:disabled) {
          opacity: 0.5;
          cursor: not-allowed;
        }
        :global(.custom-scrollbar::-webkit-scrollbar) {
          width: 6px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-track) {
          background: transparent;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
          background: rgba(46, 77, 37, 0.15);
          border-radius: 9999px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
          background: rgba(46, 77, 37, 0.3);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-brand-primary-green/60 uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function CopyRow({ label, value, onCopy, copied }: { label: string; value: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="flex items-center justify-between bg-brand-cream/40 rounded-xl px-4 py-2.5 border border-brand-primary-green/5 hover:bg-brand-cream/60 transition-colors">
      <div>
        <p className="text-[9px] uppercase font-bold tracking-wider text-brand-primary-green/40">{label}</p>
        <p className="font-mono font-bold text-brand-primary-green text-sm">{value}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center gap-1.5 text-xs font-bold text-brand-primary-green hover:text-brand-orange transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
