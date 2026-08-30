import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, center = false }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2 className="balance mt-3 text-3xl font-black tracking-[-0.035em] text-[#173c29] sm:text-4xl">{title}</h2>
    {description && <p className="pretty mt-4 text-base leading-7 text-[#64736a] sm:text-lg">{description}</p>}
  </div>;
}
