export type ProductAttribute = {
  name: string;
  value: string;
};

export type Category = {
  parentId?: string | null;
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tone: string;
  updatedAt?: string;
};

export type ProductVariant = {
  id: string;
  productId: string;
  label: string;
  sku: string;
  price: number;
  salePrice?: number;
  unitsPerCarton: number;
  minimumOrderCartons: number;
  stock: number;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  parentCategorySlug?: string;
  brand: string;
  price: number;
  salePrice?: number;
  priceOnRequest: boolean;
  unitsPerCarton: number;
  minimumOrderCartons: number;
  stock: number;
  lowStockThreshold: number;
  featured?: boolean;
  bestSeller?: boolean;
  bulkPricing?: boolean;
  allowBackorder?: boolean;
  image: string;
  imageAlt?: string;
  gallery: string[];
  updatedAt?: string;
  attributes: ProductAttribute[];
  variants?: ProductVariant[];
};

export type CartItem = {
  product: Product;
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  variantSku?: string;
  variantPrice?: number;
  variantUnitsPerCarton?: number;
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type QuoteStatus = "New" | "Contacted" | "Quoted" | "Won" | "Lost";

export type CustomerDetails = {
  fullName: string;
  phone: string;
  email: string;
  companyName?: string;
  ntn?: string;
  province: string;
  city: string;
  address: string;
  postalCode?: string;
  notes?: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  customer: CustomerDetails;
  paymentMethod: "Cash on Delivery" | "Bank Transfer";
  subtotal: number;
  delivery: number | null;
  total: number;
  requiresQuote?: boolean;
  status: OrderStatus;
  createdAt: string;
};

export type QuoteItem = {
  product: string;
  quantity: number;
};

export type QuoteRequest = {
  id: string;
  customerName: string;
  companyName: string;
  phone: string;
  email: string;
  city: string;
  items: QuoteItem[];
  notes?: string;
  status: QuoteStatus;
  createdAt: string;
};

export type RateListFileRecord = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  category: string;
  documentType?: "RATE_LIST" | "CATALOGUE";
  coverStyle?: "HYGIENE" | "CLEANING" | "CUSTOM";
  coverImageUrl?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  pageCount?: number | null;
  isPrimary: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

