import { z } from "zod";

export function cleanText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const text = (min: number, max: number) => z.string().transform(cleanText).pipe(z.string().min(min).max(max));
const optionalText = (max: number) => z.string().transform(cleanText).pipe(z.string().max(max)).optional().or(z.literal(""));
const email = z.string().trim().toLowerCase().email().max(254);
const phone = z
  .string()
  .transform(cleanText)
  .pipe(z.string().min(7).max(24).regex(/^\+?[0-9()\-\s]+$/, "Enter a valid phone number"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(128),
});

export const registerSchema = z.object({
  name: text(2, 100),
  email,
  phone: phone.optional(),
  password: z.string().min(10).max(128),
});

export const forgotPasswordSchema = z.object({ email });
export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(256),
  password: z.string().min(10).max(128),
});

export const profileSchema = z.object({
  name: text(2, 100),
  phone: phone.optional().or(z.literal("")),
});

export const addressSchema = z.object({
  label: text(1, 40).default("Delivery"),
  fullName: text(2, 100),
  phone,
  company: optionalText(120),
  province: text(2, 80),
  city: text(2, 80),
  line1: text(5, 300),
  postalCode: optionalText(20),
  isDefault: z.boolean().default(false),
});

export const accountAddressSchema = z.object({
  label: text(1, 40).default("Delivery"),
  address: text(5, 300),
  city: text(2, 80),
  province: text(2, 80),
  isDefault: z.boolean().default(false),
  fullName: text(2, 100).optional(),
  phone: phone.optional(),
  company: optionalText(120),
  postalCode: optionalText(20),
});

const orderItemSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().int().min(1).max(10_000),
});

export const orderCreateSchema = z.object({
  customer: z.object({
    fullName: text(2, 100),
    phone,
    email,
    companyName: optionalText(120),
    ntn: optionalText(30),
    province: text(2, 80),
    city: text(2, 80),
    address: text(5, 300),
    postalCode: optionalText(20),
    notes: optionalText(1_000),
  }),
  paymentMethod: z.enum(["Cash on Delivery", "Bank Transfer", "CASH_ON_DELIVERY", "BANK_TRANSFER"]),
  items: z.array(orderItemSchema).min(1).max(50),
  clientSubtotal: z.coerce.number().nonnegative().max(100_000_000).optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["PENDING", "AWAITING_TRANSFER", "PAID", "FAILED", "REFUNDED"]).optional(),
});

const quoteItemSchema = z.object({
  productId: z.string().trim().max(80).optional(),
  product: text(2, 180),
  quantity: z.coerce.number().int().min(1).max(100_000),
  details: optionalText(500),
});

export const quoteCreateSchema = z.object({
  customerName: text(2, 100),
  companyName: text(2, 140),
  phone,
  email,
  city: text(2, 80),
  items: z.array(quoteItemSchema).min(1).max(30),
  notes: optionalText(2_000),
});

export const quoteStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "WON", "LOST"]),
  adminNotes: optionalText(2_000),
});

const slug = z.string().trim().toLowerCase().min(2).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const urlOrPath = z.string().trim().max(500).refine((v) => v.startsWith("/") || /^https:\/\//.test(v), "Use an HTTPS URL or local path");
const httpsUrl = z.string().trim().url().max(500).refine((value) => value.startsWith("https://"), "Use an HTTPS URL");

export const productInputSchema = z
  .object({
    name: text(2, 160),
    slug,
    sku: z.string().trim().toUpperCase().min(2).max(80).regex(/^[A-Z0-9._-]+$/),
    shortDescription: optionalText(300),
    description: text(10, 5_000),
    price: z.coerce.number().nonnegative().max(100_000_000),
    salePrice: z.coerce.number().nonnegative().max(100_000_000).nullable().optional(),
    priceOnRequest: z.boolean().default(false),
    unitsPerCarton: z.coerce.number().int().min(0).max(1_000_000).default(0),
    minimumOrderCartons: z.coerce.number().int().min(1).max(100_000).default(1),
    stock: z.coerce.number().int().min(0).max(10_000_000),
    lowStockThreshold: z.coerce.number().int().min(0).max(1_000_000).default(5),
    allowBackorder: z.boolean().default(false),
    featured: z.boolean().default(false),
    bestSeller: z.boolean().default(false),
    bulkPricing: z.boolean().default(false),
    status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
    categoryId: z.string().min(1).max(80),
    brandId: z.string().min(1).max(80).nullable().optional(),
    images: z.array(z.object({ url: urlOrPath, alt: optionalText(160) })).max(12).default([]),
    attributes: z.array(z.object({ name: text(1, 80), value: text(1, 240) })).max(30).default([]),
  })
  .refine((data) => data.salePrice == null || data.salePrice <= data.price, {
    path: ["salePrice"],
    message: "Sale price cannot be greater than the regular price",
  });

export const categoryInputSchema = z.object({
  name: text(2, 100),
  slug,
  description: optionalText(500),
  imageUrl: urlOrPath.nullable().optional(),
  icon: optionalText(80),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
});

export const brandInputSchema = z.object({
  name: text(2, 100),
  slug,
  logoUrl: urlOrPath.nullable().optional(),
  isActive: z.boolean().default(true),
});

export const dealBannerInputSchema = z.object({
  title: text(2, 120),
  imageUrl: urlOrPath,
  alt: optionalText(180),
  linkUrl: urlOrPath.nullable().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(10_000).default(0),
  isActive: z.boolean().default(true),
});

export const settingsInputSchema = z.object({
  businessName: text(2, 140),
  subtitle: text(2, 140),
  tagline: text(2, 180),
  logoUrl: urlOrPath.nullable().optional(),
  phone,
  email,
  address: text(5, 300),
  whatsapp: z.string().trim().regex(/^\d{10,15}$/).nullable().optional().or(z.literal("")),
  currency: z.string().trim().toUpperCase().length(3),
  taxRate: z.coerce.number().min(0).max(100),
  bankTransferEnabled: z.boolean().default(false),
  deliveryInformation: optionalText(1_000),
  announcement: optionalText(300),
  homepageBannerUrl: urlOrPath.nullable().optional(),
  facebookUrl: httpsUrl.nullable().optional().or(z.literal("")),
  instagramUrl: httpsUrl.nullable().optional().or(z.literal("")),
  linkedinUrl: httpsUrl.nullable().optional().or(z.literal("")),
});

export function validationError(error: z.ZodError) {
  return {
    error: "Please check the highlighted information.",
    issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
  };
}
