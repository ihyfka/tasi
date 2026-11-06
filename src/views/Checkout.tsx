"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Loader2,
  CreditCard,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useScrollToTop } from "../hooks/useScrollToTop";

const DELIVERY_FEE = 12.99;

export default function Checkout() {
  const router = useRouter();

  const { items, clearCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string>("");

  useScrollToTop([orderComplete]);

  // Shipping Form State (preloaded with default demo client details from auth)
  const [shipping, setShipping] = useState({
    firstName: user?.name ? user.name.split(" ")[0] : "Moses",
    lastName: user?.name
      ? user.name.split(" ").slice(1).join(" ") || ""
      : "Obinna",
    email: user?.email || "client@tasi.com",
    street: "Str. 13",
    apartment: "House 10",
    city: "AMAC",
    state: "FCT",
    postalCode: "0000",
    country: "Nigeria",
    phone: "+",
  });

  // Payment Form State
  const [payment, setPayment] = useState({
    cardNumber: "•••• •••• •••• 4242",
    expiry: "12/28",
    cvc: "555",
    nameOnCard: user?.name || "Moses Obinna",
  });

  // Keep shipping name and email synced if user logs in
  useEffect(() => {
    if (user) {
      const parts = user.name.split(" ");
      setShipping((prev) => ({
        ...prev,
        firstName: parts[0] || prev.firstName,
        lastName: parts.slice(1).join(" ") || prev.lastName,
        email: user.email || prev.email,
      }));
      setPayment((prev) => ({
        ...prev,
        nameOnCard: user.name || prev.nameOnCard,
      }));
    }
  }, [user]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + (items.length > 0 ? DELIVERY_FEE : 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Realistic order processing latency
    await new Promise((res) => setTimeout(res, 1200));

    const generatedId = `TS-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setOrderComplete(true);
    setIsSubmitting(false);
    clearCart();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  //  Render: Order Confirmation Success State
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#FCFCFB] py-16 px-5 sm:px-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl mx-auto bg-white/50 rounded-xsp-8 sm:p-12 text-center shadow-sm"
        >
          <div className="w-16 h-16 bg-[#121212] text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageCheck size={32} />
          </div>

          <p className="text-[11px] tracking-widest uppercase text-black/50 mb-1">
            Order Confirmed
          </p>
          <h1 className="font-main text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#121212]">
            Thank You For Your Order
          </h1>

          <div className="my-6 p-4 bg-black/3 border border-black/10 inline-block text-left w-full">
            <div className="flex justify-between items-center text-xs pb-2">
              <span className="text-black/50">Order Reference:</span>
              <span className=" font-bold text-[#121212]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-black/50">Recipient:</span>
              <span className="font-medium text-[#121212]">
                {shipping.email}
              </span>
            </div>
          </div>

          <p className="text-xs text-black/60 leading-relaxed max-w-md mx-auto mb-8">
            A confirmation receipt has been sent to{" "}
            <strong className="text-black/80">{shipping.email}</strong>. Your
            pieces will be dispatched within 24 hours.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => router.push("/collections/latest")}
              className="w-full bg-[#121212] text-white py-4 font-bold text-xs tracking-widest uppercase hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full py-3.5 border border-black/20 text-[#121212] text-xs font-bold tracking-widest uppercase hover:bg-black/3 transition-colors cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  //  Render: Empty Cart State
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fcfcfb] flex flex-col items-center justify-center px-5 py-20 text-center">
        <h2 className="font-main text-3xl font-bold uppercase tracking-tight text-[#121212] mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-sm text-black/55 mb-6 max-w-sm">
          Please add items to your cart before proceeding through checkout.
        </p>
        <button
          type="button"
          onClick={() => router.push("/shop/browse")}
          className="bg-[#121212] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors cursor-pointer"
        >
          Add Items
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] py-8 sm:py-12">
      <div className="max-w-310 mx-auto px-5 sm:px-8 lg:px-12">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between pb-8 border-b border-black/8 mb-8">
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </button>
        </div>

        {/* User Account Status Banner */}
        <div className="mb-8 p-4 bg-white/50 rounded-xs shadow-[0_0_1px_1px_black]/3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black/3 text-[#121212] flex items-center justify-center shrink-0">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-4"
              >
                <path
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                {isAuthenticated
                  ? `Logged in as ${user?.name || "Client"}`
                  : "Express Checkout"}
              </p>
              <p className="text-[11px] text-black/55">
                {isAuthenticated
                  ? user?.email
                  : `Default client profile: ${shipping.email}`}
              </p>
            </div>
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
              }}
              className="text-[11px] font-bold uppercase tracking-wider text-black/50 hover:text-black underline cursor-pointer"
            >
              Sign Out/Switch
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login?redirect=checkout")}
              className="text-[11px] font-bold uppercase tracking-wider text-black/70 hover:text-black underline cursor-pointer"
            >
              Have an account? Sign in
            </button>
          )}
        </div>

        {/* Main Grid: Form Left, Order Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-start">
          {/*  Left Column: Checkout Form  */}
          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Step 1: Shipping Address */}
            <div className="bg-white/50 rounded-xs shadow-[0_0_1px_1px_black]/5 p-6 sm:p-8">
              <h2 className="font-main text-xl font-bold uppercase tracking-tight text-[#121212] mb-6 flex items-center gap-2">
                <Truck size={20} className="text-[#121212]" />
                1. Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="shipping-first-name"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-first-name"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={shipping.firstName}
                    onChange={(e) =>
                      setShipping({ ...shipping, firstName: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-last-name"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-last-name"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={shipping.lastName}
                    onChange={(e) =>
                      setShipping({ ...shipping, lastName: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="shipping-address"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-address"
                    name="address"
                    type="text"
                    required
                    autoComplete="shipping street-address"
                    value={shipping.street}
                    onChange={(e) =>
                      setShipping({ ...shipping, street: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-city"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-city"
                    name="city"
                    type="text"
                    required
                    autoComplete="shipping address-level2"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({ ...shipping, city: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-postal"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Postal/Zip Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-postal"
                    name="postalCode"
                    type="text"
                    required
                    autoComplete="shipping postal-code"
                    value={shipping.postalCode}
                    onChange={(e) =>
                      setShipping({ ...shipping, postalCode: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-country"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="shipping-country"
                    name="country"
                    value={shipping.country}
                    onChange={(e) =>
                      setShipping({ ...shipping, country: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black bg-white"
                  >
                    <option value="Nigeria">Nigeria</option>

                    <option value="Ghana">Ghana</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>

                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="shipping-phone"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Phone (for courier updates){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="shipping-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping({ ...shipping, phone: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment */}
            <div className="bg-white/50 rounded-xs shadow-[0_0_1px_1px_black]/5 p-6 sm:p-8">
              <h2 className="font-main text-xl font-bold uppercase tracking-tight text-[#121212] mb-6 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard size={20} className="text-[#121212]" />
                  2. Payment Method
                </span>
              </h2>

              <div className="p-4 bg-black/5 border border-black/10 mb-5 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#121212]">
                  Credit/Debit Card
                </span>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 text-[#121212]/70">
                    <CreditCard size={22} strokeLinejoin="miter" />
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="card-number"
                    className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                  >
                    Card Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="card-number"
                    type="text"
                    required
                    value={payment.cardNumber}
                    onChange={(e) =>
                      setPayment({ ...payment, cardNumber: e.target.value })
                    }
                    className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                    >
                      Expires (MM/YY) <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="card-expiry"
                      type="text"
                      required
                      value={payment.expiry}
                      onChange={(e) =>
                        setPayment({ ...payment, expiry: e.target.value })
                      }
                      className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212]  focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-cvc"
                      className="block text-[10px] font-bold uppercase tracking-wider text-black/70 mb-1"
                    >
                      CVC/Security Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="card-cvc"
                      type="text"
                      required
                      value={payment.cvc}
                      onChange={(e) =>
                        setPayment({ ...payment, cvc: e.target.value })
                      }
                      className="w-full border border-black/15 px-3.5 py-2.5 text-sm text-[#121212]  focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#121212] text-white py-4.5 font-bold text-xs tracking-widest uppercase hover:bg-[#2a2a2a] active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>
                {isSubmitting
                  ? "Authorizing Order..."
                  : `Complete Purchase · $${total.toFixed(2)}`}
              </span>
            </button>
          </form>

          {/* order summary */}
          <div className="lg:sticky lg:top-24 bg-white shadow-xl p-6 sm:p-7 space-y-6">
            <h3 className="font-main text-lg font-bold uppercase tracking-tight text-[#121212] border-b border-black/8 pb-4">
              Order Summary ({items.reduce((acc, i) => acc + i.qty, 0)} items)
            </h3>

            {/* Item list */}
            <div className="space-y-4 max-h-85 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-left">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover bg-[#eae8e3] shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-sm font-semibold text-[#121212] truncate">
                      {item.name}
                    </p>
                    <p className="text-black/50 mt-0.5">
                      {item.variant} · Size {item.size || "Default"} ·{" "}
                      {item.color}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-black/50">Qty: {item.qty}</span>
                      <span className="font-bold text-[#121212]">
                        ${(item.price * item.qty).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing details */}
            <div className="border-t border-black/8 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-black/60">
                <span>Subtotal</span>
                <span className="font-medium text-[#121212]">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Express Shipping</span>
                <span className="font-medium text-[#121212]">
                  ${DELIVERY_FEE.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#121212] border-t border-black/8 pt-3">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Guarantee info */}
            <div className="pt-4 border-t border-black/8 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-black/60">
                <ShieldCheck size={14} className="text-black/70" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-black/60">
                <CheckCircle2 size={14} className="text-black/70" />
                <span>Complimentary Shipping</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
