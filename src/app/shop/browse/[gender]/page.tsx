import { notFound } from "next/navigation";
import BrowseListings from "@/views/Explore";

const VALID_GENDERS = ["men", "women", "accessories"] as const;
type Gender = (typeof VALID_GENDERS)[number];

interface Props {
  params: Promise<{ gender: string }>;
}

export async function generateStaticParams() {
  return VALID_GENDERS.map((gender) => ({ gender }));
}

export async function generateMetadata({ params }: Props) {
  const { gender } = await params;
  const label = gender.charAt(0).toUpperCase() + gender.slice(1);
  return {
    title: `${label} | Browse | Tasi`,
    description: `Shop ${label}'s clothing, shoes and accessories at Tasi.`,
  };
}

export default async function Page({ params }: Props) {
  const { gender } = await params;

  if (!VALID_GENDERS.includes(gender as Gender)) {
    notFound();
  }

  return <BrowseListings gender={gender} />;
}
