"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  BadgePercent,
  Home,
  Boxes,
  Building2,
  FileSpreadsheet,
  FileText,
  Newspaper,
  FolderTree,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
  Search,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/pricing", label: "Pricing & inventory", icon: SlidersHorizontal },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/rate-lists", label: "Catalogues & rate lists", icon: FileSpreadsheet },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/quotes", label: "Quotations", icon: FileText },
  { href: "/admin/deals", label: "Offers & banners", icon: BadgePercent },
  { href: "/admin/blogs", label: "Blog posts", icon: Newspaper },
];

export function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Could not sign out. Please try again.");
    }
  }

  const navigation = (
    <>
      <div className="flex items-center justify-between px-4 py-3 lg:hidden border-b border-line">
        <div className="flex items-center gap-2">
          <Package className="size-5 text-accent" />
          <span className="font-bold text-sm text-content">Pak Multilinks</span>
        </div>
        <button
          onClick={() => menu.current?.close()}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface hover:text-content transition"
          aria-label="Close menu"
        >
          <X className="size-4.5" />
        </button>
      </div>

      <div className="pt-3 lg:pt-4" />
      <nav aria-label="Administration" className="space-y-1 px-3">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => menu.current?.close()}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition min-h-[42px] ${
                active
                  ? "bg-surface font-semibold text-content shadow-xs border border-line"
                  : "text-secondary hover:bg-disabled/70 hover:text-content"
              }`}
            >
              <Icon className="size-[17px] shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mt-6 border-t border-line pt-4">
        <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted">SALES CHANNEL</p>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-secondary hover:bg-disabled/70 hover:text-content transition min-h-[40px]"
        >
          <Package className="size-4 text-accent" />
          <span>Online store</span>
          <ExternalLink className="ml-auto size-3.5 text-muted" />
        </Link>
      </div>

      <div className="mt-auto space-y-1 p-3 border-t border-line">
        <Link
          href="/admin/settings"
          onClick={() => menu.current?.close()}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition min-h-[40px] ${
            pathname === "/admin/settings"
              ? "bg-surface font-semibold text-content shadow-xs border border-line"
              : "text-secondary hover:bg-disabled hover:text-content"
          }`}
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </Link>

        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-secondary hover:bg-disabled hover:text-content transition min-h-[40px]"
        >
          <LogOut className="size-4" />
          <span>Sign out</span>
        </button>

        {error && (
          <p role="alert" className="p-2 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="admin-workspace min-h-screen bg-canvas text-content">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-surface px-3 text-content sm:gap-4 lg:px-5">
        {/* Mobile menu trigger */}
        <button
          aria-label="Open menu"
          onClick={() => menu.current?.showModal()}
          className="grid size-10 shrink-0 place-items-center rounded-lg text-accent hover:bg-surface-soft lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        {/* Brand */}
        <Link href="/admin" className="flex shrink-0 items-center gap-2 text-sm font-semibold lg:w-52">
          <Package className="size-5 text-accent" />
          <span className="hidden sm:inline">Pak Multilinks</span>
        </Link>

        {/* Responsive Search Input */}
        <form
          action="/admin/products"
          className="mx-auto flex h-9.5 min-w-0 flex-1 max-w-xs sm:max-w-xl items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 sm:px-3"
        >
          <Search className="size-3.5 shrink-0 text-muted" />
          <input
            name="q"
            aria-label="Search admin products"
            placeholder="Search products…"
            className="min-w-0 flex-1 bg-transparent text-xs sm:text-[13px] outline-none placeholder:text-muted"
          />
          <button type="submit" className="hidden text-xs font-semibold text-accent sm:block">
            Search
          </button>
        </form>

        <Link href="/admin/settings#administrator" className="ml-auto flex shrink-0 items-center gap-3 rounded-lg p-1.5 hover:bg-surface-soft" aria-label="Administrator profile settings">
          <span className="hidden max-w-36 truncate text-xs font-medium text-secondary md:block">{userName}</span>
          <span className="grid size-8 place-items-center rounded-lg border border-line/60 bg-surface-soft text-xs font-semibold text-content" title={userName}>{userName.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>
        </Link>
      </header>

      {/* Desktop Sidebar */}
      <aside className="admin-sidebar fixed bottom-0 left-0 top-14 z-30 hidden w-60 flex-col overflow-y-auto border-r border-line bg-surface-soft lg:flex">
        {navigation}
      </aside>

      {/* Mobile Drawer (Responsive & Touch Friendly) */}
      <dialog
        ref={menu}
        aria-label="Admin navigation"
        className="admin-sidebar m-0 h-dvh max-h-none w-72 max-w-[85vw] overflow-y-auto bg-surface-soft p-0 backdrop:bg-black/50 backdrop:backdrop-blur-xs"
      >
        <div className="flex min-h-full flex-col">{navigation}</div>
      </dialog>

      {/* Main Content Area (Responsive Padding) */}
      <main className="min-w-0 px-3.5 pb-10 pt-18 sm:px-6 lg:ml-60 lg:px-8">
        <div className="mx-auto max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
