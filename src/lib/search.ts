/**
 * Smart Search Engine for Pak Multilinks Hygiene
 * Features:
 * - Damerau-Levenshtein distance (typo tolerance for 1-2 character edits and transpositions)
 * - Phonetic & Pakistani market trade dictionary (e.g. "patel" -> "petal", "tissu" -> "tissue", "fenyl" -> "phenyl")
 * - Space-insensitive matching ("rosepetal" <-> "Rose Petal", "handwash" <-> "Hand Wash")
 * - Multi-word order-independent matching
 * - Token prefix & substring matching
 * - Brand and category direct detection
 * - Weighted relevance scoring
 */

export type SearchableItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: string;
  categorySlug?: string;
  parentCategorySlug?: string;
  shortDescription?: string | null;
  description?: string | null;
  image?: string;
  price?: number;
  salePrice?: number | null;
  priceOnRequest?: boolean;
  stock?: number;
  featured?: boolean;
  bestSeller?: boolean;
  attributes?: { name: string; value: string }[];
  [key: string]: unknown;
};

export type SearchMatch<T> = {
  item: T;
  score: number;
  matchedTokens: number;
};

export type BrandMatch = {
  name: string;
  count: number;
  slug?: string;
};

export type CategoryMatch = {
  id?: string;
  name: string;
  slug: string;
  count?: number;
};

export type SearchAnalysis<T> = {
  matches: SearchMatch<T>[];
  totalMatches: number;
  matchingBrands: BrandMatch[];
  matchingCategories: CategoryMatch[];
  correctedQuery?: string;
};

/**
 * Common typo, phonetic and colloquial synonym dictionary for wholesale hygiene supplies.
 */
export const SYNONYMS: Record<string, string> = {
  // Brand spelling mistakes
  patel: "petal",
  patal: "petal",
  petel: "petal",
  patail: "petal",
  peta: "petal",
  rosepatel: "rose petal",
  rosepetal: "rose petal",
  nazomi: "nozomi",
  nozmi: "nozomi",
  nozome: "nozomi",
  hijeen: "hi-jeen",
  hygeen: "hi-jeen",
  hyeen: "hi-jeen",
  zoop: "zzoop",
  zop: "zzoop",
  germcure: "germi cure germicure",
  germicure: "germi cure germicure",
  germacure: "germi cure germicure",
  shinewl: "shine well shinewell",
  shinewell: "shine well shinewell",
  airnergi: "airnergy",
  airenergy: "airnergy",
  suprsoft: "super soft supersoft",
  supersoft: "super soft supersoft",
  pakmultilinks: "pak multilinks",

  // Tissue & Paper variations
  tissu: "tissue",
  tishue: "tissue",
  tisho: "tissue",
  tishoo: "tissue",
  tisue: "tissue",
  tissues: "tissue",
  facal: "facial",
  feshal: "facial",
  fashial: "facial",
  feyshal: "facial",
  facials: "facial",
  toilt: "toilet",
  tolet: "toilet",
  toilete: "toilet",
  toylit: "toilet",
  latrine: "toilet",
  washroom: "toilet washroom",
  bathroom: "toilet bathroom",
  towal: "towel",
  towle: "towel",
  tawal: "towel",
  tawle: "towel",
  towels: "towel",
  nepkin: "napkin",
  napken: "napkin",
  napkins: "napkin",
  rol: "roll",
  role: "roll",
  roles: "roll",
  rolls: "roll",
  maxiroll: "maxi roll",
  jumboroll: "jumbo roll",
  autocut: "autocut",
  autocutt: "autocut",
  interfold: "interfold",
  cfold: "c-fold",
  zfold: "z-fold",

  // Dispensers
  dispensor: "dispenser",
  despenser: "dispenser",
  dispensar: "dispenser",
  dispensers: "dispenser",

  // Cleaning & Chemicals
  fenyl: "phenyl",
  finyle: "phenyl",
  finayl: "phenyl",
  phynel: "phenyl",
  phenyle: "phenyl",
  phenil: "phenyl",
  sanitizer: "sanitizer hand wash",
  sanitiser: "sanitizer hand wash",
  santizer: "sanitizer hand wash",
  senitizer: "sanitizer hand wash",
  senitiser: "sanitizer hand wash",
  sanitize: "sanitizer hand wash",
  harpec: "harpic",
  harpek: "harpic",
  harpicc: "harpic",
  detol: "dettol",
  detole: "dettol",
  blech: "bleach",
  blench: "bleach",
  clenar: "cleaner",
  cleanar: "cleaner",
  cleaning: "cleaner",
  detergant: "detergent",
  surf: "detergent",
  liquid: "liquid",
  likwid: "liquid",

  // Soaps & Personal care
  handwash: "hand wash",
  hendwash: "hand wash",
  handwasher: "hand wash",
  sop: "soap",
  sope: "soap",
  sabun: "soap",
  saabon: "soap",

  // Wipers, Mops & Dusters
  viper: "wiper",
  wyper: "wiper",
  vipper: "wiper",
  wipers: "wiper",
  mope: "mop",
  pocha: "mop",
  pochha: "mop",
  dastor: "duster",
  dustor: "duster",
  dusters: "duster",
  microfiber: "duster microfiber",

  // Trash & Garbage
  gerbage: "garbage",
  trash: "garbage",
  kachra: "garbage",
  koora: "garbage",
  shopper: "garbage",
  dustbin: "garbage",

  // Packaging & Quantities
  cartun: "carton",
  karton: "carton",
  peti: "carton",
  plai: "ply",
  plys: "ply",
};

