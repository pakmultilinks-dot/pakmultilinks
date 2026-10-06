import type { Product } from "@/lib/types";
import { company } from "@/lib/company";
import { minimumCartons } from "@/lib/utils";

export type CategoryVisualMeta = {
  id: string;
  slug: string;
  name: string;
  urduName?: string;
  image: string;
  tagline: string;
  badge: string;
  accentColor: string;
  bgLight: string;
  borderColor: string;
};

export const VISUAL_CATEGORIES: CategoryVisualMeta[] = [
  {
    id: "cat-paper",
    slug: "tissue-paper-products",
    name: "Tissue Products",
    urduName: "ٹشو پروڈکٹس",
    image: "/images/products/tissue.svg",
    tagline: "Pop-Up, Facial Tissues, Rolls & Napkins",
    badge: "Best Seller",
    accentColor: "#17643a",
    bgLight: "#f4f9f5",
    borderColor: "#cde4d3",
  },
  {
    id: "cat-cleaning",
    slug: "cleaning-products",
    name: "Cleaning Products",
    urduName: "کلیننگ کیمیکلز",
    image: "/images/products/floor-cleaner.svg",
    tagline: "Floor Cleaners, Sprays & Surface Care",
    badge: "Bulk Stock",
    accentColor: "#1d6a8a",
    bgLight: "#f0f8fb",
    borderColor: "#cde7f2",
  },
  {
    id: "cat-washroom",
    slug: "washroom-supplies",
    name: "Washroom Supplies",
    urduName: "واش روم سپلائیز",
    image: "/images/products/hand-wash.svg",
    tagline: "Hand Wash, Sanitizers & Soaps",
    badge: "Commercial 5L",
    accentColor: "#2a735e",
    bgLight: "#f2f8f6",
    borderColor: "#c8e6dc",
  },
  {
    id: "cat-disposable",
    slug: "disposable-items",
    name: "Garbage Bags & Disposables",
    urduName: "گاربیج بیگز",
    image: "/images/products/garbage-bags.svg",
    tagline: "Heavy-Duty Trash Bags, Gloves & Aprons",
    badge: "Heavy Duty",
    accentColor: "#7c5822",
    bgLight: "#fcf8f2",
    borderColor: "#ebdcc5",
  },
  {
    id: "cat-mops",
    slug: "floor-surface-care",
    name: "Mops & Cleaning Tools",
    urduName: "موپس اور ٹولز",
    image: "/images/products/mop.svg",
    tagline: "Industrial Mops, Microfiber Cloths & Wipers",
    badge: "Long Lasting",
    accentColor: "#235c43",
    bgLight: "#f2f7f4",
    borderColor: "#cde1d5",
  },
  {
    id: "cat-dispensers",
    slug: "dispensers",
    name: "Dispensers & Hardware",
    urduName: "ڈسپنسرز",
    image: "/images/products/dispenser.svg",
    tagline: "Automatic & Manual Soap/Tissue Dispensers",
    badge: "Commercial Grade",
    accentColor: "#475569",
    bgLight: "#f8fafc",
    borderColor: "#cbd5e1",
  },
];

export function getCategoryVisualMeta(slugOrName: string): CategoryVisualMeta {
  const clean = slugOrName.toLowerCase();
  const found = VISUAL_CATEGORIES.find(
    (c) => c.slug === clean || c.name.toLowerCase() === clean || clean.includes(c.slug),
  );
  if (found) return found;

  if (clean.includes("clean") || clean.includes("floor") || clean.includes("spray")) {
    return VISUAL_CATEGORIES[1];
  }
  if (clean.includes("wash") || clean.includes("soap") || clean.includes("sanitiz")) {
    return VISUAL_CATEGORIES[2];
  }
  if (clean.includes("bag") || clean.includes("dispos") || clean.includes("glove")) {
    return VISUAL_CATEGORIES[3];
  }
  if (clean.includes("mop") || clean.includes("cloth") || clean.includes("tool")) {
    return VISUAL_CATEGORIES[4];
  }
  if (clean.includes("dispens")) {
    return VISUAL_CATEGORIES[5];
  }
  return VISUAL_CATEGORIES[0];
}

export function getProductImage(product: Partial<Product>): string {
  if (product.image && product.image.trim() !== "") {
    return product.image;
  }
  if (product.gallery && product.gallery.length > 0 && product.gallery[0]) {
    return product.gallery[0];
  }

  const name = (product.name || "").toLowerCase();
  const cat = (product.categorySlug || product.category || "").toLowerCase();

  if (name.includes("mop") || cat.includes("mop")) return "/images/products/mop.svg";
  if (name.includes("cloth") || name.includes("wipe")) return "/images/products/cloth.svg";
  if (name.includes("glove")) return "/images/products/gloves.svg";
  if (name.includes("bag") || name.includes("garbage") || cat.includes("bag")) return "/images/products/garbage-bags.svg";
  if (name.includes("dispens") || cat.includes("dispens")) return "/images/products/dispenser.svg";
  if (name.includes("sanitiz")) return "/images/products/sanitizer.svg";
  if (name.includes("spray")) return "/images/products/spray.svg";
  if (name.includes("floor") || name.includes("cleaner") || cat.includes("clean")) return "/images/products/floor-cleaner.svg";
  if (name.includes("hand") || name.includes("wash") || name.includes("soap") || cat.includes("wash")) return "/images/products/hand-wash.svg";

  return "/images/products/tissue.svg";
}

export function buildProductWhatsAppUrl(product: Product, quantity?: number): string {
  const number = company.whatsapp || "923006917385";
  const qty = quantity ?? minimumCartons(product);
  const text = `Assalam-o-Alaikum Pak Multilinks,\n\nI want to order / inquire about this product:\n- Product: ${product.name}\n- SKU: ${product.sku}\n- Quantity: ${qty} carton(s)\n- Category: ${product.category}\n\nPlease share price quotation and delivery details. Thank you!`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildDirectWhatsAppUrl(customMessage?: string): string {
  const number = company.whatsapp || "923006917385";
  const text = customMessage || "Assalam-o-Alaikum Pak Multilinks, I need a bulk price quotation for hygiene & tissue products. Please guide me.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export const CORPORATE_SERVICES = [
  {
    id: "srv-bulk-delivery",
    title: "Doorstep Bulk Delivery",
    subtitle: "Fast supply in Lahore",
    description: "Reliable carton delivery directly to your office, factory, hotel or clinic without delay.",
    icon: "Truck",
    tag: "Free Lahore Delivery*",
  },
  {
    id: "srv-contracts",
    title: "Corporate Restocking",
    subtitle: "Scheduled monthly supplies",
    description: "Never run out of tissues, hand wash or cleaning essentials with our recurring supply plans.",
    icon: "CalendarCheck",
    tag: "Contract Discount",
  },
  {
    id: "srv-quotation",
    title: "Instant WhatsApp Quotation",
    subtitle: "Send list, get quote in mins",
    description: "Just WhatsApp your list or Bill of Quantities (BOQ). Our sales team replies with wholesale carton rates.",
    icon: "MessageSquareQuote",
    tag: "Direct Sales Head",
  },
  {
    id: "srv-custom-dispensers",
    title: "Dispensers & Hardware Setup",
    subtitle: "Wall mounted & automatic",
    description: "Complete washroom hardware solutions with matching wholesale refill supplies.",
    icon: "Wrench",
    tag: "Complete Setup",
  },
];
