export type CategoryType =
  | "Dresses"
  | "Outerwear"
  | "Tops"
  | "Bottoms"
  | "Bags"
  | "Shoes"
  | "Accessories";

export const CATEGORY_CONFIG: {
  id: CategoryType;
  label: string;
  count: number;
}[] = [
  { id: "Dresses", label: "Dresses", count: 0 },
  { id: "Outerwear", label: "Outerwear", count: 0 },
  { id: "Tops", label: "Tops", count: 0 },
  { id: "Bottoms", label: "Bottoms", count: 0 },
  { id: "Bags", label: "Bags", count: 0 },
  { id: "Shoes", label: "Shoes", count: 0 },
  { id: "Accessories", label: "Accessories", count: 0 },
];
