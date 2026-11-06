"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

import logo from "../assets/media/tasi_logo.svg";

const FOOTER_CATEGORY = [
  {
    header: "Shop",
    links: [
      { label: "Women", url: "/shop/browse/women" },
      { label: "Men", url: "/shop/browse/men" },
      { label: "Accessories", url: "/shop/browse/accessories" },
    ],
  },
  {
    header: "Brand",
    links: [
      { label: "About Us", url: "#" },
      { label: "Terms", url: "/terms" },
      { label: "Privacy Policy", url: "/privacy" },
    ],
  },
  {
    header: "Support",
    links: [
      { label: "FAQ", url: "#" },
      { label: "Shipping & Returns", url: "#" },
      { label: "Contact Us", url: "https://obinna.pxxl.run" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("tasi_newsletter_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setIsSubscribed(true);
    }
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    localStorage.setItem("tasi_newsletter_email", email);
    setIsSubscribed(true);

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleClear = () => {
    localStorage.removeItem("tasi_newsletter_email");
    setEmail("");
    setIsSubscribed(false);
  };

  return (
    <footer className="relative bg-black text-white pt-20 overflow-hidden">
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 font-bold text-sm shadow-xl transition-all duration-300 z-50 ${
          showToast
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        Welcome to the club.
      </div>

      <div className="max-w-400 mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
          <div className="md:col-span-5 flex flex-col">
            <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-6 md:max-w-xl leading-[1.25]">
              Join our newsletter to stay up to date on the latest drops and
              collections.
            </h3>

            {isSubscribed ? (
              <div className="flex items-center justify-between bg-[#1a1a1a] p-4 mb-4 rounded-sm border border-white/5">
                <span className="text-sm font-medium text-white/70 px-2 truncate">
                  Subscribed as {email}
                </span>
                <button
                  onClick={handleClear}
                  className="text-[10px] font-bold uppercase tracking-wide text-white/40 hover:text-white/60 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="relative flex items-center bg-white px-2 py-1.5 mb-4 max-w-175"
              >
                <input
                  name="subscription list"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-black placeholder:text-black/50 px-3 outline-none text-sm font-medium"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center justify-center bg-black text-white p-[5px_8px_8px_10px] sm:p-[12px_32px] text-sm font-bold tracking-wide hover:bg-neutral-800 transition-colors shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-5 rotate-315 sm:hidden"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="miter"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>

                  <span className="max-sm:hidden">Subscribe</span>
                </button>
              </form>
            )}

            <p className="text-sm text-white/40 font-medium mb-5 max-w-sm">
              By subscribing, you agree to our{" "}
              <a href="/privacy" className="underline hover:cursor-pointer">
                Privacy Policy
              </a>{" "}
              and consent to receive updates from us.
            </p>

            <div className="flex items-center gap-2 text-white/50 text-sm font-medium">
              by
              <a
                href="https://obinna.pxxl.run"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center hover:underline text-white transition-all"
              >
                ihyfka
              </a>
            </div>
          </div>

          <div className="md:col-span-6 lg:col-start-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            {FOOTER_CATEGORY.map((cat) => (
              <div key={cat.header} className="flex flex-col">
                <h4 className="text-base font-bold text-white mb-6">
                  {cat.header}
                </h4>
                {cat.links.map((p) => (
                  <ul
                    key={p.label}
                    className="text-sm font-medium text-white/60"
                  >
                    <li className="mb-4">
                      <a
                        href={p.url}
                        className="hover:text-white transition-colors"
                      >
                        {p.label}
                      </a>
                    </li>
                  </ul>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-red-600/0 w-full relative overflow-hidden flex justify-center items-center min-h-40 sm:h-50 md:h-95 lg:h-100">
        <Image
          src={logo}
          alt="Tasi"
          className="w-screen max-w-4xl select-none pointer-events-none mb-4 md:mb-6"
        />
      </div>
    </footer>
  );
}
