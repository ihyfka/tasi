"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetchProducts,
  fetchCategoryTotals,
  mapDummyJsonToCatalogueProduct,
} from "@/utils/productService";
import type { Product } from "@/types/product";

import { useScrollToTop } from "../hooks/useScrollToTop";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { CatalogueProduct, useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CATEGORY_CONFIG, type CategoryType } from "../data/exploreProducts";
import Image from "next/image";

/**
 * Predefined parameter mapping for filter categories.
 * Maps UI CategoryType to DummyJSON category slugs to ensure robust queries
 * and avoid invalid or unmapped backend parameters.
 */
export const CATEGORY_PARAM_MAP: Record<string, string[]> = {
  Dresses: ["womens-dresses"],
  Outerwear: ["mens-shirts", "womens-dresses"],
  Tops: ["mens-shirts"],
  Bottoms: ["mens-shirts"],
  Bags: ["womens-bags"],
  Shoes: ["mens-shoes", "womens-shoes"],
  Accessories: [
    "sunglasses",
    "womens-jewellery",
    "mens-watches",
    "womens-watches",
    "womens-bags",
  ],
};

/**
 * Predefined parameter mapping for Gender routes (/shop/browse/[gender]).
 */
export const ALL_FASHION_CATEGORIES = [
  "womens-dresses",
  "mens-shirts",
  "tops",
  "womens-bags",
  "womens-shoes",
  "mens-shoes",
  "sunglasses",
  "womens-jewellery",
  "mens-watches",
  "womens-watches",
];

export const GENDER_PARAM_MAP: Record<string, string[]> = {
  men: ["mens-shirts", "mens-shoes", "mens-watches"],
  women: [
    "womens-dresses",
    "womens-shoes",
    "womens-watches",
    "womens-bags",
    "womens-jewellery",
  ],
  accessories: [
    "sunglasses",
    "mens-shoes",
    "mens-watches",
    "womens-bags",
    "womens-shoes",
    "womens-watches",
    "womens-jewellery",
  ],
};

type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 1500;
const PAGE_SIZE = 24;

