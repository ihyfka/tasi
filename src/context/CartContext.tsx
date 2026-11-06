"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CATALOGUE, type CatalogueProduct } from "../data/catalogue";

export { CATALOGUE, type CatalogueProduct };

export interface CartItem {
  id: string; // unique cart-line id: productId + size + color
  productId: string;
  name: string;
  variant: string;
  size: "Standard" | string;
  color: string;
  price: number;
  qty: number;
  image: string;
}

interface CartContextValue {
  items: CartItem[];
  activeProductId: string;
  setActiveProduct: (id: string) => void;
  addItem: (product: CatalogueProduct, size: string, color: string) => void;
  updateQty: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalQty: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tasi_cart_items";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string>(
    CATALOGUE[0].id,
  );

  // Restore cart from localStorage only on client after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist cart to localStorage only after initial client hydration is complete
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        try {
          setItems(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setActiveProduct = useCallback((id: string) => {
    setActiveProductId(id);
  }, []);

  const addItem = useCallback(
    (product: CatalogueProduct, size: string, color: string) => {
      const lineId = `${product.id}__${size}__${color}`;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === lineId);
        if (existing) {
          return prev.map((i) =>
            i.id === lineId ? { ...i, qty: i.qty + 1 } : i,
          );
        }
        return [
          ...prev,
          {
            id: lineId,
            productId: product.id,
            name: product.name,
            variant: product.variant,
            size,
            color,
            price: product.price,
            qty: 1,
            image: product.image,
          },
        ];
      });
    },
    [],
  );

  const updateQty = useCallback((id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        activeProductId,
        setActiveProduct,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        totalQty,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
