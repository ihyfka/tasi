"use client";

import Image, { StaticImageData } from "next/image";

import womenCat from "@/assets/media/women_cat.webp";
import menCat from "@/assets/media/men_cat.webp";
import accessoriesCat from "@/assets/media/accessories_cat.webp";

interface CategoryCard {
  label: string;
  categoryKey: string;
  image: string | StaticImageData;
  url: string;
}

const CATEGORIES: CategoryCard[] = [
  {
    label: "Women",
    categoryKey: "women",
    image: womenCat,
    url: "/shop/browse/women",
  },
  { label: "Men", categoryKey: "men", image: menCat, url: "/shop/browse/men" },
  {
    label: "Accessories",
    categoryKey: "accessories",
    image: accessoriesCat,
    url: "/shop/browse/accessories",
  },
];

export default function Category() {
  return (
    <section className="w-full pt-20! md:pt-25! px-4 md:px-10 lg:px-15 py-10 md:py-14">
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <h2 className="font-main text-2xl md:text-3xl lg:text-4xl font-medium tracking-tight text-neutral-900">
          Who are we shopping for?
        </h2>
      </div>

      <div className="w-full md:grid md:grid-cols-3 flex flex-nowrap gap-5 overflow-x-auto md:overflow-visible overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none bg-[#16161600]">
        {CATEGORIES.map((category) => (
          <a href={category.url} key={category.label}>
            <div className="relative shrink-0 md:shrink-0 md:min-h-110 md:h-110 min-h-90 min-w-[18rem] md:min-w-0 md:w-full rounded overflow-hidden transition-all duration-700 bg-neutral-900">
              <Image
                src={category.image}
                alt={category.label}
                fill
                sizes="(max-width: 768px) 250vw, (max-width: 1200px) 150vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/10 to-black/5 pointer-events-none" />

              <span className="font-main absolute bottom-5 right-2.5 text-white text-2xl md:text-4xl z-10">
                {category.label}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
