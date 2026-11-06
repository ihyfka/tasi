import Product from "@/views/Product";
import { CATALOGUE } from "@/data/catalogue";
import {
  fetchProductByIdOrSlug,
  mapDummyJsonToCatalogueProduct,
  toSlug,
} from "@/utils/productService";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  let product = CATALOGUE.find(
    (p) =>
      p.id.toLowerCase() === id?.toLowerCase() ||
      toSlug(p.name) === id?.toLowerCase()
  );

  if (!product && id) {
    try {
      const dummy = await fetchProductByIdOrSlug(id);
      if (dummy) {
        product = mapDummyJsonToCatalogueProduct(dummy);
      }
    } catch {
      // ignore
    }
  }

  if (!product) {
    return { title: "Product | Tasi" };
  }
  return {
    title: `${product.name} | Tasi`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Product productId={id} />;
}

