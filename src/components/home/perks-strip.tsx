import Link from "next/link";
import { Truck, Package, MessageCircle, ShieldCheck } from "lucide-react";

export function PerksStrip() {
  const perks = [
    {
      icon: Truck,
      title: "Fast Lahore Dispatch",
      subtitle: "Same-day delivery across Lahore",
      href: undefined,
    },
    {
      icon: Package,
      title: "Direct Carton Rates",
      subtitle: "Wholesale prices with clear MOQs",
      href: "/rate-list",
    },
    {
      icon: MessageCircle,
      title: "Instant WhatsApp Desk",
      subtitle: "Direct support & bulk quotations",
      href: "https://wa.me/923258166829?text=Hi%20Pak%20Multilinks%2C%20I%20am%20inquiring%20about%20wholesale%20supplies",
      external: true,
    },
    {
      icon: ShieldCheck,
      title: "100% Genuine Brands",
      subtitle: "Original sealed factory cartons",
      href: "/shop",
    },
  ];

  return (
    <section className="border-b border-line bg-surface-soft/40 py-3 sm:py-4">
      <div className="site-shell">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 sm:gap-3">
          {perks.map((perk) => {
            const Icon = perk.icon;
            const content = (
              <>
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#0f4c3a]/10 text-[#0f4c3a] dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-accent truncate">
                    {perk.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted truncate">
                    {perk.subtitle}
                  </p>
                </div>
              </>
            );

            const className =
              "flex items-center gap-3 rounded-xl border-0 bg-surface px-3.5 py-3 shadow-2xs transition hover:shadow-sm hover:bg-surface-soft";

            if (perk.href) {
              if (perk.external) {
                return (
                  <a
                    key={perk.title}
                    href={perk.href}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={perk.title}
                  href={perk.href}
                  className={className}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={perk.title} className={className}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