/**
 * Calculates Damerau-Levenshtein distance between two strings.
 * Accounts for insertion, deletion, substitution and transposition of adjacent characters.
 */
export function damerauLevenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  if (a === b) return 0;

  const d: number[][] = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0));
  for (let i = 0; i <= la; i++) d[i][0] = i;
  for (let j = 0; j <= lb; j++) d[0][j] = j;

  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1); // transposition
      }
    }
  }
  return d[la][lb];
}

/**
 * Normalizes text: lowercases, cleans punctuation and applies trade synonym expansions.
 */
export function normalizeSearchQuery(query: string): { tokens: string[]; normalizedQuery: string; hasCorrection: boolean } {
  const rawWords = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/[\s-]+/)
    .filter(Boolean);

  let hasCorrection = false;
  const tokens: string[] = [];

  for (const word of rawWords) {
    const clean = word.replace(/[^a-z0-9]/g, "");
    if (!clean) continue;
    if (SYNONYMS[clean]) {
      hasCorrection = true;
      const mapped = SYNONYMS[clean].split(/\s+/);
      tokens.push(...mapped);
    } else {
      tokens.push(clean);
    }
  }

  return {
    tokens,
    normalizedQuery: tokens.join(" "),
    hasCorrection,
  };
}

/**
 * Searches a catalog of products with intelligent scoring, typo tolerance and brand/category detection.
 */
