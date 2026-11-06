import Auth from "@/views/Auth";

export const metadata = {
  title: "Account | Tasi",
  description: "Sign in or create an account with Tasi.",
};

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string; redirect?: string }>;
}) {
  const params = await searchParams;
  const initialMode = params?.mode === "signup" ? "signup" : "login";
  return <Auth initialMode={initialMode} redirect={params?.redirect} />;
}

