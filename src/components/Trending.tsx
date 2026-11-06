"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import {
  useCart,
  CATALOGUE,
  type CatalogueProduct,
} from "../context/CartContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, toSlug } from "@/utils/productService";

export interface TrendingProps {
  category?: string;
  categories?: string[];
  limit?: number;
}

export default function Trending({
  category,
  categories,
  limit = 8,
}: TrendingProps = {}) {
  const router = useRouter();
  const { setActiveProduct, addItem } = useCart();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["trending-products", category, categories, limit],
    queryFn: () =>
      fetchProducts({
        categories: ["mens-shirts", "womens-bags", "sunglasses"],
        limit,
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 45,
  });

  const products = data?.products ?? [];

  return (
    <section className="w-full px-4 md:px-10 lg:px-15 py-10 md:py-14">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h2 className="font-main text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-neutral-900">
          Trending Products
        </h2>
        <Link
          href="/shop/browse"
          className="group flex items-center gap-1.5 text-xs md:text-sm font-semibold tracking-wider uppercase text-neutral-700 hover:text-black transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="relative aspect-square w-full bg-[#f4f3f0] animate-pulse rounded-xs" />
              <div className="mt-3.5 flex flex-col gap-2">
                <div className="h-4 bg-neutral-200 animate-pulse rounded-xs w-3/4" />
                <div className="h-3 bg-neutral-100 animate-pulse rounded-xs w-1/3" />
                <div className="h-4 bg-neutral-200 animate-pulse rounded-xs w-1/4 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && !isLoading && (
        <div className="py-16 text-center border border-dashed border-neutral-200 p-8">
          <p className="text-sm font-medium text-neutral-800 mb-1">
            Unable to load trending products
          </p>
          <p className="text-xs text-neutral-500 mb-4">
            Please check your connection and try again.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="py-16 text-center p-8">
          <p className="text-sm text-neutral-600">
            No trending products available at the moment.
          </p>
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => {
            const displayImage = product.images?.[0] || product.thumbnail || "";
            const formattedPrice =
              typeof product.price === "number"
                ? `$${product.price.toFixed(2)}`
                : `$${product.price}`;

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: "easeOut",
                }}
                className="group flex flex-col cursor-pointer"
                onClick={() => {
                  const slug = `${toSlug(product.title)}-${product.id}`;
                  setActiveProduct(slug);
                  router.push(`/shop/product/${slug}`);
                }}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#f4f3f0] flex items-center justify-center transition-all duration-300 group-hover:shadow-lg group-hover:shadow-black/5">
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={product.title}
                      fill
                      quality={100}
                      sizes="(max-width: 768px) 250vw, (max-width: 1200px) 150vw, 100vw"
                      className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-102"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                      No image
                    </div>
                  )}

                  <div className="absolute inset-x-4 bottom-3 z-10 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hidden sm:block">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const slug = `${toSlug(product.title)}-${product.id}`;
                        const existing =
                          CATALOGUE.find((c) => c.id === slug) ||
                          CATALOGUE.find((c) => c.id === String(product.id)) ||
                          CATALOGUE.find(
                            (c) =>
                              c.name.toLowerCase() ===
                              product.title.toLowerCase(),
                          );

                        const catProd: CatalogueProduct = existing || {
                          id: slug,
                          name: product.title,
                          category: product.category,
                          price: product.price,
                          description: product.description || "",
                          image: displayImage,
                          images: product.images?.length
                            ? product.images
                            : [displayImage],
                          colors: [{ name: "Standard", value: "#121212" }],
                          sizes: ["One Size"],
                          variant: "Standard",
                        };

                        addItem(
                          catProd,
                          catProd.sizes[0] || "One Size",
                          catProd.colors[0]?.name || "Standard",
                        );
                      }}
                      className="w-full bg-black text-white py-3 px-4 text-xs font-bold uppercase tracking-widest hover:cursor-pointer hover:bg-neutral-800 transition-colors"
                    >
                      Quick Add
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 flex flex-col">
                  <h3 className="text-sm md:text-base font-semibold text-neutral-900 tracking-tight group-hover:text-black transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-xs md:text-sm text-neutral-500 font-normal capitalize">
                    {product.category?.replace(/-/g, " ")}
                  </p>
                  <span className="font-main text-sm md:text-base font-bold text-neutral-900 mt-1.5">
                    {formattedPrice}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
