"use client";

import { useEffect } from "react";

/**
 * Scrolls the window to the top.
 * Supports optional dependencies so it can re-trigger on component state changes
 * like order confirmation, product ID updates, route transitions).
 */
export function useScrollToTop(deps: React.DependencyList = []) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Immediate scroll
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    // Secondary frame scroll after DOM layout resize
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 60);

    return () => clearTimeout(timer);
  }, deps);
}
