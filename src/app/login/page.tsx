import Auth from "@/views/Auth";

export const metadata = {
  title: "Sign In | Tasi",
  description: "Sign in to your Tasi account.",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return <Auth initialMode="login" redirect={params?.redirect} />;
}
