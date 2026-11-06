"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isLegal = ["/terms", "/privacy"].includes(pathname);
  const isAuth =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/signup";

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-[#121212]">
      {!isHome && !isAuth && <Navbar />}
      <main>{children}</main>
      {!isAuth && !isLegal && <Footer />}
    </div>
  );
}
