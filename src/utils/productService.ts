import {
  FetchProductsParams,
  Product,
  ProductsResponse,
} from "@/types/product";
import type { CatalogueProduct } from "@/data/catalogue";

const BASE_URL = "https://dummyjson.com/products";

/**
 * Category mappings for DummyJSON.
 * DummyJSON does not have broad top-level categories like "men", "women", or "accessories",
 * but provides granular slugs. These mappings enable querying grouped collections.
 */
export const CATEGORY_MAP: Record<string, string[]> = {
  all: [
    "mens-shirts",
    "womens-dresses",
    "tops",
    "womens-bags",
    "womens-shoes",
    "mens-shoes",
    "sunglasses",
    "womens-jewellery",
    "mens-watches",
    "womens-watches",
  ],
  men: ["mens-shirts", "mens-shoes", "mens-watches"],
  women: ["womens-dresses", "womens-shoes", "womens-watches", "womens-bags", "womens-jewellery"],
  accessories: [
    "sunglasses",
    "mens-shoes",
    "mens-watches",
    "womens-bags",
    "womens-shoes",
    "womens-watches",
    "womens-jewellery",
  ],
  dresses: ["womens-dresses"],
  outerwear: ["mens-shirts", "womens-dresses"],
  tops: ["mens-shirts", "tops"],
  bottoms: ["mens-shirts"],
  bags: ["womens-bags"],
  shoes: ["mens-shoes", "womens-shoes"],
};

/**
 * Resolves a category name or array of categories to specific DummyJSON category slugs.
 */
export function resolveCategorySlugs(category?: string | string[]): string[] {
  if (!category) return [];

  const rawList = Array.isArray(category) ? category : [category];
  const resolved: string[] = [];

  for (const item of rawList) {
    const raw = item.trim();
    const hyphenated = raw.toLowerCase().replace(/\s+/g, "-");
    const spaced = raw.toLowerCase().replace(/[-_]+/g, " ");

    if (CATEGORY_MAP[hyphenated]) {
      resolved.push(...CATEGORY_MAP[hyphenated]);
    } else if (CATEGORY_MAP[spaced]) {
      resolved.push(...CATEGORY_MAP[spaced]);
    } else if (hyphenated && hyphenated !== "all") {
      resolved.push(hyphenated);
    }
  }

  // Deduplicate slugs
  return Array.from(new Set(resolved));
}

