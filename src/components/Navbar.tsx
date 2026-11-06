"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Handbag,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import { searchLiveProducts } from "@/utils/productService";

import logo from "@/assets/media/tasi_dark_logo.svg";

const NAV_LINKS = [
  {
    label: "Men",
    href: "/shop/browse/men",
    subLinks: [
      { label: "Clothing", href: "/shop/browse/men?category=Tops" },
      { label: "Shoes", href: "/shop/browse/men?category=Shoes" },
      { label: "Accessories", href: "/shop/browse/men?category=Accessories" },
    ],
  },
  {
    label: "Women",
    href: "/shop/browse/women",
    subLinks: [
      { label: "Clothing", href: "/shop/browse/women?category=Dresses" },
      { label: "Shoes", href: "/shop/browse/women?category=Shoes" },
      { label: "Accessories", href: "/shop/browse/women?category=Accessories" },
    ],
  },
  {
    label: "Accessories",
    href: "/shop/browse/accessories",
    subLinks: [],
  },

  {
    label: "Collections",
    href: "/collections/latest",
    subLinks: [],
  },
];

function NavIcon({
  children,
  label,
  href,
  onClick,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cls =
    "relative flex items-center justify-center sm:size-9 text-[#121212]/70 hover:text-[#121212] transition-colors duration-200 cursor-pointer";
  const content = (
    <>
      {children}
      {mounted && badge != null && badge > 0 && (
        <span className="absolute top-0 right-0 min-w-4 h-4 px-0.5 flex items-center justify-center bg-[#121212] text-white text-[9px] font-bold rounded-full leading-none">
          {badge}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} aria-label={label} className={cls}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cls}>
      {content}
    </button>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const { totalQty, setActiveProduct } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    if (accountMenuOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [accountMenuOpen]);

  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ["navbar-live-search", debouncedQuery],
    queryFn: () => searchLiveProducts(debouncedQuery),
    enabled: Boolean(debouncedQuery.length > 0 && searchOpen),
    staleTime: 1000 * 60 * 3,
  });

  const matchingProducts = searchResult?.products || [];

  return (
    <>
      <nav
        id="navbar"
        className="sticky top-0 z-50 bg-[#fcfcfb] border-b border-black/5"
      >
        <div className="hidden md:flex items-center h-18 px-8 lg:px-14 gap-6">
          <a
            href="/"
            aria-label="Home"
            className="shrink-0 flex items-center h-full mr-8"
          >
            <img
              src={logo.src}
              alt="Tasi"
              className="h-5 w-auto object-contain"
            />
          </a>

          <ul className="flex items-center gap-1 flex-1 whitespace-nowrap overflow-hidden">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="shrink-0 group relative">
                <a
                  href={link.href}
                  className="relative px-3 lg:px-4 text-sm font-medium text-[#121212]/60 hover:text-[#121212] transition-colors duration-200 group whitespace-nowrap inline-block"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-3 lg:left-4 right-3 lg:right-4 h-px bg-[#121212] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
                </a>

                {link.subLinks && link.subLinks.length > 0 && (
                  <div className="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
                    <div className="bg-white border border-black/10 shadow-lg min-w-35 py-1">
                      {link.subLinks.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          className="block px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#121212]/60 hover:text-[#121212] hover:bg-[#fcfcfb] transition-colors whitespace-nowrap"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3.5 shrink-0">
            <NavIcon
              label={searchOpen ? "Close search" : "Search"}
              onClick={() => {
                setSearchOpen((p) => !p);
                if (searchOpen) setSearchQuery("");
              }}
            >
              {searchOpen ? (
                <X size={22} strokeWidth={1.75} className="text-[#121212]" />
              ) : (
                <Search size={22} strokeWidth={1.75} />
              )}
            </NavIcon>

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-label={isAuthenticated ? "Account details" : "Sign in"}
                onClick={() => {
                  if (isAuthenticated) {
                    setAccountMenuOpen((prev) => !prev);
                  } else {
                    router.push("/auth");
                  }
                }}
                className="relative flex items-center justify-center sm:size-9 text-[#121212]/70 hover:text-[#121212] transition-colors duration-200 cursor-pointer"
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.75"
                  stroke="currentColor"
                  className="size-5.75"
                >
                  <path
                    strokeLinejoin="miter"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>

                {isAuthenticated && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />
                )}
                <span className="sr-only">Account</span>
              </button>

              <AnimatePresence>
                {accountMenuOpen && isAuthenticated && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white border border-black/5 shadow-[3px_4px_12px_rgba(0,0,0,0.12)] p-4 z-50 text-left rounded-sm"
                  >
                    <div className="pb-3 border-b space-y-1.5 border-black/8">
                      <p className="text-[10px] tracking-wider uppercase text-black/40">
                        Active
                      </p>
                      <div>
                        <p className="text-sm font-semibold text-[#121212] truncate mt-0.5">
                          {user.name}
                        </p>
                        <p className="text-xs text-black/50 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="py-2 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          router.push("/cart");
                        }}
                        className="w-full text-left py-2 text-xs font-semibold uppercase tracking-wider text-[#121212] hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        Shopping Bag ({totalQty})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          router.push("/checkout");
                        }}
                        className="w-full text-left py-2 text-xs font-semibold uppercase tracking-wider text-[#121212] hover:opacity-70 transition-opacity cursor-pointer"
                      >
                        Express Checkout
                      </button>
                    </div>

                    <div className="pt-2 border-t border-black/8">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="w-full flex items-center gap-2 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <NavIcon label="Cart" href="/cart" badge={totalQty}>
              <Handbag size={23} strokeWidth={1.75} />
            </NavIcon>
          </div>
        </div>

        <div className="flex md:hidden items-center justify-between h-18 px-5">
          <a href="/" aria-label="Tasi" className="flex items-center">
            <img
              src={logo.src}
              alt="Tasi"
              className="h-5 w-auto object-contain"
            />
          </a>

          <div className="flex items-center gap-6.5">
            <NavIcon
              label={searchOpen ? "Close search" : "Search"}
              onClick={() => {
                setSearchOpen((p) => !p);
                if (searchOpen) setSearchQuery("");
              }}
            >
              {searchOpen ? (
                <X strokeWidth={1.75} />
              ) : (
                <Search strokeWidth={1.75} />
              )}
            </NavIcon>
            <NavIcon label="Cart" href="/cart" badge={totalQty}>
              <Handbag strokeWidth={1.75} />
            </NavIcon>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="flex items-center justify-center text-[#121212] cursor-pointer"
            >
              <Menu strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-inherit border-t border-black/5 backdrop-blur-xl px-5 md:px-14 py-3.5 overflow-hidden"
            >
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 bg-white/80 border border-black/12 px-4 py-3.5 shadow-2xl">
                  <Search size={18} className="text-black/80 shrink-0" />
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search products, collections, categories…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setSearchQuery("");
                      }
                    }}
                    className="bg-transparent outline-none text-sm text-[#121212] placeholder-black/40 w-full"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs uppercase font-semibold text-black/60 hover:text-black transition-colors cursor-pointer mr-1"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="text-xs uppercase font-bold tracking-wider text-black/70 hover:text-black transition-colors cursor-pointer pl-3 border-l border-black/20"
                  >
                    Close
                  </button>
                </div>

                {searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2.5 bg-white border border-black/10 shadow-lg divide-y divide-black/5 max-h-72 overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center flex items-center justify-center gap-2 text-xs text-black/50">
                        <div className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce [animation-delay:0.15s]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-black/60 animate-bounce [animation-delay:0.3s]" />
                        <span className="ml-1 tracking-wider uppercase text-[10px]">Searching catalog…</span>
                      </div>
                    ) : matchingProducts.length > 0 ? (
                      <>
                        {searchResult?.relatedNotice && (
                          <div className="px-3 py-2 bg-black/[0.03] border-b border-black/5 text-[11px] font-medium tracking-wide text-black/60 flex items-center justify-between">
                            <span>{searchResult.relatedNotice}</span>
                            <span className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold">Related Match</span>
                          </div>
                        )}
                        {matchingProducts.map((prod) => (
                          <a
                            key={prod.id}
                            href={`/shop/product/${prod.id}`}
                            onClick={() => {
                              setActiveProduct(prod.id);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                            className="flex items-center gap-4 p-3 hover:bg-[#fcfcfb]/60 transition-colors group"
                          >
                            <img
                              src={typeof prod.image === "string" ? prod.image : (prod.image as any)?.src || ""}
                              alt={prod.name}
                              className="w-12 h-12 object-cover bg-[#eae8e3] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#121212] group-hover:underline truncate">
                                {prod.name}
                              </p>
                              <p className="text-xs text-black/40">
                                {prod.category} · {prod.variant}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[#121212] tabular-nums shrink-0">
                              {typeof prod.price === "number" && !isNaN(prod.price) && prod.price > 0
                                ? `$${prod.price.toFixed(2)}`
                                : ""}
                            </span>
                          </a>
                        ))}
                      </>
                    ) : (
                      <div className="p-4 text-center text-xs text-black/40">
                        No products found for "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className={`fixed h-dvh inset-0 z-40 bg-black/25 backdrop-blur-xs cursor-pointer`}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed inset-0 z-100 md:hidden transition-all duration-300 ${
          mobileOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 bottom-0 w-[80vw] max-w-85 bg-[#121212] text-white flex flex-col transition-transform duration-350 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between py-4.5 px-6">
            <img
              src={logo.src}
              alt="Tasi"
              className="h-5 w-auto object-contain brightness-0 invert"
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center text-white/90 transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={1.75} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.label} className="group border-b border-white/6">
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-5 text-white/80 hover:text-white transition-colors"
                  >
                    <span className="font-main text-2xl font-light tracking-tight">
                      {link.label}
                    </span>
                    <ArrowRight
                      size={18}
                      className="opacity-30 group-hover:opacity-80 group-hover:translate-x-1 transition-all duration-200"
                    />
                  </a>
                  {link.subLinks && link.subLinks.length > 0 && (
                    <div className="flex gap-4 pb-4 pl-1">
                      {link.subLinks.map((sub) => (
                        <a
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-5 border-white/10">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-secondary tracking-widest uppercase text-white/40">
                      Signed In As
                    </p>
                    <p className="text-base font-bold text-white mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-xs text-white/50">{user.email}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <a
                      href="/checkout"
                      onClick={() => setMobileOpen(false)}
                      className="text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white py-2"
                    >
                      Express Checkout →
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileOpen(false);
                        router.push("/");
                      }}
                      className="text-left text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 py-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <a
                  href="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-4 text-white text-sm uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  <span>Sign In/Register</span>
                  <ArrowRight size={16} />
                </a>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
