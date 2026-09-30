"use client";

import { usePathname } from "next/navigation";

import { StoreProvider } from "@/components/providers/store-provider";

import { Footer } from "./footer";
import { FloatingSupport } from "./floating-support";
import { Header } from "./header";

export function RouteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <main id="main-content">{children}</main>;
  }

  return (
    <StoreProvider>
      <Header />
      <main id="main-content" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <FloatingSupport />
    </StoreProvider>
  );
}
