export type ProductAttribute = {
  name: string;
  value: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tone: string;
  updatedAt?: string;
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
};

export type CartItem = {
  product: Product;
  quantity: number;
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
  quantity: string;
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
