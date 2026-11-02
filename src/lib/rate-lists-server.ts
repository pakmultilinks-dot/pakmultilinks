import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import type { RateListFileRecord } from "@/lib/types";

let documentSchemaPromise: Promise<void> | undefined;

export function ensureDocumentLibrarySchema() {
  if (!isDatabaseConfigured) return Promise.resolve();
  documentSchemaPromise ??= (async () => {
    await db.$executeRawUnsafe('ALTER TABLE "RateListFile" ADD COLUMN IF NOT EXISTS "documentType" TEXT NOT NULL DEFAULT \'RATE_LIST\'');
    await db.$executeRawUnsafe('ALTER TABLE "RateListFile" ADD COLUMN IF NOT EXISTS "coverStyle" TEXT NOT NULL DEFAULT \'HYGIENE\'');
    await db.$executeRawUnsafe('ALTER TABLE "RateListFile" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT');
    await db.rateListFile.upsert({
      where: { slug: "wipers-cleaning-catalogue-no-prices" },
      update: {},
      create: {
        title: "Wipers & Cleaning Tools Catalogue",
        slug: "wipers-cleaning-catalogue-no-prices",
        description: "Fourteen-page product catalogue of floor wipers, cleaning tools and related commercial cleaning items. Prices are not included.",
        category: "Wipers & Cleaning Tools",
        documentType: "CATALOGUE",
        coverStyle: "CLEANING",
        coverImageUrl: "/images/catalogues/wipers-catalogue-cover.jpg",
        fileUrl: "/downloads/wipers-cleaning-catalogue-no-prices.pdf",
        fileName: "wipers-cleaning-catalogue-no-prices.pdf",
        fileSize: 22796455,
        pageCount: 14,
        isPrimary: false,
        isActive: true,
        sortOrder: 20,
      },
    });
  })().catch((error) => { documentSchemaPromise = undefined; throw error; });
  return documentSchemaPromise;
}

