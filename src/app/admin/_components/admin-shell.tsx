"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BadgePercent, Home, Boxes, Building2, FileText, FolderTree, LogOut, Menu, Package, Settings, ShoppingBag, Users, X, Search, ExternalLink, SlidersHorizontal } from "lucide-react";

const links = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/pricing", label: "Pricing & inventory", icon: SlidersHorizontal },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/quotes", label: "Quotations", icon: FileText },
  { href: "/admin/deals", label: "Offers & banners", icon: BadgePercent },
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
      router.replace("/admin/login"); router.refresh();
    } catch { setError("Could not sign out. Please try again."); }
  }
  const navigation = <>
    <div className="flex items-center justify-between px-5 py-5"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg border border-neutral-300 bg-white text-xs font-bold">PM</span><div><strong className="block text-[13px]">Pak Multilinks</strong><span className="text-[11px] text-neutral-500">Store administration</span></div></div><button onClick={() => menu.current?.close()} className="p-2 lg:hidden" aria-label="Close menu"><X className="size-4" /></button></div>
    <nav aria-label="Administration" className="space-y-1 px-3">{links.map(({ href, label, icon: Icon }) => {
      const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => menu.current?.close()} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${active ? "bg-white font-semibold text-neutral-950 shadow-sm" : "text-neutral-600 hover:bg-neutral-200/70"}`}><Icon className="size-[17px]" />{label}</Link>;
    })}</nav>
    <div className="mx-5 mt-7 border-t border-neutral-300 pt-5"><p className="mb-3 text-[11px] font-medium text-neutral-500">SALES CHANNEL</p><Link href="/" className="flex items-center gap-3 text-[13px] text-neutral-700"><Package className="size-4" />Online store<ExternalLink className="ml-auto size-3.5" /></Link></div>
    <div className="mt-auto space-y-1 p-3"><Link href="/admin/settings" onClick={() => menu.current?.close()} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${pathname === "/admin/settings" ? "bg-white font-semibold" : "text-neutral-600 hover:bg-neutral-200"}`}><Settings className="size-4" />Settings</Link><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-neutral-600 hover:bg-neutral-200"><LogOut className="size-4" />Sign out</button>{error && <p role="alert" className="p-2 text-xs text-red-700">{error}</p>}</div>
  </>;
  return <div className="admin-workspace min-h-screen bg-[#f1f1f1] text-[#303030]">
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-4 bg-[#1a1a1a] px-4 text-white lg:px-5"><button aria-label="Open menu" onClick={() => menu.current?.showModal()} className="grid size-9 place-items-center lg:hidden"><Menu className="size-5" /></button><Link href="/admin" className="flex w-auto shrink-0 items-center gap-2 text-sm font-semibold lg:w-52"><Package className="size-5 text-[#c5ddbc]" /><span className="hidden sm:inline">Pak Multilinks</span></Link><form action="/admin/products" className="mx-auto flex h-9 min-w-0 flex-1 max-w-xl items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3"><Search className="size-4 shrink-0 text-neutral-400" /><input name="q" aria-label="Search admin products" placeholder="Search products…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-neutral-400" /><button type="submit" className="text-[11px] text-neutral-300">Search</button></form><span className="ml-auto hidden text-xs text-neutral-300 md:block">{userName}</span><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#d4e7c5] text-xs font-semibold text-neutral-900">{userName.slice(0, 2).toUpperCase()}</span></header>
    <aside className="fixed bottom-0 left-0 top-14 z-30 hidden w-60 flex-col border-r border-neutral-200 bg-[#ebebeb] lg:flex">{navigation}</aside>
    <dialog ref={menu} aria-label="Admin navigation" className="m-0 h-dvh max-h-none w-72 max-w-[88vw] bg-[#ebebeb] p-0 backdrop:bg-black/40"><div className="flex min-h-full flex-col">{navigation}</div></dialog>
    <main className="min-w-0 px-4 pb-10 pt-20 sm:px-6 lg:ml-60 lg:px-8"><div className="mx-auto max-w-[1280px]">{children}</div></main>
  </div>;
}
