export interface BrandInfo {
  slug: string;
  name: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  introHeading: string;
  introParagraphs: string[];
  keyHighlights: { label: string; description: string }[];
  faqs: { question: string; answer: string }[];
}

export const BRAND_DATA: Record<string, BrandInfo> = {
  "rose-petal": {
    slug: "rose-petal",
    name: "Rose Petal",
    tagline: "Pakistan's #1 Tissue & Hygiene Brand",
    metaTitle: "Rose Petal Wholesale Supplies & Carton Rates in Lahore",
    metaDescription: "Buy original Rose Petal tissues, kitchen towels, napkins, and toilet rolls in bulk cartons at wholesale prices in Lahore. Fast delivery & GST invoicing.",
    introHeading: "Official Rose Petal Wholesale Supplies & Carton Rates in Lahore",
    introParagraphs: [
      "Rose Petal is Pakistan's undisputed market leader in premium tissue and personal hygiene products. Known for ultra-soft 100% virgin wood pulp, high absorbency, and consistent sheet quality, Rose Petal is the preferred brand for multinational corporate offices, 5-star hotels, healthcare clinics, and households across Lahore.",
      "At Pak Multilinks Hygiene, we supply the complete Rose Petal commercial and retail portfolio in factory-sealed master cartons. Whether you need classic Luxury and Pop-Up facial tissue boxes for executive desks, Zzoop high-absorbency maxi kitchen rolls for cafeterias, or Max Toilet Rolls for commercial restrooms, we maintain steady stock ready for dispatch from our Gulberg II facility.",
      "All Rose Petal products supplied by Pak Multilinks Hygiene are 100% original, verified directly from certified manufacturing lines, ensuring exact sheet count, proper ply thickness, and uncompromised hygiene integrity for your organization.",
    ],
    keyHighlights: [
      { label: "100% Virgin Wood Pulp", description: "Hypoallergenic, ultra-soft, and free from optical brightening agents." },
      { label: "Factory Master Cartons", description: "Standardized carton packing (30 to 48 pieces per carton) for easy inventory control." },
      { label: "Direct Lahore Wholesale Rates", description: "Tiered pricing specifically structured for procurement managers and commercial buyers." },
      { label: "Same-Day / Next-Day Delivery", description: "Prompt dispatch across Gulberg, DHA, Bahria Town, and all Lahore industrial zones." },
    ],
    faqs: [
      {
        question: "What is the minimum order quantity (MOQ) for Rose Petal products in Lahore?",
        answer: "The minimum order quantity for wholesale pricing is just 1 master carton (or a total order value of PKR 5,000 across combined hygiene items). You can mix different Rose Petal products such as facial tissues and kitchen rolls.",
      },
      {
        question: "How fast is delivery for Rose Petal cartons in Lahore?",
        answer: "Orders confirmed before 1:00 PM are delivered the same day in central Lahore (Gulberg, Model Town, Cantt, DHA). Other Lahore areas and industrial zones are fulfilled within 24 hours.",
      },
      {
        question: "Are these authentic, original Rose Petal products?",
        answer: "Yes, 100%. Pak Multilinks Hygiene supplies only genuine, factory-sealed Rose Petal products with original batch numbers, verified barcode tags, and manufacturer seal.",
      },
      {
        question: "Can corporate clients receive formal invoices with NTN / GST?",
        answer: "Yes, we provide official corporate sales invoices with complete tax documentation, vendor registration details, and bank payment receipts for audits.",
      },
      {
        question: "How do I place a bulk Rose Petal order via WhatsApp?",
        answer: "Simply click the WhatsApp button or message us directly at +92 317 1678 829 with your required product names and carton quantities. Our sales desk will provide an instant quote and confirm delivery timing.",
      },
    ],
  },
  "nozomi": {
    slug: "nozomi",
    name: "Nozomi",
    tagline: "Commercial Grade Pure Soft Tissues",
    metaTitle: "Nozomi Tissues Wholesale Carton Rates Lahore",
    metaDescription: "Order Nozomi commercial pop-up tissues, facial boxes, and soft packs in bulk cartons at direct wholesale rates in Lahore. Fast delivery & bulk discounts.",
    introHeading: "Nozomi Commercial Tissues Wholesale Supply in Lahore",
    introParagraphs: [
      "Nozomi is renowned in the commercial, hospitality, and corporate sectors for delivering premium-grade softness and dependable strength at highly competitive carton price points. Manufactured using pure virgin cellulose fibers, Nozomi tissues provide superior wet strength and lint-free dispensing.",
      "Pak Multilinks Hygiene is a primary distributor for Nozomi products in Lahore. We supply high-volume commercial pop-up tissue boxes (100 sheets x 2-ply), luxury executive facial boxes, and twin-pack soft tissue packs designed for high-traffic office desks, conference rooms, restaurants, and medical waiting areas.",
      "Purchasing Nozomi by the master carton through Pak Multilinks Hygiene allows corporate clients to optimize operational expenses while maintaining premium hygiene standards for staff and visitors.",
    ],
    keyHighlights: [
      { label: "Optimal Cost-to-Quality Ratio", description: "Superior softness matching top-tier brands at significantly lower carton procurement costs." },
      { label: "Lint-Free 2-Ply Sheets", description: "Pure virgin pulp ensures zero lint residue on glasses, screens, and clothing." },
      { label: "Compact Commercial Dispensing", description: "Pop-up carton formats engineered for standard countertop and wall dispensers." },
      { label: "Consistent Year-Round Stock", description: "Large warehouse reserves ensure zero stockouts for regular contract supply customers." },
    ],
    faqs: [
      {
        question: "Why do offices and restaurants choose Nozomi tissues in Lahore?",
        answer: "Nozomi offers executive-level sheet softness and strength at a lower cost per piece than legacy brands, allowing high-volume businesses to reduce operational overhead without compromising visitor experience.",
      },
      {
        question: "How many pieces are packed in a Nozomi master carton?",
        answer: "Standard Nozomi Pop-Up and facial tissue cartons generally contain 30 to 40 individual boxes per carton, depending on sheet count (e.g., 100 sheets 2-ply).",
      },
      {
        question: "Can I get sample boxes before placing a large volume order?",
        answer: "Yes, corporate procurement managers in Lahore can request sample boxes or visit our Gulberg II outlet to inspect tissue texture, ply bonding, and packaging quality.",
      },
      {
        question: "What payment terms are offered for Nozomi wholesale orders?",
        answer: "We accept Cash on Delivery (COD), online bank transfers (IBFT), and credit terms for qualified corporate accounts with recurring monthly purchase agreements.",
      },
    ],
  },
  "fresco": {
    slug: "fresco",
    name: "Fresco",
    tagline: "Commercial Air Fresheners & Odour Control",
    metaTitle: "Fresco Air Freshener Sprays Wholesale Lahore",
    metaDescription: "Buy Fresco automatic spray refills, aerosol air fresheners, and body sprays by the carton at wholesale rates in Lahore. Fast commercial delivery.",
    introHeading: "Fresco Air Fresheners & Aerosol Refills Wholesale in Lahore",
    introParagraphs: [
      "Fresco is Pakistan's leading brand for automatic aerosol spray dispensers, manual air fresheners, and long-lasting fragrance solutions. Essential for maintaining inviting, clean-smelling corporate washrooms, hotel lobbies, medical clinics, and office reception areas.",
      "Pak Multilinks Hygiene supplies genuine Fresco 300ml automatic spray refills, manual fragrance cans, and deodorants by the wholesale carton. Compatible with all standard digital and mechanical automatic aerosol dispensers.",
      "With a broad selection of premium scents (including Lavender, Rose, Jasmine, Citrus, and Cool Breeze), Fresco ensures your corporate premises maintain a welcoming atmosphere 24/7.",
    ],
    keyHighlights: [
      { label: "Standard Dispenser Fit", description: "300ml aerosol cans engineered to fit all universal automatic spray units." },
      { label: "3,000+ Metered Sprays", description: "Long-lasting valve technology delivers consistent, fine fragrance mist for up to 60 days." },
      { label: "Curated Aromas", description: "Wide selection of fresh floral, citrus, and therapeutic scents suited for commercial spaces." },
      { label: "Carton Packaging", description: "Supplied in 24 to 48 can master cartons for commercial facility management." },
    ],
    faqs: [
      {
        question: "Are Fresco 300ml refills compatible with automatic dispensers?",
        answer: "Yes, Fresco 300ml aerosol cans are universal refills with standard actuator caps compatible with automated sensor units, timer dispensers, and manual holders.",
      },
      {
        question: "How long does one Fresco automatic spray can last?",
        answer: "On a standard 15-minute spray interval setting, a single Fresco 300ml can provides up to 3,000 metered sprays, lasting approximately 30 to 45 days of continuous operation.",
      },
      {
        question: "Can I order assorted fragrances in one carton?",
        answer: "Depending on current stock runs, we can provide mixed-fragrance cartons so you can test multiple scents across different washroom facilities.",
      },
    ],
  },
  "germi-cure": {
    slug: "germi-cure",
    name: "Germi Cure",
    tagline: "Hospital Grade Phenyl & Disinfectants",
    metaTitle: "Germi Cure Disinfectant Phenyl Wholesale in Lahore",
    metaDescription: "Wholesale Germi Cure perfumed white phenyl and floor disinfectants in Lahore. High-strength commercial cleaning for hospitals, schools & offices.",
    introHeading: "Germi Cure Disinfectant Phenyl Wholesale Supply in Lahore",
    introParagraphs: [
      "Germi Cure is a trusted formulation for commercial floor sanitization, washroom disinfection, and odour eradication. Extensively utilized in hospitals, diagnostic laboratories, schools, mosques, and commercial office complexes across Lahore.",
      "Pak Multilinks Hygiene supplies Germi Cure perfumed white phenyl, concentrated disinfectant fluids, and bulk floor care solutions in cartons and multipacks. It eliminates pathogenic bacteria while leaving a pleasant, sanitary fragrance.",
    ],
    keyHighlights: [
      { label: "Powerful Germicide", description: "Hospital-tested formulation neutralizes bacteria, fungi, and foul washroom odours." },
      { label: "High Dilution Ratio", description: "Economical concentrate yields hundreds of litres of effective mopping solution." },
      { label: "Pleasant Fragrance", description: "Masks unpleasant chemical smells with refreshing pine and floral perfume notes." },
    ],
    faqs: [
      {
        question: "What sizes are available for Germi Cure Phenyl?",
        answer: "We supply Germi Cure in 2.75L, 3L, and 5L commercial jugs, as well as 12-bottle cartons for regular janitorial maintenance.",
      },
      {
        question: "Is Germi Cure safe for ceramic and marble tiles?",
        answer: "Yes, when diluted according to instructions, Germi Cure effectively cleans and disinfects marble, ceramic tiles, terrazzo, and concrete without etching surfaces.",
      },
    ],
  },
  "shine-well": {
    slug: "shine-well",
    name: "Shine Well",
    tagline: "Professional Hand Wash & Surface Care",
    metaTitle: "Shine Well Liquid Hand Wash Wholesale in Lahore",
    metaDescription: "Order Shine Well commercial liquid hand wash and surface care solutions in bulk cartons at wholesale prices in Lahore. Fast commercial delivery.",
    introHeading: "Shine Well Commercial Hand Wash & Cleaning Supplies in Lahore",
    introParagraphs: [
      "Shine Well provides institutional-grade liquid hand washes, dish cleaners, and surface solutions designed for heavy daily usage in office washrooms, restaurant kitchens, and corporate facilities.",
      "Formulated with skin conditioners and antibacterial agents, Shine Well products keep hands clean and soft while protecting against germs. Pak Multilinks Hygiene distributes bulk Shine Well cartons across Lahore.",
    ],
    keyHighlights: [
      { label: "Gentle on Skin", description: "Moisturizing formulation prevents hand dryness even with frequent workplace washing." },
      { label: "Bulk Dispenser Refills", description: "Available in 500ml pump bottles and 5-litre bulk refill cans for automatic and manual dispensers." },
      { label: "Economical Cost", description: "Substantially lowers hand hygiene expenses for large office facilities." },
    ],
    faqs: [
      {
        question: "Can Shine Well liquid hand wash be used in wall dispensers?",
        answer: "Yes, Shine Well liquid hand wash is formulated with ideal viscosity for both manual push dispensers and automatic infrared soap dispensers.",
      },
    ],
  },
};

export function getBrandBySlug(slug: string): BrandInfo | undefined {
  return BRAND_DATA[slug];
}

export function getAllBrandSlugs(): string[] {
  return Object.keys(BRAND_DATA);
}

export function brandNameToSlug(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return clean;
}
