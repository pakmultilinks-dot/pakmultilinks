import type { Category, Product } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-paper",
    name: "Tissue & Paper Wholesale",
    slug: "tissue-paper-products",
    description: "Carton-based tissue and paper supplies for businesses and institutions.",
    icon: "PackageCheck",
    tone: "sand",
  },
  {
    id: "cat-washroom",
    name: "Washroom Supplies",
    slug: "washroom-supplies",
    description: "Hand wash, sanitizers and washroom hygiene essentials by carton.",
    icon: "Droplets",
    tone: "mint",
  },
  {
    id: "cat-cleaning",
    name: "Cleaning Products",
    slug: "cleaning-products",
    description: "Floor cleaners, sprays and professional cleaning solutions.",
    icon: "Sparkles",
    tone: "sky",
  },
  {
    id: "cat-personal",
    name: "Personal Care",
    slug: "personal-care",
    description: "Soaps, hand wash and personal hygiene products for bulk supply.",
    icon: "Heart",
    tone: "rose",
  },
  {
    id: "cat-disposable",
    name: "Disposable Items",
    slug: "disposable-items",
    description: "Garbage bags, gloves and single-use hygiene disposables.",
    icon: "Trash2",
    tone: "amber",
  },
];

// Two-level collection structure; packing and prices are managed separately.
categories.push(
  { id: "cat-facial", parentId: "cat-paper", name: "Facial Tissues", slug: "facial-tissues", description: "Boxed tissues and pop-up packs for everyday use.", icon: "PackageCheck", tone: "sand" },
  { id: "cat-soft", parentId: "cat-paper", name: "Soft Pack Tissues", slug: "soft-pack-tissues", description: "Soft pack tissues supplied by the carton.", icon: "PackageCheck", tone: "sand" },
  { id: "cat-rolls", parentId: "cat-paper", name: "Tissue Rolls", slug: "tissue-rolls", description: "Paper rolls for washrooms and shared facilities.", icon: "PackageCheck", tone: "sand" },
  { id: "cat-napkins", parentId: "cat-paper", name: "Paper Napkins", slug: "paper-napkins", description: "Paper essentials for tables, pantries and food service.", icon: "PackageCheck", tone: "sand" },
  { id: "cat-handwash", parentId: "cat-washroom", name: "Hand Wash", slug: "hand-wash", description: "Hand wash for washrooms and everyday care.", icon: "Droplets", tone: "mint" },
  { id: "cat-dispensers", parentId: "cat-washroom", name: "Dispensers", slug: "dispensers", description: "Dispensers for shared washrooms and workplaces.", icon: "Droplets", tone: "mint" },
  { id: "cat-floor", parentId: "cat-cleaning", name: "Floor & Surface Care", slug: "floor-surface-care", description: "Cleaning supplies for floors and everyday surfaces.", icon: "Sparkles", tone: "sky" },
  { id: "cat-bags", parentId: "cat-disposable", name: "Garbage Bags", slug: "garbage-bags", description: "Waste bags for everyday workplace requirements.", icon: "Trash2", tone: "sand" },
);

const sharedProduct = {
  category: "Tissue & Paper Wholesale",
  categorySlug: "tissue-paper-products",
  brand: "Unbranded",
  price: 0,
  priceOnRequest: true,
  unitsPerCarton: 0,
  minimumOrderCartons: 1,
  stock: 0,
  lowStockThreshold: 5,
  bulkPricing: true,
  allowBackorder: true,
  image: "",
  gallery: [],
  description:
    "Supplied in wholesale cartons for commercial requirements. Carton packing, availability and price are confirmed by Pak Multilinks before the order is finalized.",
  attributes: [
    { name: "Supply unit", value: "Carton" },
    { name: "Inner quantity", value: "To be confirmed" },
    { name: "Pricing", value: "Bulk quotation" },
  ],
} satisfies Omit<
  Product,
  "id" | "slug" | "name" | "sku" | "shortDescription"
>;

// Names are transcribed from the business-provided handwritten list.
// Packing counts and prices remain intentionally unclaimed until entered in Admin.
export const products: Product[] = [
  {
    ...sharedProduct,
    id: "prod-pop-up",
    slug: "pop-up",
    name: "Pop Up",
    category: "Facial Tissues",
    categorySlug: "facial-tissues",
    parentCategorySlug: "tissue-paper-products",
    sku: "DEMO-POP-UP",
    shortDescription: "Wholesale Pop Up tissue supplied by carton.",
    featured: true,
    bestSeller: true,
  },
  {
    ...sharedProduct,
    id: "prod-pantry-pack",
    slug: "pantry-pack",
    name: "Pantry Pack",
    sku: "DEMO-PANTRY-PACK",
    shortDescription: "Pantry Pack supplied for bulk commercial requirements.",
    featured: true,
  },
  {
    ...sharedProduct,
    id: "prod-pantry-white",
    slug: "pantry-white",
    name: "Pantry White",
    sku: "DEMO-PANTRY-WHITE",
    shortDescription: "Pantry White product available in wholesale cartons.",
    featured: true,
  },
  {
    ...sharedProduct,
    id: "prod-mambo-roll",
    slug: "mambo-roll",
    name: "Mambo Roll",
    category: "Tissue Rolls",
    categorySlug: "tissue-rolls",
    parentCategorySlug: "tissue-paper-products",
    sku: "DEMO-MAMBO-ROLL",
    shortDescription: "Mambo Roll supplied carton-wise for business customers.",
    featured: true,
  },
  {
    ...sharedProduct,
    id: "prod-mambo-8-plus-2",
    slug: "mambo-8-plus-2",
    name: "Mambo 8+2",
    sku: "DEMO-MAMBO-8-2",
    shortDescription: "Mambo 8+2 supplied as a wholesale carton product.",
  },
  {
    ...sharedProduct,
    id: "prod-soft-pack-p",
    slug: "soft-pack-p",
    name: "Soft Pack P",
    category: "Soft Pack Tissues",
    categorySlug: "soft-pack-tissues",
    parentCategorySlug: "tissue-paper-products",
    sku: "DEMO-SOFT-PACK-P",
    shortDescription: "Soft Pack P available for carton-based bulk supply.",
  },
  {
    ...sharedProduct,
    id: "prod-soft-pack-regular",
    slug: "soft-pack-regular",
    name: "Soft Pack Regular",
    category: "Soft Pack Tissues",
    categorySlug: "soft-pack-tissues",
    parentCategorySlug: "tissue-paper-products",
    sku: "DEMO-SOFT-PACK-REG",
    shortDescription: "Soft Pack Regular supplied in wholesale cartons.",
  },
];

export const featuredProducts = products.filter((product) => product.featured);
export const brands = [...new Set(products.map((product) => product.brand))];

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getPrice(product: Product) {
  return product.salePrice ?? product.price;
}
