"use client";

import { usePathname } from "next/navigation";

import { SalesContactProvider } from "@/components/commerce/sales-contact";
import { StoreProvider } from "@/components/providers/store-provider";

import { FloatingWhatsApp } from "./floating-whatsapp";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileSalesBar } from "./mobile-sales-bar";
import { MobileFooter } from "./mobile-footer";
import { PageTopLoader } from "./page-top-loader";

export function RouteShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminRoute) {
    return <div id="main-content">{children}</div>;
  }

  return (
    <SalesContactProvider>
      <StoreProvider>
        <div className="storefront-shell">
          <PageTopLoader />
          <Header />
          <main id="main-content" className="min-h-[60vh]">
            {children}
          </main>
          <Footer />
          <MobileSalesBar />
          <FloatingWhatsApp />
        </div>
      </StoreProvider>
    </SalesContactProvider>
  );
}
