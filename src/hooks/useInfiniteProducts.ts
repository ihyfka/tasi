import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/utils/productService";
import { ProductsResponse } from "@/types/product";

interface PageParam {
  limit: number;
  skip: number;
}

export function useInfiniteProducts(category?: string) {
  return useInfiniteQuery<
    ProductsResponse,
    Error,
    ProductsResponse,
    (string | undefined)[],
    PageParam
  >({
    queryKey: ["products", category],
    queryFn: ({ pageParam }) =>
      fetchProducts({
        category,
        limit: pageParam.limit,
        skip: pageParam.skip,
      }),
    initialPageParam: { limit: 20, skip: 0 },
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.products.length;
      if (nextSkip >= lastPage.total || lastPage.products.length === 0) {
        return undefined;
      }
      return {
        limit: 10,
        skip: nextSkip,
      };
    },
  });
}
