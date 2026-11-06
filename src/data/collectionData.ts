import spi from "@/assets/media/sigp_i.jpg";
import spii from "@/assets/media/sigp_ii.jpg";
import spiv from "@/assets/media/sigp_iv.jpg";
import rtwi from "@/assets/media/rtw_i.jpg";
import rtwii from "@/assets/media/rtw_ii.jpg";
import rtwiii from "@/assets/media/rtw_iii.jpg";
import rtwiv from "@/assets/media/rtw_iv.jpg";
import spvii from "@/assets/media/sigp_vii.jpg";
import { StaticImageData } from "next/image";

export interface CollectionItem {
  id: string;
  lookNumber: string;
  name: string;
  category: string;
  badge?: string;
  price: number;
  description: string;
  image: string | StaticImageData;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  variant: string;
}

export interface StudioProduct {
  id: string;
  name: string;
  price?: number;
  category: "READY TO WEAR" | "SIGNATURE PIECES";
  gender?: "men" | "women" | "unisex";
  image: string | StaticImageData;
  images?: string[];
  description?: string;
  colors?: { name: string; value: string }[];
  sizes?: string[];
  variant?: string;
}

export const STUDIO_COLLECTION: StudioProduct[] = [
  {
    id: "noir-elegance-collection",
    name: "NOIR ÉLÉGANCE - FALL'26",
    category: "SIGNATURE PIECES",
    image: spi,
  },
  {
    id: "ivory-prestige-ensemble",
    name: "IVORY PRESTIGE",
    category: "SIGNATURE PIECES",
    image: spvii,
  },
  {
    id: "bordeaux-imperial-ensemble",
    name: "BORDEAUX IMPÉRIAL",
    category: "SIGNATURE PIECES",
    image: spii,
  },

  {
    id: "saffron-royale-ensemble",
    name: "SAFFRON ROYALE",
    category: "SIGNATURE PIECES",
    image: spiv,
  },

  {
    id: "sandstone-signature-set",
    name: "SANDSTONE SIGNATURE",
    category: "READY TO WEAR",
    image: rtwi,
  },
  {
    id: "solistice-monochrome-ensemble-set",
    name: "SOLSTICE MONOCHROME",
    category: "READY TO WEAR",
    image: rtwii,
  },

  {
    id: "rose-imperial-kaftan",
    name: "ROSÉ IMPERIAL",
    category: "READY TO WEAR",
    image: rtwiii,
  },

  {
    id: "celestial-bloom-boubou",
    name: "CELESTIAL BLOOM",
    category: "READY TO WEAR",
    image: rtwiv,
  },
];
