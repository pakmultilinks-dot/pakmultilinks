"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BadgePercent, BarChart3, Boxes, Building2, FileText, FolderTree, LogOut, Menu, PackageSearch, Settings, ShoppingBag, Users, X } from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: BarChart3 },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/deals", label: "Deals", icon: BadgePercent },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navigation = (
    <>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-6">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300"><PackageSearch className="size-5" /></span>
          <span><strong className="block text-sm text-white">Pak Multilinks</strong><small className="text-xs text-emerald-100/60">Store administration</small></span>
        </Link>
        <button className="rounded-lg p-2 text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Administration">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active ? "bg-white text-emerald-950 shadow-sm" : "text-emerald-50/75 hover:bg-white/10 hover:text-white"}`}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate px-2 text-xs text-emerald-100/60">Signed in as</p>
        <p className="truncate px-2 pb-3 text-sm font-semibold text-white">{userName}</p>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-50/80 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />Sign out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-emerald-950 lg:flex">{navigation}</aside>
      {open && <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)}><aside className="flex h-full w-[min(19rem,88vw)] flex-col bg-emerald-950" onClick={(event) => event.stopPropagation()}>{navigation}</aside></div>}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:ml-64 lg:px-8">
        <button onClick={() => setOpen(true)} className="rounded-xl border border-slate-200 p-2 lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button>
        <div className="ml-auto flex items-center gap-3"><Link href="/" className="text-sm font-semibold text-emerald-800 hover:underline">View storefront</Link><span className="size-2 rounded-full bg-emerald-500" title="Authenticated" /></div>
      </header>
      <main className="px-4 py-7 sm:px-6 lg:ml-64 lg:px-8 lg:py-9">{children}</main>
    </div>
  );
}
