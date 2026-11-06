"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { STUDIO_COLLECTION, type StudioProduct } from "../data/collectionData";
import Image from "next/image";

const CATEGORIES = ["READY TO WEAR", "SIGNATURE PIECES"];

type CategoryFilter = (typeof CATEGORIES)[number] | "ALL";

export default function LatestCollection() {
  useScrollToTop();
  const [activeCategory, setActiveCategory] =
    useState<CategoryFilter>("READY TO WEAR");
  const [activeViewerProduct, setActiveViewerProduct] =
    useState<StudioProduct | null>(null);

  const displayedProducts =
    activeCategory === "ALL"
      ? STUDIO_COLLECTION
      : STUDIO_COLLECTION.filter((item) => item.category === activeCategory);

  // Close viewer on Escape key & lock scroll when viewer is open
  useEffect(() => {
    if (!activeViewerProduct) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveViewerProduct(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeViewerProduct]);

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-[#121212]">
      {/*  Top Editorial Header  */}
      <header className="relative pt-10 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
        {/* Giant Watermark Background: "THE STUDIO" */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-between pointer-events-none select-none z-0 overflow-hidden px-2 sm:px-6 md:px-10"
        >
          <span className="font-main font-black text-[14vw] lg:text-[11.5rem] xl:text-[13.5rem] leading-none uppercase text-black/7 tracking-tight">
            TASI
          </span>
          <span className="font-main font-black text-[14vw] lg:text-[11.5rem] xl:text-[13.5rem] leading-none uppercase text-black/7 tracking-tight">
            STUDIO
          </span>
        </div>

        {/* Foreground Content: Icon, Title & Manifesto */}
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col items-center">
          <div className="inline-flex flex-col items-start max-w-full">
            {/* Main Headline: OUR COLLECTION */}
            <h1 className="font-main font-black text-5xl sm:text-7xl md:text-8xl lg:text-[7.25rem] xl:text-[8.5rem] tracking-tight leading-[0.88] uppercase text-black select-none text-left">
              OUR COLLECTION
            </h1>

            {/* Manifesto / Subtitle block aligned under right portion of title */}
            <div className="self-end mt-4 sm:mt-5 max-w-70 sm:max-w-81.25 text-left">
              <p className="font-secondary text-[10px] sm:text-xs font-bold tracking-wider uppercase leading-[1.38] text-black">
                A singular system, designed to endure. Garments are built to
                work together—elevating daily life through structure, material,
                and balance.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/*  Category Navigation Bar  */}
      <nav
        aria-label="Collection categories"
        className="border border-y border-black/10 my-6 sm:my-8 md:my-10 bg-[#fcfcfb]/80 backdrop-blur-xs sticky top-0 z-20"
      >
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8">
          {/* Left: COLLECTION */}
          <button
            type="button"
            onClick={() => setActiveCategory("ALL")}
            className={`font-main font-bold tracking-wider text-xs sm:text-sm uppercase transition-colors cursor-pointer shrink-0 ${
              activeCategory === "ALL"
                ? "text-black"
                : "text-black hover:text-neutral-600"
            }`}
          >
            COLLECTION
          </button>

          {/* Right: Category filters list */}
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`font-secondary text-[11px] sm:text-xs tracking-wider uppercase whitespace-nowrap cursor-pointer transition-colors ${
                    isActive
                      ? "text-black font-bold"
                      : "text-neutral-400 hover:text-black font-semibold"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/*  4-Column Product Lookbook Grid  */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 pb-16 sm:pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-x-4 sm:gap-x-5 md:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-12"
          >
            {displayedProducts.map((product: StudioProduct) => (
              <div
                key={product.id}
                onClick={() => setActiveViewerProduct(product)}
                className="group cursor-pointer flex flex-col"
              >
                {/* Portrait Model Photo */}
                <div className="relative aspect-3/4 w-full overflow-hidden bg-[#ededed]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="w-full h-full object-cover object-top contrast-100 transition-transform duration-700 ease-out group-hover:scale-102"
                  />
                </div>

                {/* Metadata Row: Name on Left, Price on Right */}
                <div className="mt-2.5 sm:mt-3 flex items-baseline justify-between gap-2 px-0.5">
                  <h2 className="font-main font-bold text-xs sm:text-[13px] md:text-[14px] tracking-wide text-black uppercase truncate group-hover:text-neutral-600 transition-colors">
                    {product.name}
                  </h2>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/*  Fullscreen Image Lightbox Viewer  */}
      <AnimatePresence>
        {activeViewerProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            onClick={() => setActiveViewerProduct(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 cursor-zoom-out"
          >
            {/* Small <X /> cancel button at top right */}
            <button
              type="button"
              aria-label="Close fullscreen view"
              onClick={(e) => {
                e.stopPropagation();
                setActiveViewerProduct(null);
              }}
              className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2 sm:p-2.5 rounded-full text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Viewer Image Container */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col items-center max-w-[94vw] max-h-[92vh] cursor-default"
            >
              <div className="relative w-auto h-[80vh] sm:h-[86vh] aspect-3/4 max-w-[92vw]">
                <Image
                  src={activeViewerProduct.image}
                  alt={activeViewerProduct.name}
                  fill
                  sizes="(max-width: 768px) 90vw, 85vh"
                  className="object-contain drop-shadow-2xl select-none"
                  priority
                />
              </div>

              {/* Minimal caption */}
              <div className="mt-3 text-center">
                <h3 className="font-main font-bold text-xs sm:text-sm tracking-widest uppercase text-white">
                  {activeViewerProduct.name}
                </h3>
                <p className="text-[10px] sm:text-xs text-white/60 tracking-wider uppercase mt-0.5">
                  {activeViewerProduct.category}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
