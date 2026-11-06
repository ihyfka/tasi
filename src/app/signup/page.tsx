import Auth from "@/views/Auth";

export const metadata = {
  title: "Create Account | Tasi",
  description: "Join Tasi for early access to drops and collections.",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return <Auth initialMode="signup" redirect={params?.redirect} />;
}
