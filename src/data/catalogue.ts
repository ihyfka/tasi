import { STUDIO_COLLECTION } from "./collectionData";

export interface CatalogueProduct {
  id: string;
  name: string;
  category: string;
  badge?: string;
  price: number;
  description: string;
  image: string;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  variant: string;
  subtitle?: string;
  material?: string;
}

const normalizedStudio: CatalogueProduct[] = STUDIO_COLLECTION.map((sc) => {
  const imgSrc = typeof sc.image === "string" ? sc.image : sc.image?.src || "";
  return {
    id: sc.id,
    name: sc.name,
    category: sc.category,
    price: sc.price ?? 0,
    description:
      sc.description ||
      "An exclusive piece from the Tasi Studio Collection, reflecting refined craftsmanship and bespoke tailoring.",
    image: imgSrc,
    images:
      sc.images && sc.images.length > 0
        ? sc.images
        : [imgSrc],
    colors: sc.colors || [{ name: "Standard", value: "#121212" }],
    sizes: sc.sizes || ["S", "M", "L", "XL"],
    variant: sc.variant || "Studio Edition",
  };
});

export const CATALOGUE: CatalogueProduct[] = [...normalizedStudio];
