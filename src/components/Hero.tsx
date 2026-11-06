"use client";

import { useEffect, useRef, useState } from "react";
import Image, { StaticImageData } from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "motion/react";
import { Play, Pause, Search, Handbag, TagPlus, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../hooks/useDebounce";
import { searchLiveProducts, fetchProducts } from "@/utils/productService";

import logo from "../assets/media/tasi_logo.svg";
import image1 from "../assets/media/hero_image1.webp";
import image2 from "../assets/media/hero_image2.webp";
import image3 from "../assets/media/hero_image3.webp";

export interface Slide {
  src?: string | StaticImageData;
  image?: string | StaticImageData;
  type?: "image" | "video";
  position?: string;
  alt: string;
  duration?: number;
}

const SLIDES: Slide[] = [
  {
    src: image1,
    image: image1,
    type: "image",
    position: "50% 10%",
    alt: "Contemporary style",
  },
  {
    src: image2,
    image: image2,
    type: "image",
    position: "50% 25%",
    alt: "Modern aesthetic",
  },
  {
    src: image3,
    image: image3,
    type: "image",
    position: "50% 5%",
    alt: "Modern motion campaign",
  },
];

const AUTO_PLAY_INTERVAL = 4000;

const getSlideMediaSrc = (slide: Slide): string => {
  const raw = slide.src || slide.image || "";
  if (typeof raw === "object" && raw !== null && "src" in raw) {
    return (raw as StaticImageData).src;
  }
  return typeof raw === "string" ? raw : "";
};

const isVideoMedia = (slide: Slide): boolean => {
  if (slide.type === "video") return true;
  if (slide.type === "image") return false;
  const src = getSlideMediaSrc(slide);
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
};

export default function Hero() {
  const { totalQty, setActiveProduct } = useCart();
  const [mounted, setMounted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const debouncedQuery = useDebounce(searchQuery.trim(), 300);

  const { data: searchResult, isLoading: isSearching } = useQuery({
    queryKey: ["hero-live-search", debouncedQuery],
    queryFn: () => searchLiveProducts(debouncedQuery),
    enabled: Boolean(debouncedQuery.length > 0 && searchOpen),
    staleTime: 1000 * 60 * 3,
  });

  const matchingProducts = searchResult?.products || [];

  const [isPlaying, setIsPlaying] = useState(() => {
    if (typeof window !== "undefined") {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return true;
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    mass: 1,
    restDelta: 0.001,
  });

  const backgroundY = useTransform(smoothProgress, [0, 1], ["0%", "35%"]);
  const contentY = useTransform(smoothProgress, [0, 1], ["0%", "10%"]);
  const contentOpacity = useTransform(smoothProgress, [0, 0.85], [1, 0.5]);

  useEffect(() => {
    SLIDES.forEach((slide) => {
      const src = getSlideMediaSrc(slide);
      if (!src) return;
      if (isVideoMedia(slide)) {
        const video = document.createElement("video");
        video.src = src;
        video.preload = "metadata";
      }
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [currentIndex, isPlaying]);

  useEffect(() => {
    if (!isPlaying || SLIDES.length === 0) return;

    const currentSlide = SLIDES[currentIndex] || SLIDES[0];
    const isVideo = isVideoMedia(currentSlide);
    const duration =
      currentSlide.duration ?? (isVideo ? 6000 : AUTO_PLAY_INTERVAL);

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, duration);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying]);

  const handleSelectSlide = (index: number) => setCurrentIndex(index);
  const togglePlayPause = () => setIsPlaying((prev) => !prev);

  const handleVideoEnded = () => {
    if (isPlaying && SLIDES.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }
  };

  const currentSlide = SLIDES[currentIndex] || SLIDES[0];
  const isVideo = isVideoMedia(currentSlide);
  const mediaSrc = getSlideMediaSrc(currentSlide);

  return (
    <div
      ref={heroRef}
      className="relative w-full md:min-h-150 min-h-125 sm:h-dvh overflow-hidden bg-black"
    >
      <motion.div
        className="absolute top-[-15%] bottom-[-15%] inset-x-0 h-[130%] will-change-transform"
        style={{ y: backgroundY }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 overflow-hidden"
          >
            {isVideo ? (
              <video
                ref={videoRef}
                src={mediaSrc}
                autoPlay={isPlaying}
                muted
                loop
                playsInline
                preload="auto"
                onEnded={handleVideoEnded}
                className="w-full h-full object-cover pointer-events-none"
                style={{ objectPosition: currentSlide.position || "50% 50%" }}
              />
            ) : (
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={mediaSrc}
                  alt={currentSlide.alt}
                  fill
                  priority={currentIndex === 0}
                  sizes="(max-width: 768px) 250vw, (max-width: 1200px) 150vw, 100vw"
                  className="object-cover z-[-1]"
                  style={{ objectPosition: currentSlide.position || "50% 50%" }}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />
      </motion.div>

      <div
        className={`relative flex justify-between items-center p-6 md:p-10 ${
          searchOpen ? "z-30" : "z-10"
        }`}
      >
        <div className="flex-1">
          <Image
            className="w-auto h-5 md:h-10 object-contain"
            src={logo}
            alt="Tasi"
          />
        </div>

        <div className="flex justify-end gap-6.5">
          <button
            type="button"
            onClick={() => {
              setSearchOpen((p) => !p);
              if (searchOpen) setSearchQuery("");
            }}
            className="flex items-center gap-1.5 text-white transition-colors hover:cursor-pointer"
            title={searchOpen ? "Close search" : "Search"}
            aria-label={searchOpen ? "Close search" : "Search"}
          >
            {searchOpen ? (
              <>
                <X className="sm:hidden" />
                <span className="hidden text-xs font-medium uppercase tracking-widest sm:inline md:text-sm">
                  Close
                </span>
              </>
            ) : (
              <>
                <Search className="sm:hidden" />
                <span className="hidden text-xs font-medium uppercase tracking-widest sm:inline md:text-sm">
                  Search
                </span>
              </>
            )}
          </button>

          <a
            href="/collections/latest"
            className="relative flex items-center text-white transition-colors hover:cursor-pointer"
          >
            <button
              className="text-white transition-colors hover:cursor-pointer"
              title="Latest Collection"
            >
              <TagPlus className="sm:hidden" />
              <span className="hidden text-xs font-medium uppercase tracking-widest sm:inline md:text-sm">
                Collection
              </span>
            </button>
          </a>

          <a
            href="/cart"
            className="relative flex items-center text-white transition-colors hover:cursor-pointer"
            title="Cart"
            aria-label={`Cart${totalQty > 0 ? ` (${totalQty} items)` : ""}`}
          >
            <div className="relative flex items-center">
              <Handbag className="sm:hidden" />
              <span className="hidden text-xs font-medium uppercase tracking-widest sm:inline md:text-sm">
                Cart
              </span>
              {mounted && totalQty > 0 && (
                <span className="absolute -top-1.5 -right-2.5 sm:-top-2 sm:-right-3 min-w-4 h-4 px-1 flex items-center justify-center bg-white text-[#121212] text-[10px] font-bold rounded-full shadow-sm leading-none">
                  {totalQty}
                </span>
              )}
            </div>
          </a>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="relative z-30 px-6 md:px-10 pb-4 overflow-hidden"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/50 px-4 py-3.5 shadow-2xl">
                <Search size={18} className="text-white/80 shrink-0" />
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
                  className="bg-transparent outline-none text-sm text-white placeholder-white/40 w-full"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="text-xs uppercase font-semibold text-white/60 hover:text-white transition-colors cursor-pointer mr-1"
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
                  className="text-xs uppercase font-bold tracking-wider text-white/70 hover:text-white transition-colors cursor-pointer pl-3 border-l border-white/20"
                >
                  Close
                </button>
              </div>

              {searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2.5 bg-black/85 backdrop-blur-xl border border-white/15 shadow-2xl divide-y divide-white/10 max-h-72 overflow-y-auto"
                >
                  {isSearching ? (
                    <div className="p-4 text-center flex items-center justify-center gap-2 text-xs text-white/60">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:0.3s]" />
                      <span className="ml-1 tracking-wider uppercase text-[10px]">Searching catalog…</span>
                    </div>
                  ) : matchingProducts.length > 0 ? (
                    <>
                      {searchResult?.relatedNotice && (
                        <div className="px-3 py-2 bg-white/5 border-b border-white/10 text-[11px] font-medium tracking-wide text-white/70 flex items-center justify-between">
                          <span>{searchResult.relatedNotice}</span>
                          <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Related Match</span>
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
                          className="flex items-center gap-4 p-3 hover:bg-white/10 transition-colors group"
                        >
                          <img
                            src={typeof prod.image === "string" ? prod.image : (prod.image as any)?.src || ""}
                            alt={prod.name}
                            className="w-12 h-12 object-cover bg-white/10 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white group-hover:underline truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-white/60">
                              {prod.category} · {prod.variant}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-white tabular-nums shrink-0">
                            {typeof prod.price === "number" && !isNaN(prod.price) && prod.price > 0
                              ? `$${prod.price.toFixed(2)}`
                              : ""}
                          </span>
                        </a>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-center text-xs text-white/50">
                      No products found for "{searchQuery}"
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-xs cursor-pointer"
          />
        )}
      </AnimatePresence>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="absolute bottom-0 inset-x-0 z-10 flex flex-col md:flex-row justify-between md:items-end p-6 md:p-12 will-change-transform gap-8"
      >
        <h1 className="font-main text-white font-black text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.85] tracking-tighter uppercase max-w-3xl">
          The Future Of
          <br />
          Fashion Is Here
        </h1>

        <div className="flex flex-col items-start md:items-end gap-5">
          <a
            href="/browse"
            onClick={() => {
              fetchProducts({ limit: 20 }).catch(() => {});
            }}
            className="bg-white text-black px-7.5 py-3 text-sm md:text-base font-bold tracking-wide shrink-0 duration-200 transition-all uppercase cursor-pointer"
          >
            Shop Now
          </a>

          <div
            className="flex items-center gap-4 pr-1"
            role="region"
            aria-label="Hero slide controls"
          >
            <div className="flex items-center gap-3" role="tablist">
              {SLIDES.map((_, index) => {
                const isActive = currentIndex === index;
                return (
                  <motion.button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => handleSelectSlide(index)}
                    layout
                    animate={{
                      width: isActive ? 40 : 20,
                      opacity: isActive ? 1 : 0.4,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-0.5 bg-white cursor-pointer block"
                  />
                );
              })}
            </div>

            <button
              type="button"
              aria-label={
                isPlaying ? "Pause slide animation" : "Play slide animation"
              }
              onClick={togglePlayPause}
              className="flex items-center justify-center w-5 h-5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-2"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-current stroke-0" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current stroke-0" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