export async function fetchProducts(
  params?: string | FetchProductsParams,
): Promise<ProductsResponse> {
  let category: string | undefined;
  let categories: string[] | undefined;
  let search: string | undefined;
  let limit = 24;
  let skip = 0;
  let randomize = false;

  if (typeof params === "string") {
    category = params;
  } else if (params) {
    category = params.category;
    categories = params.categories;
    search = params.search;
    if (typeof params.limit === "number") limit = params.limit;
    if (typeof params.skip === "number") skip = params.skip;
    if (params.randomize) randomize = true;
  }

  // Case 0: Search query
  if (search && search.trim()) {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(search.trim())}&limit=${limit}&skip=${skip}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to search products for: ${search}`);
    }
    const data: ProductsResponse = await res.json();
    if (randomize && data.products) {
      data.products = [...data.products].sort(() => Math.random() - 0.5);
    }
    return data;
  }

  // Resolve target categories (handles joins for "men", "women", "accessories", etc.)
  // Default to fashion categories ("all") so no groceries, dog food, etc. are ever fetched.
  const targetCategories = resolveCategorySlugs(
    categories && categories.length > 0
      ? categories
      : category
        ? category
        : "all",
  );

  // Case 1: Multiple categories require parallel fetch and product joining
  if (targetCategories.length > 1) {
    const categoryResponses = await Promise.all(
      targetCategories.map(async (cat) => {
        try {
          const res = await fetch(
            `${BASE_URL}/category/${encodeURIComponent(cat)}`,
          );
          if (!res.ok) {
            console.warn(
              `Failed to fetch category "${cat}": HTTP ${res.status}`,
            );
            return null;
          }
          return (await res.json()) as ProductsResponse;
        } catch (err) {
          console.warn(`Error fetching category "${cat}":`, err);
          return null;
        }
      }),
    );

    let allProducts: Product[] = [];
    const seenIds = new Set<number>();

    for (const resp of categoryResponses) {
      if (resp && Array.isArray(resp.products)) {
        for (const product of resp.products) {
          if (!seenIds.has(product.id)) {
            seenIds.add(product.id);
            allProducts.push(product);
          }
        }
      }
    }

    if (randomize) {
      // Deterministic pseudo-random shuffle so pagination slices across pages remain stable
      allProducts = [...allProducts].sort((a, b) => {
        const hashA = (a.id * 9301 + 49297) % 233280;
        const hashB = (b.id * 9301 + 49297) % 233280;
        return hashA - hashB;
      });
    }

    const total = allProducts.length;
    const slicedProducts = allProducts.slice(skip, skip + limit);

    return {
      products: slicedProducts,
      total,
      skip,
      limit,
    };
  }

  // Case 2: Single category
  if (targetCategories.length === 1) {
    const singleCat = targetCategories[0];
    const url = `${BASE_URL}/category/${encodeURIComponent(singleCat)}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.warn(
        `Category "${singleCat}" returned HTTP ${res.status}, falling back to general catalog.`,
      );
      const fallbackUrl = `${BASE_URL}?limit=${limit}&skip=${skip}`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const fallbackData = (await fallbackRes.json()) as ProductsResponse;
        let prods = fallbackData.products;
        if (randomize) {
          prods = [...prods].sort((a, b) => {
            const hashA = (a.id * 9301 + 49297) % 233280;
            const hashB = (b.id * 9301 + 49297) % 233280;
            return hashA - hashB;
          });
        }
        return {
          ...fallbackData,
          products: prods.slice(skip, skip + limit),
          total: fallbackData.products.length,
          skip,
          limit,
        };
      }
      return { products: [], total: 0, skip, limit };
    }

    const data: ProductsResponse = await res.json();
    let prods = data.products;
    if (randomize) {
      prods = [...prods].sort((a, b) => {
        const hashA = (a.id * 9301 + 49297) % 233280;
        const hashB = (b.id * 9301 + 49297) % 233280;
        return hashA - hashB;
      });
    }
    const slicedProducts = prods.slice(skip, skip + limit);

    return {
      ...data,
      products: slicedProducts,
      total: data.products.length,
      skip,
      limit,
    };
  }

  // Case 3: All products (no specific category)
  const url = `${BASE_URL}?limit=${limit}&skip=${skip}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data: ProductsResponse = await res.json();
  if (randomize && data.products) {
    data.products = [...data.products].sort((a, b) => {
      const hashA = (a.id * 9301 + 49297) % 233280;
      const hashB = (b.id * 9301 + 49297) % 233280;
      return hashA - hashB;
    });
  }
  return data;
}

/**
 * Fetches total product count for specified DummyJSON category slugs.
 */
export async function fetchCategoryTotals(
  slugs: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  await Promise.all(
    slugs.map(async (slug) => {
      try {
        const res = await fetch(
          `${BASE_URL}/category/${encodeURIComponent(slug)}?limit=1&select=id`,
        );
        if (res.ok) {
          const data = await res.json();
          counts[slug] = typeof data.total === "number" ? data.total : 0;
        }
      } catch {
        // ignore
      }
    }),
  );

  return counts;
}

/**
 * Converts any product title into a URL-safe kebab-case slug.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Transforms a DummyJSON product into a CatalogueProduct matching the application's internal model.
 */

export function mapDummyJsonToCatalogueProduct(
  product: Product,
): CatalogueProduct {
  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
        ? [product.thumbnail]
        : [];

  const slug = product.id
    ? `${toSlug(product.title)}-${product.id}`
    : toSlug(product.title);

  return {
    id: slug,
    name: product.title,
    category: product.category
      ? product.category.replace(/-/g, " ")
      : "Collection",
    badge: product.rating >= 4.5 ? "TRENDING" : undefined,
    price: product.price,
    description:
      product.description ||
      "Crafted with exceptional care, combining timeless silhouette with contemporary detailing.",
    image: product.thumbnail || images[0] || "",
    images: images.length > 0 ? images : [product.thumbnail || ""],
    colors: [
      { name: "Default", value: "#000" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    variant: product.brand || "Standard",
    subtitle: product.brand
      ? `${product.brand} · ${product.category?.replace(/-/g, " ")}`
      : product.category?.replace(/-/g, " "),
    material: "Premium Blend",
  };
}

/**
 * Fetches a single product from DummyJSON by numeric ID or by title slug.
 */
export async function fetchProductByIdOrSlug(
  idOrSlug: string,
): Promise<Product | null> {
  if (!idOrSlug) return null;

  const trimmed = idOrSlug.trim();

  // 1. Purely numeric ID (e.g. "42")
  if (/^\d+$/.test(trimmed)) {
    try {
      const res = await fetch(`${BASE_URL}/${trimmed}`);
      if (res.ok) {
        return (await res.json()) as Product;
      }
    } catch (err) {
      console.warn(`Error fetching product ID "${trimmed}":`, err);
    }
  }

  // 2. Trailing numeric ID (e.g. "blue-womens-handbag-42" or "white-faux-leather-backpack-75")
  const matchId = trimmed.match(/-(\d+)$/);
  if (matchId) {
    try {
      const res = await fetch(`${BASE_URL}/${matchId[1]}`);
      if (res.ok) {
        return (await res.json()) as Product;
      }
    } catch {
      // ignore and continue
    }
  }

  // 3. Search by title text derived from slug
  const query = trimmed.replace(/-/g, " ");
  try {
    const res = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
    );
    if (res.ok) {
      const data = (await res.json()) as ProductsResponse;
      if (data.products && data.products.length > 0) {
        const exactMatch = data.products.find(
          (p) =>
            toSlug(p.title) === trimmed.toLowerCase() ||
            p.title.toLowerCase() === query.toLowerCase(),
        );
        return exactMatch || data.products[0];
      }
    }
  } catch (err) {
    console.warn(`Error searching product by slug "${trimmed}":`, err);
  }

  // 4. Fallback search handling word variations / punctuation (e.g. "womens" vs "women's")
  const rawWords = query.split(" ").filter(Boolean);
  const significantWords = rawWords.filter(
    (w) => w.length > 2 && !["the", "and", "for", "with", "item"].includes(w),
  );

  // Try significant words starting from the last word (primary noun, e.g. "handbag", "backpack")
  const searchKeywords = Array.from(new Set([...significantWords.reverse(), ...rawWords]));

  for (const keyword of searchKeywords) {
    try {
      const res = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(keyword)}`,
      );
      if (res.ok) {
        const data = (await res.json()) as ProductsResponse;
        if (data.products && data.products.length > 0) {
          // Check for exact slug match (with or without numeric suffix)
          const matchedBySlug = data.products.find(
            (p) =>
              toSlug(p.title) === trimmed.toLowerCase() ||
              toSlug(p.title).replace(/-\d+$/, "") === trimmed.toLowerCase() ||
              trimmed.toLowerCase().includes(toSlug(p.title)),
          );
          if (matchedBySlug) return matchedBySlug;

          // Check if candidate matches multiple words from the query
          const bestCandidate = data.products.find((p) => {
            const pSlug = toSlug(p.title);
            const matches = significantWords.filter((w) => pSlug.includes(w));
            return matches.length >= Math.min(2, significantWords.length);
          });
          if (bestCandidate) return bestCandidate;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export interface LiveSearchResult {
  products: CatalogueProduct[];
  isRelatedFallback: boolean;
  relatedNotice?: string;
}

/**
 * Live search against the actual API with automated fallback to closely related
 * products when an exact query yields zero matches.
 */
export async function searchLiveProducts(
  rawQuery: string,
  limit = 8,
): Promise<LiveSearchResult> {
  const query = rawQuery.trim();
  if (!query) {
    return { products: [], isRelatedFallback: false };
  }

  // 1. Try direct live API search
  try {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    if (res.ok) {
      const data: ProductsResponse = await res.json();
      if (data.products && data.products.length > 0) {
        return {
          products: data.products.map(mapDummyJsonToCatalogueProduct),
          isRelatedFallback: false,
        };
      }
    }
  } catch (err) {
    console.warn("Live exact search request failed:", err);
  }

  // 2. Exact search returned 0 items — find closely related results
  const rawWords = query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["the", "and", "for", "with", "all"].includes(w));

  const candidateProducts: Product[] = [];
  const seenIds = new Set<number>();

  // A. Search by individual keywords (starting from last/longest word, usually the noun)
  const prioritizedKeywords = Array.from(
    new Set([...rawWords.filter((w) => w.length > 3).reverse(), ...rawWords]),
  );

  for (const kw of prioritizedKeywords.slice(0, 3)) {
    try {
      const kwUrl = `${BASE_URL}/search?q=${encodeURIComponent(kw)}&limit=10`;
      const kwRes = await fetch(kwUrl);
      if (kwRes.ok) {
        const kwData: ProductsResponse = await kwRes.json();
        if (kwData.products) {
          for (const p of kwData.products) {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id);
              candidateProducts.push(p);
            }
          }
        }
      }
    } catch {
      // ignore
    }
    if (candidateProducts.length >= limit) break;
  }

  // B. If keywords didn't find enough, check category mappings
  if (candidateProducts.length < 4) {
    const matchedCategorySlugs = resolveCategorySlugs(query);
    if (matchedCategorySlugs.length > 0) {
      try {
        const catRes = await fetchProducts({
          categories: matchedCategorySlugs,
          limit: 6,
          randomize: true,
        });
        if (catRes.products) {
          for (const p of catRes.products) {
            if (!seenIds.has(p.id)) {
              seenIds.add(p.id);
              candidateProducts.push(p);
            }
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // C. Score and rank candidates by relevance to the query words
  if (candidateProducts.length > 0) {
    const scored = candidateProducts.map((p) => {
      const text = `${p.title} ${p.category} ${p.brand || ""} ${p.description || ""}`.toLowerCase();
      let score = 0;
      for (const word of rawWords) {
        if (text.includes(word)) score += 1;
      }
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return {
      products: scored.slice(0, limit).map((s) => mapDummyJsonToCatalogueProduct(s.product)),
      isRelatedFallback: true,
      relatedNotice: `Showing closely related products for "${query}"`,
    };
  }

  // D. Final fallback: popular fashion catalog items
  try {
    const generalRes = await fetchProducts({
      category: "all",
      limit: 6,
      randomize: true,
    });
    if (generalRes.products && generalRes.products.length > 0) {
      return {
        products: generalRes.products.map(mapDummyJsonToCatalogueProduct),
        isRelatedFallback: true,
        relatedNotice: `No exact matches. Popular in catalog:`,
      };
    }
  } catch {
    // ignore
  }

  return { products: [], isRelatedFallback: false };
}
