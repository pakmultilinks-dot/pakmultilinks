import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, center = false }: { eyebrow?: string; title: string; description?: string; center?: boolean }) {
  return <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2 className="balance mt-3 font-serif text-2xl font-normal tracking-tight text-[#173c29] sm:text-3xl">{title}</h2>
    {description && <p className="pretty mt-4 text-sm leading-7 text-[#64736a] sm:text-base">{description}</p>}
  </div>;
}
