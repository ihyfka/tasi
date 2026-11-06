"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Truck, RefreshCw, ShieldCheck, Plus, Check } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { useCart, CATALOGUE } from "../context/CartContext";
import { useQuery } from "@tanstack/react-query";
import {
  fetchProductByIdOrSlug,
  fetchProducts,
  mapDummyJsonToCatalogueProduct,
  toSlug,
} from "@/utils/productService";

interface ProductProps {
  productId?: string;
}

export default function Product({ productId }: ProductProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const { activeProductId, setActiveProduct, addItem, removeItem, items } =
    useCart();

  const paramId = typeof params?.id === "string" ? params.id : undefined;
  const searchId = searchParams?.get("id") || undefined;
  const resolvedId = (
    productId ||
    paramId ||
    searchId ||
    activeProductId
  )?.trim();

  useScrollToTop([resolvedId]);

  const catalogueMatch = useMemo(() => {
    if (!resolvedId) return null;
    const cleanId = resolvedId.replace(/-\d+$/, "").toLowerCase();
    return (
      CATALOGUE.find(
        (p) =>
          p.id.toLowerCase() === resolvedId.toLowerCase() ||
          p.id.toLowerCase() === cleanId ||
          toSlug(p.name) === resolvedId.toLowerCase() ||
          toSlug(p.name) === cleanId,
      ) || null
    );
  }, [resolvedId]);

  const { data: liveProduct, isLoading: isLiveLoading } = useQuery({
    queryKey: ["product-detail", resolvedId],
    queryFn: async () => {
      if (!resolvedId) return null;
      return await fetchProductByIdOrSlug(resolvedId);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 45,
    enabled: Boolean(resolvedId),
  });

  const product = useMemo(() => {
    if (liveProduct) {
      return mapDummyJsonToCatalogueProduct(liveProduct);
    }
    return catalogueMatch || null;
  }, [liveProduct, catalogueMatch]);

  //  Related Products Query
  // Fetch similar live products based on the main product's category
  const targetCategory =
    liveProduct?.category ||
    (product?.category
      ? product.category.toLowerCase().replace(/\s+/g, "-")
      : "all");

  const { data: relatedData, isLoading: isRelatedLoading } = useQuery({
    queryKey: ["related-products", product?.id, targetCategory],
    queryFn: async () => {
      if (!product) return null;
      try {
        const res = await fetchProducts({
          category: targetCategory,
          limit: 8,
          randomize: true,
        });
        if (res?.products && res.products.length > 0) {
          return res;
        }
      } catch (err) {
        console.warn(
          "Failed to fetch related products by category, falling back to all:",
          err,
        );
      }
      return await fetchProducts({
        category: "all",
        limit: 8,
        randomize: true,
      });
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: Boolean(product),
  });

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    const apiItems = (relatedData?.products || [])
      .map(mapDummyJsonToCatalogueProduct)
      .filter(
        (item) =>
          item.id !== product.id &&
          item.name.toLowerCase() !== product.name.toLowerCase(),
      );

    if (apiItems.length >= 4) {
      return apiItems.slice(0, 4);
    }

    if (apiItems.length > 0) {
      return apiItems;
    }

    // Emergency fallback: strictly filter for catalogue items with valid numeric prices
    return CATALOGUE.filter(
      (p) =>
        p.id !== product.id &&
        typeof p.price === "number" &&
        !isNaN(p.price) &&
        p.price > 0,
    ).slice(0, 4);
  }, [relatedData, product]);

  useEffect(() => {
    if (resolvedId && resolvedId !== activeProductId) {
      setActiveProduct(resolvedId);
    }
  }, [resolvedId, activeProductId, setActiveProduct]);

  const colors = product?.colors?.length
    ? product.colors
    : [{ name: "Standard", value: "#121212" }];

  const rawMainImage = product?.image as string | { src?: string } | undefined;
  const mainImageSrc =
    typeof rawMainImage === "object" && rawMainImage?.src
      ? rawMainImage.src
      : typeof rawMainImage === "string"
        ? rawMainImage
        : "";

  const images: string[] = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images
        .map((img: any) =>
          typeof img === "object" && img?.src ? img.src : String(img || ""),
        )
        .filter(Boolean);
    }
    return mainImageSrc ? [mainImageSrc] : [];
  }, [product?.images, mainImageSrc]);

  const [selectedColor, setSelectedColor] = useState(colors[0].name);
  const [activeImage, setActiveImage] = useState(0);

  // Reset image / selections whenever product changes
  const [lastProductId, setLastProductId] = useState(product?.id);
  if (product && product.id !== lastProductId) {
    setLastProductId(product.id);
    setActiveImage(0);
    setSelectedColor(colors[0].name);
  }

  if (isLiveLoading && !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#fcfcfb]">
        <div
          className="bouncing-dots mb-4"
          role="status"
          aria-label="Loading product"
        >
          <span />
          <span />
          <span />
        </div>

        <p className="text-xs uppercase tracking-widest text-black/50">
          Loading product...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center bg-[#fcfcfb]">
        <h1 className="font-main text-3xl sm:text-4xl font-bold tracking-tight text-[#121212] mb-3">
          Product Not Available
        </h1>
        <p className="text-sm text-black/55 max-w-md mb-8">
          The item &ldquo;{resolvedId || "unknown"}&rdquo; does not exist in our
          store or has been moved.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/collections/latest"
            className="px-6 py-3.5 bg-[#121212] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#2a2a2a] transition-colors"
          >
            Explore Collection
          </Link>
          <Link
            href="/shop/browse"
            className="px-6 py-3.5 border border-black/5 text-[#121212] text-xs font-bold uppercase tracking-widest hover:bg-black/3 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const DEFAULT_SIZE = "Default";

  const currentLineId = product
    ? `${product.id}__${DEFAULT_SIZE}__${selectedColor}`
    : null;

  const isInCart = Boolean(
    currentLineId && items.some((item) => item.id === currentLineId),
  );

  const handleToggleCart = () => {
    if (!product || !currentLineId) return;
    if (isInCart) {
      removeItem(currentLineId);
    } else {
      addItem(product, DEFAULT_SIZE, selectedColor);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfb]">
      {/* Breadcrumb */}
      <div className="px-6 md:px-10 lg:px-16 pt-10 py-4 border-b border-black/5">
        <nav className="flex items-center gap-2 text-xs text-black/40 font-medium tracking-wide">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/shop/browse"
            className="hover:text-black transition-colors"
          >
            Shop
          </Link>
          <span>/</span>
          <span className="text-black/70">{product.name}</span>
        </nav>
      </div>

      {/* Main Product Layout */}
      <div className="px-6 md:px-10 lg:px-16 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 lg:gap-16 max-w-300 mx-auto">
          {/*  Left: Image Gallery  */}
          <div className="flex gap-4">
            {/* Main Image */}
            <div className="flex-1 relative lg:aspect-3/4 overflow-hidden bg-[#eae8e3]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${product.id}-${activeImage}`}
                  src={images[activeImage] || product.image}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <div className="absolute right-5 bottom-5 sm:right-10 sm:bottom-7 z-1">
                  <div className="flex items-center gap-2.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Select image ${i + 1}`}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-all md:w-3 md:h-3 lg:w-4 lg:h-4 duration-200 cursor-pointer ${
                          activeImage === i
                            ? "bg-[#121212] scale-120"
                            : "bg-[#121212]/30 hover:bg-[#121212]/60"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/*  Right: Product Details  */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-black/40 mb-3">
              {product.category}
            </p>

            {/* Product Name */}
            <h1 className="font-main text-4xl md:text-5xl font-bold tracking-tight text-[#121212] leading-[0.9] mb-4">
              {product.name}
            </h1>

            {/* Price */}
            {typeof product?.price === "number" &&
              !isNaN(product.price) &&
              product.price > 0 && (
                <p className="text-2xl font-bold text-[#121212] mb-5">
                  ${product.price.toFixed(2)}
                </p>
              )}

            {/* Description */}
            <p className="text-sm text-black/55 leading-relaxed mb-8 max-w-sm">
              {product.description}
            </p>

            {/* Add to Cart */}
            <div className="mb-8">
              <button
                type="button"
                id="add-to-cart-btn"
                onClick={handleToggleCart}
                title={isInCart ? "Click to remove from cart" : "Add to cart"}
                className={`w-full h-13 flex items-center justify-center gap-2.5 font-bold text-white text-sm tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                  isInCart
                    ? "bg-[#121212]/70 hover:bg-[#121212]/60"
                    : "bg-[#121212] hover:bg-[#2a2a2a]"
                }`}
              >
                <AnimatePresence mode="wait">
                  {isInCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} />
                      Added to Cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add to Cart
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-black/8">
              {[
                {
                  icon: <Truck size={18} />,
                  title: "Free shipping",
                  sub: "on orders over $100",
                },
                {
                  icon: <RefreshCw size={16} />,
                  title: "Easy returns",
                  sub: "within 30 days",
                },
                {
                  icon: <ShieldCheck size={18} />,
                  title: "Secure payments",
                  sub: "100% secure",
                },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <span className="text-black/50">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-[#121212]">
                      {badge.title}
                    </p>
                    <p className="text-[10px] text-black/40 mt-0.5">
                      {badge.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/*  Related Products  */}
        <section className="mt-20 md:mt-28 max-w-300 mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-main text-2xl md:text-3xl font-bold tracking-tight text-[#121212]">
              You Might Also Like
            </h2>
          </div>

          {isRelatedLoading && relatedProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[0, 1, 2, 3].map((n) => (
                <div key={n} className="animate-pulse flex flex-col gap-3">
                  <div className="relative aspect-3/4 w-full bg-[#eae8e3]" />
                  <div className="h-4 bg-black/10 rounded w-3/4" />
                  <div className="h-3 bg-black/5 rounded w-1/2" />
                  <div className="h-4 bg-black/10 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((item, i) => (
                <motion.article
                  key={`${item.id}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.45,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  className="group cursor-pointer"
                >
                  <RelatedCard item={item} />
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Sub-component using Next.js Link for related items
function RelatedCard({
  item,
}: {
  item: import("../context/CartContext").CatalogueProduct;
}) {
  const { setActiveProduct } = useCart();
  const rawImg = item.images?.[0] as string | { src?: string } | undefined;
  const imageSrc = typeof rawImg === "string" ? rawImg : rawImg?.src || "";

  const priceFormatted =
    typeof item.price === "number" && !isNaN(item.price) && item.price > 0
      ? `$${item.price.toFixed(2)}`
      : null;

  return (
    <Link
      href={`/shop/product/${item.id}`}
      onClick={() => {
        setActiveProduct(item.id);
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className="block"
    >
      <div className="relative aspect-3/4 w-full overflow-hidden bg-[#eae8e3]">
        <img
          src={imageSrc}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-102"
        />
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
          <span className="block text-center w-full bg-[#121212] text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors">
            View
          </span>
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-[#121212] line-clamp-1">
          {item.name}
        </h3>
        <p className="text-xs text-black/45 mt-0.5">{item.category}</p>
        {priceFormatted && (
          <span className="font-main text-sm font-bold text-[#121212] mt-1.5 block">
            {priceFormatted}
          </span>
        )}
      </div>
    </Link>
  );
}