export const DEFAULT_RATE_LISTS: RateListFileRecord[] = [
  {
    id: "rate-list-master",
    title: "Pak Multilinks Master Wholesale Rate List 2026",
    slug: "pak-multilinks-master-wholesale-rate-list-2026",
    description: "Official complete master rate list for tissue papers, detergents, washroom hygiene, dispensers, and institutional cleaning supplies across Pakistan.",
    category: "Master Rate List",
    fileUrl: "/downloads/pak-multilinks-master-rate-list.pdf",
    fileName: "pak-multilinks-master-rate-list.pdf",
    fileSize: 793843,
    pageCount: 4,
    isPrimary: true,
    isActive: true,
    sortOrder: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-rose-petal",
    title: "Rose Petal Wholesale Rate List",
    slug: "rose-petal-wholesale-rate-list",
    description: "Complete wholesale carton pricing for Rose Petal Luxury, Pop-up, Party, Maxi Roll, and Facial Tissues.",
    category: "Rose Petal Tissues",
    fileUrl: "/downloads/rose-petal-rate-list.pdf",
    fileName: "rose-petal-rate-list.pdf",
    fileSize: 6113,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-fresco",
    title: "Fresco Aerosols & Fragrances Rate List",
    slug: "fresco-aerosols-fragrances-rate-list",
    description: "Automatic air freshener refill cans, body sprays, and perfume diffusers carton wholesale rates.",
    category: "Fresco & Aerosols",
    fileUrl: "/downloads/fresco-rate-list.pdf",
    fileName: "fresco-rate-list.pdf",
    fileSize: 4479,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 2,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-nozomi",
    title: "Nozomi Tissue & Commercial Paper Rate List",
    slug: "nozomi-tissue-commercial-paper-rate-list",
    description: "High-absorption Nozomi commercial towel rolls, m-fold hand towels, and napkins for businesses.",
    category: "Nozomi Tissues",
    fileUrl: "/downloads/nozomi-rate-list.pdf",
    fileName: "nozomi-rate-list.pdf",
    fileSize: 3736,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 3,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-germicure",
    title: "Germi Cure Dispensers & Sanitizers Rate List",
    slug: "germicure-dispensers-sanitizers-rate-list",
    description: "Hospital grade touchless sanitizers, manual soap dispensers, and surface disinfectants.",
    category: "Germi Cure",
    fileUrl: "/downloads/germicure-rate-list.pdf",
    fileName: "germicure-rate-list.pdf",
    fileSize: 2741,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-shinewell",
    title: "Shinewell Cleaning & Chemicals Rate List",
    slug: "shinewell-cleaning-chemicals-rate-list",
    description: "Industrial glass cleaners, floor cleaner concentrates, and heavy duty scouring solutions.",
    category: "Shine Well",
    fileUrl: "/downloads/shinewell-rate-list.pdf",
    fileName: "shinewell-rate-list.pdf",
    fileSize: 2546,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 5,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-sicura",
    title: "Sicura Food Grade Paper Cups Rate List",
    slug: "sicura-food-grade-paper-cups-rate-list",
    description: "Ripple wall hot cups, single wall paper tea cups, and takeaway drink lids.",
    category: "Paper & Disposables",
    fileUrl: "/downloads/sicura-rate-list.pdf",
    fileName: "sicura-rate-list.pdf",
    fileSize: 2752,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 6,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-softex",
    title: "Softex Commercial Paper Products Rate List",
    slug: "softex-commercial-paper-products-rate-list",
    description: "Economy toilet roll bundles, jumbo rolls, and bulk dining paper napkins.",
    category: "Paper & Disposables",
    fileUrl: "/downloads/softex-supersoft-rate-list.pdf",
    fileName: "softex-supersoft-rate-list.pdf",
    fileSize: 2999,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 7,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "rate-list-glad",
    title: "Glad Hygiene & Wrap Products Rate List",
    slug: "glad-hygiene-wrap-products-rate-list",
    description: "Cling wrap films, aluminium foil rolls, and heavy-duty food protection disposables.",
    category: "Disposables",
    fileUrl: "/downloads/glad-rate-list.pdf",
    fileName: "glad-rate-list.pdf",
    fileSize: 2354,
    pageCount: 1,
    isPrimary: false,
    isActive: true,
    sortOrder: 8,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function slugifyTitle(raw: string): string {
  const base = raw
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || `rate-list-${Date.now()}`;
}

export async function listAllRateListFiles(): Promise<RateListFileRecord[]> {
  if (!isDatabaseConfigured) return DEFAULT_RATE_LISTS;
  try {
    await ensureDocumentLibrarySchema();
    const rows = await withDatabaseRetry(() =>
      db.rateListFile.findMany({
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
    );
    if (rows.length === 0) return DEFAULT_RATE_LISTS;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      category: r.category,
      documentType: r.documentType as "RATE_LIST" | "CATALOGUE",
      coverStyle: r.coverStyle as "HYGIENE" | "CLEANING" | "CUSTOM",
      coverImageUrl: r.coverImageUrl,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: r.fileSize,
      pageCount: r.pageCount,
      isPrimary: r.isPrimary,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching rate list files from database:", error);
    return DEFAULT_RATE_LISTS;
  }
}

export async function listPublicRateLists(): Promise<RateListFileRecord[]> {
  if (!isDatabaseConfigured) return DEFAULT_RATE_LISTS.filter((r) => r.isActive);
  try {
    await ensureDocumentLibrarySchema();
    const rows = await withDatabaseRetry(() =>
      db.rateListFile.findMany({
        where: { isActive: true },
        orderBy: [
          { isPrimary: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
      }),
    );
    if (rows.length === 0) return DEFAULT_RATE_LISTS.filter((r) => r.isActive);
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      category: r.category,
      documentType: r.documentType as "RATE_LIST" | "CATALOGUE",
      coverStyle: r.coverStyle as "HYGIENE" | "CLEANING" | "CUSTOM",
      coverImageUrl: r.coverImageUrl,
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileSize: r.fileSize,
      pageCount: r.pageCount,
      isPrimary: r.isPrimary,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching public rate list files:", error);
    return DEFAULT_RATE_LISTS.filter((r) => r.isActive);
  }
}

export async function getPrimaryRateList(): Promise<RateListFileRecord> {
  const publicLists = await listPublicRateLists();
  const primary = publicLists.find((r) => r.isPrimary);
  return primary || publicLists[0] || DEFAULT_RATE_LISTS[0];
}