export default function BrowseListings({ gender }: { gender?: string }) {
  useScrollToTop();
  const router = useRouter();
  const { setActiveProduct } = useCart();

  //  Stable randomized seed per user session so different users see different data/order
  const [userRandomSeed] = useState(() =>
    Math.random().toString(36).substring(2, 9),
  );

  //  Filters State
  const [selectedCategories, setSelectedCategories] = useState<CategoryType[]>(
    [],
  );
  // Default to [0, 1500] so products of all price ranges (e.g. $10 - $800+) are visible by default
  const [priceRange, setPriceRange] = useState<[number, number]>([
    DEFAULT_MIN_PRICE,
    DEFAULT_MAX_PRICE,
  ]);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  //  Mobile Drawer State
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Check URL query parameters for initial filter (e.g. ?category=Dresses)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) {
      const match = CATEGORY_CONFIG.find(
        (c) => c.id.toLowerCase() === cat.toLowerCase(),
      );
      if (match) {
        setSelectedCategories([match.id]);
      }
    }
  }, []);

  //  Map selected categories & gender to predefined query parameters
  const apiCategories = useMemo(() => {
    if (selectedCategories.length > 0) {
      const slugs: string[] = [];
      for (const cat of selectedCategories) {
        const mapped = CATEGORY_PARAM_MAP[cat];
        if (mapped) {
          slugs.push(...mapped);
        } else {
          slugs.push(cat.toLowerCase().trim());
        }
      }
      return Array.from(new Set(slugs));
    }

    if (gender && GENDER_PARAM_MAP[gender.toLowerCase()]) {
      return GENDER_PARAM_MAP[gender.toLowerCase()];
    }

    // Default to all fashion categories so no cucumbers, dog food, groceries etc. are fetched
    return ALL_FASHION_CATEGORIES;
  }, [selectedCategories, gender]);

  //  Infinite query for continuous scrolling with randomized parameter
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: [
      "shop-products",
      gender || "all",
      apiCategories.slice().sort().join(","),
      userRandomSeed,
    ],
    queryFn: ({ pageParam = 0 }) =>
      fetchProducts({
        categories: apiCategories,
        limit: PAGE_SIZE,
        skip: pageParam as number,
        randomize: true,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const currentCount = allPages.reduce(
        (sum, p) => sum + (p.products?.length || 0),
        0,
      );
      if (
        currentCount >= (lastPage?.total || 0) ||
        (lastPage?.products?.length || 0) === 0
      ) {
        return undefined;
      }
      return currentCount;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Extract and deduplicate products across all fetched pages
  const apiProducts = useMemo(() => {
    if (!data?.pages) return [];
    const all: Product[] = [];
    const seen = new Set<number>();
    for (const page of data.pages) {
      if (Array.isArray(page?.products)) {
        for (const prod of page.products) {
          if (!seen.has(prod.id)) {
            seen.add(prod.id);
            all.push(prod);
          }
        }
      }
    }
    return all;
  }, [data]);

  // Transform fetched DummyJSON products with fallback to local collection, ensuring unique IDs
  const displayProducts = useMemo(() => {
    if (apiProducts.length > 0) {
      const seenSlugs = new Set<string>();
      const result: CatalogueProduct[] = [];

      for (const prod of apiProducts) {
        const item = mapDummyJsonToCatalogueProduct(prod);
        // If a product with this slug already exists, make it unique using the product numeric ID
        if (seenSlugs.has(item.id)) {
          item.id = `${item.id}-${prod.id}`;
        }
        seenSlugs.add(item.id);
        result.push(item);
      }

      return result;
    }
    return [];
  }, [apiProducts]);

  //  Intersection Observer sentinel for Infinite Scroll
  const observerRef = useIntersectionObserver({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    enabled: Boolean(hasNextPage && !isFetchingNextPage),
    rootMargin: "350px",
  });

  //  Fetch dynamic category totals from API
  const allCategorySlugs = useMemo(() => {
    const set = new Set<string>();
    Object.values(CATEGORY_PARAM_MAP).forEach((slugs) => {
      slugs.forEach((s) => set.add(s));
    });
    return Array.from(set);
  }, []);

  const { data: categoryTotals } = useQuery({
    queryKey: ["category-totals", allCategorySlugs],
    queryFn: () => fetchCategoryTotals(allCategorySlugs),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Dynamic category list with counts computed dynamically from the API
  const dynamicCategories = useMemo(() => {
    return CATEGORY_CONFIG.map((cat) => {
      const mappedSlugs = CATEGORY_PARAM_MAP[cat.id] || [];

      // Filter slugs by gender if viewing a specific gender route
      const relevantSlugs = gender
        ? mappedSlugs.filter((slug) => {
            if (gender === "men") return !slug.startsWith("womens-");
            if (gender === "women") return !slug.startsWith("mens-");
            return true;
          })
        : mappedSlugs;

      if (categoryTotals && relevantSlugs.length > 0) {
        const sum = relevantSlugs.reduce((acc, slug) => {
          return acc + (categoryTotals[slug] || 0);
        }, 0);
        return {
          id: cat.id,
          label: cat.label,
          count: sum,
        };
      }

      // Fallback to counting matching items from loaded products
      const localCount = displayProducts.filter((p) => {
        const prodCat = p.category.toLowerCase().replace(/\s+/g, "-");
        return (
          cat.id.toLowerCase() === p.category.toLowerCase() ||
          relevantSlugs.some(
            (slug) => prodCat.includes(slug) || slug.includes(prodCat),
          )
        );
      }).length;

      return {
        id: cat.id,
        label: cat.label,
        count: localCount,
      };
    });
  }, [categoryTotals, displayProducts, gender]);

  // Toggle Category
  const toggleCategory = (cat: CategoryType) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE]);
    setSortBy("newest");
  };

  const isPriceFiltered =
    priceRange[0] !== DEFAULT_MIN_PRICE || priceRange[1] !== DEFAULT_MAX_PRICE;

  // Active filters count (Category and Price only)
  const activeFiltersCount =
    selectedCategories.length + (isPriceFiltered ? 1 : 0);

  //  Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    const list = displayProducts
      .filter((product) => {
        // Restrict strictly to fashion apparel and fashion accessories
        const catLower = product.category.toLowerCase().replace(/\s+/g, "-");
        const isFashion =
          catLower.includes("dress") ||
          catLower.includes("shirt") ||
          catLower.includes("top") ||
          catLower.includes("shoe") ||
          catLower.includes("bag") ||
          catLower.includes("watch") ||
          catLower.includes("jewel") ||
          catLower.includes("sunglass") ||
          catLower.includes("pant") ||
          catLower.includes("jacket") ||
          catLower.includes("outerwear") ||
          catLower.includes("bottom") ||
          catLower.includes("accessori") ||
          catLower.includes("collection");

        if (!isFashion) return false;

        // Gender filter from route param
        if (gender && gender !== "accessories") {
          const prodGender = (product as unknown as { gender?: string }).gender;
          if (prodGender && prodGender !== gender && prodGender !== "unisex") {
            return false;
          }
        }
        if (gender === "accessories") {
          const prodGender = (product as unknown as { gender?: string }).gender;
          if (
            prodGender &&
            !["Bags", "Shoes", "Accessories"].includes(product.category)
          ) {
            return false;
          }
        }

        // Category filter: match either direct label or mapped parameter slug
        if (selectedCategories.length > 0) {
          const matchCat = selectedCategories.some((sc) => {
            const mappedSlugs = CATEGORY_PARAM_MAP[sc] || [sc.toLowerCase()];
            const prodCat = product.category.toLowerCase().replace(/\s+/g, "-");
            return (
              sc.toLowerCase() === product.category.toLowerCase() ||
              mappedSlugs.some(
                (slug) => prodCat.includes(slug) || slug.includes(prodCat),
              )
            );
          });
          if (!matchCat) return false;
        }

        // Price filter: products must fall within the selected price range
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "popular") {
          const popA =
            (a as unknown as { popularity?: number; rating?: number })
              .popularity ??
            (a as unknown as { popularity?: number; rating?: number }).rating ??
            0;
          const popB =
            (b as unknown as { popularity?: number; rating?: number })
              .popularity ??
            (b as unknown as { popularity?: number; rating?: number }).rating ??
            0;
          return popB - popA;
        }
        // Default: newest first (or maintain randomized order from fetch)
        const dateB = (b as unknown as { dateAdded?: string }).dateAdded
          ? new Date(
              (b as unknown as { dateAdded?: string }).dateAdded!,
            ).getTime()
          : 0;
        const dateA = (a as unknown as { dateAdded?: string }).dateAdded
          ? new Date(
              (a as unknown as { dateAdded?: string }).dateAdded!,
            ).getTime()
          : 0;
        if (dateB && dateA) return dateB - dateA;
        return 0;
      });

    // Deduplicate any products sharing the same identifier to ensure unique React keys
    const seen = new Set<string>();
    return list.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [displayProducts, gender, selectedCategories, priceRange, sortBy]);

  // Dynamic page title
  const genderLabel = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1)
    : null;

  const pageTitle =
    selectedCategories.length === 1
      ? selectedCategories[0]
      : selectedCategories.length > 1
        ? `${selectedCategories.join(" & ")}`
        : genderLabel
          ? `${genderLabel}'s`
          : "All Clothing";

  const totalCatalogCount = data?.pages?.[0]?.total || filteredProducts.length;

  //  Reusable Filter Component (Desktop sidebar & Mobile drawer)
  const renderFilterPanel = (isMobile = false) => (
    <div className={`space-y-6 ${isMobile ? "p-1" : ""}`}>
      {/* Filters Header (Desktop only) */}
      {!isMobile && (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <span className="text-xs font-bold tracking-widest text-neutral-800 uppercase">
            FILTERS
          </span>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/*  Category Filter  */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {dynamicCategories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className="flex items-center justify-between py-1 text-sm text-neutral-700 hover:text-black cursor-pointer group select-none"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-xs border transition-colors flex items-center justify-center shrink-0 ${
                      isChecked
                        ? "bg-black border-black text-white"
                        : "border-neutral-300 bg-white group-hover:border-black"
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-3" />}
                  </div>
                  <span
                    className={
                      isChecked ? "font-semibold text-black" : "font-normal"
                    }
                  >
                    {cat.label}
                  </span>
                </div>
                <span className="text-xs text-neutral-400 font-normal">
                  {cat.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-neutral-200" />

      {/*  Price Dual Range Slider ($0 - $1500)  */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-neutral-900">Price</h3>
          {isPriceFiltered && (
            <button
              type="button"
              onClick={() =>
                setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE])
              }
              className="text-[11px] text-neutral-400 hover:text-black cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Dual Slider Track */}
        <div className="relative pt-2 pb-4 px-1">
          {/* Background track line */}
          <div className="relative h-1 bg-neutral-200 rounded-full w-full">
            {/* Highlighted active segment */}
            <div
              className="absolute h-1 bg-[#8e7662] rounded-full"
              style={{
                left: `${(priceRange[0] / DEFAULT_MAX_PRICE) * 100}%`,
                width: `${((priceRange[1] - priceRange[0]) / DEFAULT_MAX_PRICE) * 100}%`,
              }}
            />
          </div>

          {/* Range Inputs */}
          <input
            type="range"
            min={DEFAULT_MIN_PRICE}
            max={DEFAULT_MAX_PRICE}
            step={10}
            value={priceRange[0]}
            onChange={(e) => {
              const val = Math.min(Number(e.target.value), priceRange[1] - 20);
              setPriceRange([val, priceRange[1]]);
            }}
            aria-label="Minimum price"
            className="dual-range-input absolute inset-x-1 top-1 h-3 w-full"
          />
          <input
            type="range"
            min={DEFAULT_MIN_PRICE}
            max={DEFAULT_MAX_PRICE}
            step={10}
            value={priceRange[1]}
            onChange={(e) => {
              const val = Math.max(Number(e.target.value), priceRange[0] + 20);
              setPriceRange([priceRange[0], val]);
            }}
            aria-label="Maximum price"
            className="dual-range-input absolute inset-x-1 top-1 h-3 w-full"
          />

          {/* Price values underneath */}
          <div className="flex items-center justify-between mt-3 text-xs text-neutral-500 font-medium">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#121212]">
      {/*  Top Bar Container  */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12 pt-6 sm:pt-8 md:pt-10">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between text-xs tracking-wider uppercase text-neutral-400 mb-6">
          <nav className="flex items-center gap-2">
            <a
              href="/"
              className="text-neutral-500 hover:text-black transition-colors"
            >
              Home
            </a>
            <span>/</span>
            <a
              href="/shop/browse"
              className="text-neutral-500 hover:text-black transition-colors"
            >
              Browse
            </a>
            {genderLabel && (
              <>
                <span>/</span>
                <a
                  href={`/shop/browse/${gender}`}
                  className="text-neutral-500 hover:text-black transition-colors"
                >
                  {genderLabel}
                </a>
              </>
            )}
            <span>/</span>
            <span className="text-neutral-900 font-semibold">
              {selectedCategories.length === 1
                ? selectedCategories[0]
                : "All Items"}
            </span>
          </nav>
        </div>

        {/*  Main Page Header  */}
        <header className="mb-8 sm:mb-12">
          <h1 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl text-neutral-900 font-normal tracking-tight leading-none">
            {pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 mt-2.5 font-normal tracking-normal">
            {filteredProducts.length} pieces loaded, cut and finished in small
            runs.
          </p>
        </header>

        {/*  Main Catalog Explore Layout (Desktop 2 Columns / Mobile Responsive)  */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] gap-8 xl:gap-14 items-start pb-20">
          {/*  Left Column: Sticky Filters Sidebar (Desktop >= lg)  */}
          <aside className="hidden lg:block sticky top-28 self-start w-full pr-4">
            {renderFilterPanel(false)}
          </aside>

          {/*  Right Column: Products & Mobile Bar  */}
          <div className="w-full min-w-0">
            {/* Top Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-neutral-100">
              {/* Left: Results counter & Mobile Filter trigger */}
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <p className="text-xs sm:text-sm text-neutral-600 font-normal">
                  Showing {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "piece" : "pieces"}
                  {totalCatalogCount > filteredProducts.length
                    ? ` of ${totalCatalogCount}`
                    : ""}
                </p>

                {/* Mobile Filter Button (visible only < lg) */}
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3.5 py-1.5 border border-black/5 text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:border-black transition-colors cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="size-4.5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Right: Sort Dropdown */}
              <div className="flex items-center justify-end gap-2">
                <div className="relative inline-block text-left w-full sm:w-auto">
                  <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full sm:w-48 appearance-none bg-white border border-neutral-300 hover:border-black px-3.5 py-2 text-xs sm:text-[13px] font-medium text-neutral-800 pr-8 cursor-pointer transition-colors focus:outline-hidden focus:ring-1 focus:ring-black"
                  >
                    <option value="newest">Sort: Newest first</option>
                    <option value="price-asc">Sort: Price: Low to High</option>
                    <option value="price-desc">Sort: Price: High to Low</option>
                    <option value="popular">Sort: Most Popular</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Chips (Category + Price) */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 pb-2">
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-neutral-100 text-neutral-800 shadow-2xs cursor-pointer"
                  >
                    {cat}
                    <span
                      className="hover:text-black"
                      aria-label={`Remove category ${cat}`}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </button>
                ))}

                {isPriceFiltered && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-neutral-100 text-neutral-800 border border-neutral-200">
                    ${priceRange[0]} - ${priceRange[1]}
                    <button
                      type="button"
                      onClick={() =>
                        setPriceRange([DEFAULT_MIN_PRICE, DEFAULT_MAX_PRICE])
                      }
                      className="hover:text-black cursor-pointer"
                      aria-label="Reset price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-neutral-500 hover:text-black underline ml-1 cursor-pointer transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/*  Product Grid (3 Columns on Desktop, 2 on Tablet, 1 on Mobile)  */}
            {isLoading && apiProducts.length === 0 ? (
              <div className="py-24 text-center flex flex-col items-center justify-center">
                <div
                  className="bouncing-dots mb-4"
                  role="status"
                  aria-label="Loading products"
                >
                  <span />
                  <span />
                  <span />
                </div>
                <p className="text-xs uppercase tracking-widest text-neutral-400">
                  Loading products...
                </p>
              </div>
            ) : isError && apiProducts.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-neutral-200 p-8 my-4 flex flex-col items-center justify-center">
                <p className="text-neutral-800 text-lg font-medium mb-1">
                  Unable to load products
                </p>
                <p className="text-xs text-neutral-500 mb-5 max-w-sm">
                  Please check your connection or try refreshing the catalogue.
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center justify-center p-8 my-4">
                <p className="text-neutral-800 text-xl mb-2">
                  No pieces match your selected filters.
                </p>
                <p className="text-sm text-neutral-500 max-w-sm mb-6">
                  Try adjusting your category, price range, or clearing active
                  filters to explore the full collection.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
                  {filteredProducts.map((product: any, index: any) => {
                    return (
                      <Link
                        key={`${product.id}-${index}`}
                        href={`/shop/product/${product.id}`}
                        onClick={() => setActiveProduct(product.id)}
                        className="group flex flex-col cursor-pointer"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-3/4 w-full overflow-hidden bg-[#f6f5f0]">
                          <Image
                            src={product.images?.[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 250vw, (max-width: 1200px) 150vw, 100vw"
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
                          />

                          {/* Quick View Bar on hover */}
                          <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveProduct(product.id);
                                router.push(`/shop/product/${product.id}`);
                              }}
                              className="w-full bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:cursor-pointer hover:bg-neutral-800 transition-colors"
                            >
                              View
                            </button>
                          </div>
                        </div>

                        {/* Product Information Underneath */}
                        <div className="mt-3.5 flex items-start justify-between gap-3 px-0.5">
                          <div className="min-w-0 flex-1">
                            <h2 className="font-serif-heading text-base sm:text-[17px] font-bold text-neutral-900 group-hover:underline leading-snug truncate">
                              {product.name}
                            </h2>
                            <p className="text-xs text-neutral-500 mt-0.5 truncate font-normal">
                              {product.subtitle}
                            </p>
                          </div>
                          <span className="font-serif-heading text-sm sm:text-base font-bold text-neutral-900 shrink-0">
                            ${product.price}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Infinite Scroll Trigger Sentinel */}
                <div
                  ref={observerRef}
                  className="w-full py-12 flex flex-col items-center justify-center min-h-16"
                >
                  {isFetchingNextPage && (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="bouncing-dots"
                        role="status"
                        aria-label="Loading"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                      <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
                        Loading more pieces…
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/*  Mobile Filter Slide-Over Drawer Modal (< lg)  */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-widest uppercase text-neutral-900">
                    FILTERS
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="size-5 rounded-full bg-black text-white text-[10px] flex items-center justify-center font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs text-neutral-500 hover:text-black underline cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="size-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {renderFilterPanel(true)}
              </div>

              {/* Drawer Sticky Footer */}
              <div className="p-4 border-t border-neutral-200 bg-white">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Show {filteredProducts.length} Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
