import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryNavigation({ categories, onNavigate, mobile = false }: {
  categories: Category[];
  onNavigate: () => void;
  mobile?: boolean;
}) {
  const roots = categories.filter(category => !category.parentId);
  return <div className={mobile ? "divide-y divide-neutral-200" : "grid grid-cols-4 gap-x-8 gap-y-8 xl:grid-cols-5"}>
    {roots.map(category => {
      const children = categories.filter(child => child.parentId === category.id);
      const links = <ul className="space-y-1">{children.map(child => <li key={child.id}><Link href={`/shop/${child.slug}`} onClick={onNavigate} className="focus-ring block py-2 text-sm font-normal text-neutral-600 hover:text-neutral-950 hover:underline">{child.name}</Link></li>)}<li><Link href={`/shop/${category.slug}`} onClick={onNavigate} className="focus-ring block py-2 text-sm text-neutral-600 hover:text-neutral-950 hover:underline">View all {category.name.toLowerCase()}</Link></li></ul>;
      return mobile ? <details key={category.id} className="group py-1"><summary className="flex min-h-12 list-none items-center justify-between gap-3 text-sm font-medium">{category.name}<ChevronDown className="size-4 transition group-open:rotate-180" /></summary><div className="pb-3 pl-3">{links}</div></details> : <section key={category.id}><Link href={`/shop/${category.slug}`} onClick={onNavigate} className="mb-3 block text-sm font-semibold text-neutral-900 hover:underline">{category.name}</Link>{links}</section>;
    })}
  </div>;
}