export function searchCatalog<T extends SearchableItem>(
  products: T[],
  query: string,
  categories?: { name: string; slug: string; id?: string; parentId?: string | null }[],
): SearchAnalysis<T> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      matches: products.map((item) => ({ item, score: 0, matchedTokens: 0 })),
      totalMatches: products.length,
      matchingBrands: [],
      matchingCategories: [],
    };
  }

  const { tokens, normalizedQuery, hasCorrection } = normalizeSearchQuery(trimmed);
  if (tokens.length === 0) {
    return {
      matches: [],
      totalMatches: 0,
      matchingBrands: [],
      matchingCategories: [],
    };
  }

  const compactQuery = normalizedQuery.replace(/[^a-z0-9]/g, "");
  const matches: SearchMatch<T>[] = [];
  const brandScores = new Map<string, { score: number; count: number }>();
  const categoryScores = new Map<string, { name: string; slug: string; score: number; count: number }>();

  // Extract all available brands
  for (const product of products) {
    const b = product.brand?.trim();
    if (b && b.toLowerCase() !== "unbranded") {
      if (!brandScores.has(b)) {
        brandScores.set(b, { score: 0, count: 0 });
      }
      brandScores.get(b)!.count += 1;
    }
  }

  const categoryList = categories || [];

  for (const product of products) {
    const name = (product.name || "").toLowerCase();
    const brand = (product.brand || "").toLowerCase();
    const category = (product.category || "").toLowerCase();
    const sku = (product.sku || "").toLowerCase();
    const desc = `${product.description || ""} ${product.shortDescription || ""}`.toLowerCase();
    const attributes = (product.attributes || []).map((a) => `${a.name} ${a.value}`).join(" ").toLowerCase();

    const nameClean = name.replace(/[^a-z0-9]/g, "");
    const brandClean = brand.replace(/[^a-z0-9]/g, "");
    const categoryClean = category.replace(/[^a-z0-9]/g, "");
    const skuClean = sku.replace(/[^a-z0-9]/g, "");

    const nameWords = name.split(/[^a-z0-9]+/).filter(Boolean);
    const brandWords = brand.split(/[^a-z0-9]+/).filter(Boolean);
    const catWords = category.split(/[^a-z0-9]+/).filter(Boolean);

    let score = 0;
    let matchedTokens = 0;

    // 1. Exact phrase matches (highest priority)
    if (name.includes(normalizedQuery) || nameClean.includes(compactQuery)) score += 900;
    if (brand.includes(normalizedQuery) || brandClean.includes(compactQuery)) score += 800;
    if (category.includes(normalizedQuery) || categoryClean.includes(compactQuery)) score += 600;
    if (sku.includes(normalizedQuery) || skuClean.includes(compactQuery)) score += 700;

    // 2. Token by token evaluation
    for (const t of tokens) {
      let tokenMatched = false;

      // Exact or partial SKU match
      if (sku === t || skuClean === t) {
        score += 600;
        tokenMatched = true;
      } else if (sku.includes(t) || skuClean.includes(t)) {
        score += 400;
        tokenMatched = true;
      }

      // Brand exact, clean or fuzzy match
      if (brand === t || brand.includes(t) || brandClean.includes(t)) {
        score += 450;
        tokenMatched = true;
      } else {
        if (damerauLevenshtein(t, brandClean) <= (t.length > 5 ? 2 : t.length >= 3 ? 1 : 0)) {
          score += 350;
          tokenMatched = true;
        } else {
          for (const bw of brandWords) {
            const maxDist = bw.length > 5 ? 2 : bw.length >= 3 ? 1 : 0;
            if (damerauLevenshtein(t, bw) <= maxDist) {
              score += 300;
              tokenMatched = true;
              break;
            }
          }
        }
      }

      // Name exact word, clean, prefix, or fuzzy match
      if (name.includes(t) || nameClean.includes(t)) {
        score += 350;
        tokenMatched = true;
      } else {
        for (const nw of nameWords) {
          if (nw.startsWith(t)) {
            score += 220;
            tokenMatched = true;
            break;
          }
          const maxDist = nw.length > 5 ? 2 : nw.length >= 3 ? 1 : 0;
          if (damerauLevenshtein(t, nw) <= maxDist) {
            score += 180;
            tokenMatched = true;
            break;
          }
        }
      }

      // Category match
      if (category.includes(t) || categoryClean.includes(t)) {
        score += 200;
        tokenMatched = true;
      } else {
        for (const cw of catWords) {
          const maxDist = cw.length > 5 ? 2 : cw.length >= 3 ? 1 : 0;
          if (damerauLevenshtein(t, cw) <= maxDist) {
            score += 140;
            tokenMatched = true;
            break;
          }
        }
      }

      // Description & attributes match
      if (desc.includes(t)) {
        score += 60;
        tokenMatched = true;
      }
      if (attributes.includes(t)) {
        score += 50;
        tokenMatched = true;
      }

      if (tokenMatched) matchedTokens++;
    }

    // Completeness bonus: when all query tokens matched
    if (tokens.length > 1 && matchedTokens === tokens.length) {
      score += 400;
    } else if (matchedTokens > 0) {
      score += Math.round((matchedTokens / tokens.length) * 150);
    }

    // Minimum qualification threshold
    if (score >= 60 || (tokens.length === 1 && matchedTokens > 0)) {
      matches.push({ item: product, score, matchedTokens });

      // Track brand score
      const originalBrand = product.brand?.trim();
      if (originalBrand && brandScores.has(originalBrand)) {
        brandScores.get(originalBrand)!.score += score;
      }

      // Track category score
      const originalCat = product.category?.trim();
      if (originalCat) {
        if (!categoryScores.has(originalCat)) {
          const foundMeta = categoryList.find(
            (c) => c.name.toLowerCase() === originalCat.toLowerCase() || c.slug === product.categorySlug,
          );
          categoryScores.set(originalCat, {
            name: originalCat,
            slug: foundMeta?.slug || product.categorySlug || originalCat.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            score: 0,
            count: 0,
          });
        }
        const record = categoryScores.get(originalCat)!;
        record.score += score;
        record.count += 1;
      }
    }
  }

  // Sort by relevance score descending
  matches.sort((a, b) => b.score - a.score);

  // Extract top matching brands
  const matchingBrands: BrandMatch[] = Array.from(brandScores.entries())
    .filter(([, data]) => data.score > 200)
    .sort((a, b) => b[1].score - a[1].score)
    .map(([name, data]) => ({ name, count: data.count }))
    .slice(0, 3);

  // Extract top matching categories
  const matchingCategories: CategoryMatch[] = Array.from(categoryScores.values())
    .filter((data) => data.score > 150)
    .sort((a, b) => b.score - a.score)
    .map((data) => ({ name: data.name, slug: data.slug, count: data.count }))
    .slice(0, 3);

  // Suggested correction message (e.g. "Rose Petal")
  let correctedQuery: string | undefined;
  if (hasCorrection || matchingBrands.length > 0) {
    if (matchingBrands.length > 0 && normalizedQuery.includes(matchingBrands[0].name.toLowerCase())) {
      correctedQuery = matchingBrands[0].name;
    } else if (hasCorrection) {
      correctedQuery = normalizedQuery;
    }
  }

  return {
    matches,
    totalMatches: matches.length,
    matchingBrands,
    matchingCategories,
    correctedQuery,
  };
}
