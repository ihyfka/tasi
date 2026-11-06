import Product from "@/views/Product";

export const metadata = {
  title: "Product Detail | Tasi",
  description: "View product specifications, materials, and sizes.",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  return <Product productId={params?.id} />;
}

