"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Minus, Plus, Trash2, Tag, Lock } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DELIVERY = 12.99;

export default function Cart() {
  useScrollToTop();
  const router = useRouter();

  const { items, updateQty, removeItem, setActiveProduct } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim()) setPromoApplied(true);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  const total = subtotal + DELIVERY - discount;
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-[#fcfcfb]">
      <div className="max-w-300 mx-auto px-5 md:px-10 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-main text-3xl md:text-4xl font-bold tracking-tight text-[#121212]">
            Cart
          </h1>
          {itemCount > 0 && (
            <p className="text-sm text-black/40 mt-1">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-main text-2xl font-bold text-[#121212] mb-2">
              Your bag is empty
            </p>
            <p className="text-sm text-black/45 mb-6">
              Add some items to get started
            </p>
            <a
              href="/shop/browse"
              className="bg-[#121212] text-white px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#2a2a2a] transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
            {/*  Cart Items  */}
            <div className="bg-white border border-black/6">
              <AnimatePresence initial={false}>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={`flex max-[400px]:grid max-[400px]:grid-cols-[2fr_3fr] gap-4 p-5 md:p-6 ${
                      index < items.length - 1 ? "border-b border-black/6" : ""
                    }`}
                  >
                    {/* Product Image */}
                    <Link
                      href={`/shop/product/${item.productId}`}
                      onClick={() => setActiveProduct(item.productId)}
                      className="shrink-0 w-25 md:w-30 aspect-3/4 overflow-hidden bg-[#eae8e3] block"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex flex-1 min-w-0 flex-col justify-between">
                      {/* Top row: name + price */}

                      <div className="min-w-0">
                        <div className="flex min-w-full">
                          <Link
                            href={`/shop/product/${item.productId}`}
                            onClick={() => setActiveProduct(item.productId)}
                            className="flex-1 font-semibold text-[#121212] text-sm md:text-base hover:underline underline-offset-2 line-clamp-2 block"
                          >
                            {item.name}
                          </Link>
                          <span className="font-bold text-sm md:text-base text-[#121212] shrink-0 tabular-nums">
                            ${(item.price * item.qty).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1.5 md:mt-4 space-y-1.5 md:space-y-2.5">
                          <p className="text-xs text-black/60">
                            Variant: {item.variant}
                          </p>
                          <p className="text-xs text-black/60">
                            Size: {item.size || "Default"}
                          </p>
                          <p className="text-xs text-black/60">
                            Color: {item.color}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row: actions + qty */}
                      <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
                        {/* Delete Action */}
                        <div className="flex items-center">
                          <button
                            type="button"
                            aria-label={`Remove ${item.name} from cart`}
                            onClick={() => removeItem(item.id)}
                            className="flex items-center justify-center text-black/40 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} strokeWidth={1.75} />
                          </button>
                        </div>

                        {/* Qty Controls */}
                        <div className="flex items-center gap-3 border border-black/15 px-1">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.id, -1)}
                            className="flex items-center justify-center w-7 h-9 text-black/50 hover:text-black transition-colors cursor-pointer"
                          >
                            <Minus size={14} strokeWidth={2} />
                          </button>
                          <span className="text-sm font-semibold text-[#121212] min-w-4 text-center tabular-nums select-none">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.id, 1)}
                            className="flex items-center justify-center w-7 h-9 text-black/50 hover:text-black transition-colors cursor-pointer"
                          >
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/*  Order Summary  */}
            <div className="lg:sticky lg:top-19">
              <div className="bg-white border border-black/6 p-6">
                <h2 className="font-main text-xl md:text-2xl font-bold tracking-tight text-[#121212] mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Subtotal</span>
                    <span className="font-semibold text-[#121212] tabular-nums">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Delivery</span>
                    <span className="font-semibold text-[#121212] tabular-nums">
                      ${DELIVERY.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Discount</span>
                    <span
                      className={`font-semibold tabular-nums ${promoApplied ? "text-green-600" : "text-black/30"}`}
                    >
                      {promoApplied ? `-$${discount.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="h-px bg-black/8 mb-5" />

                <div className="flex items-center justify-between mb-6">
                  <span className="text-base font-bold text-[#121212]">
                    Total
                  </span>
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-base font-bold text-[#121212] tabular-nums"
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </div>

                {/* Authenticated user indicator or guest reminder */}
                {isAuthenticated && user && (
                  <div className="mb-4 p-2.5 bg-black/3 border border-black/1 rounded-sm flex items-center gap-2 text-xs text-black/70">
                    <span className="truncate">
                      Signed in as{" "}
                      <strong className="text-[#121212]">{user.name}</strong>
                    </span>
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  type="button"
                  id="checkout-btn"
                  onClick={handleCheckout}
                  className="w-full bg-[#121212] text-white py-4 font-bold text-sm tracking-widest uppercase hover:bg-[#2a2a2a] active:scale-99 transition-all cursor-pointer mb-4 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Lock size={15} />
                  <span>
                    {isAuthenticated
                      ? "Proceed to Checkout"
                      : "Checkout · Sign In"}
                  </span>
                </button>

                {/* Promo Code */}
                {!promoApplied ? (
                  <div>
                    {!promoOpen ? (
                      <button
                        type="button"
                        onClick={() => setPromoOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-black/50 underline underline-offset-2 hover:text-black transition-colors cursor-pointer"
                      >
                        <Tag size={13} />
                        Use a promo code
                      </button>
                    ) : (
                      <AnimatePresence>
                        <motion.form
                          key="promo-form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          onSubmit={applyPromo}
                          className="flex gap-2 overflow-hidden"
                        >
                          <input
                            autoFocus
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            placeholder="Enter code"
                            className="flex-1 border border-black/15 px-3 py-2 text-sm text-[#121212] placeholder-black/30 outline-none focus:border-[#121212] transition-colors bg-transparent"
                          />
                          <button
                            type="submit"
                            className="bg-[#121212] text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors cursor-pointer shrink-0"
                          >
                            Apply
                          </button>
                        </motion.form>
                      </AnimatePresence>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Tag size={12} /> Promo applied (10% off)
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoApplied(false);
                        setPromoCode("");
                      }}
                      className="text-black/40 underline hover:text-black transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Continue shopping */}
              <a
                href="/"
                className="block text-center text-xs text-black/40 hover:text-black transition-colors mt-4 underline underline-offset-2"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
