"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Image, { StaticImageData } from "next/image";

import collectionImg from "@/assets/media/collection_image.webp";

interface ExploreCollectionProps {
  image?: string | StaticImageData;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export default function ExploreCollection({
  image = collectionImg,
  title = "EXPLORE OUR LATEST\nCOLLECTION",
  description = `Experience the craftsmanship and style behind tasi. Browse our newest arrivals and find your next favorite piece.`,
  ctaText = "VIEW LATEST COLLECTION",
  ctaLink = "/collections/latest",
}: ExploreCollectionProps) {
  return (
    <section className="w-full px-4 md:px-10 lg:px-15 py-10 md:py-14 bg-[#f4f3f0]">
      <div className="grid grid-cols-1 md:grid-cols-[5fr_4fr] gap-8 md:gap-12 lg:gap-16 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full aspect-4/3 overflow-hidden bg-neutral-200"
        >
          <Image
            src={image}
            alt="Latest Collection"
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-102 object-[50%_35%]"
            loading="lazy"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="flex flex-col justify-between py-1 md:py-5 lg:py-10"
        >
          <div>
            <h2 className="font-main text-3xl sm:text-4xl lg:text-[2.75rem] font-black uppercase tracking-tight text-neutral-900 leading-[1.08] whitespace-pre-line">
              {title}
            </h2>
            <p className="my-3 sm:mt-5 text-sm sm:text-base text-neutral-500 font-normal leading-relaxed max-w-md">
              {description}
            </p>
          </div>

          <div className="pt-3 md:pt-0">
            <a
              href={ctaLink}
              className="group flex items-center gap-1.5 text-xs md:text-sm font-semibold tracking-wider uppercase text-neutral-700 hover:text-black transition-colors"
            >
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
