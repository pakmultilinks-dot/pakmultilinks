/**
 * Curated SEO Metadata, Intros, and FAQ schema data for Category landing pages.
 * All meta descriptions are strictly 150-160 characters.
 * All intros are strictly 120-180 words, derived solely from actual catalog products.
 * Visible FAQ copy and Schema copy are 100% identical.
 */

export type CategorySeoInfo = {
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  faqs: Array<{ question: string; answer: string }>;
};

export const CATEGORY_SEO_DATA: Record<string, CategorySeoInfo> = {
  "facial-tissues": {
    metaTitle: "Facial Tissues Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale facial tissues in Lahore by carton — pop-up boxes, soft packs and luxury tissues for offices, hotels and homes. Bulk rates at Pak Multilinks.",
    heading: "Wholesale Facial Tissues in Lahore",
    intro:
      "Pak Multilinks Hygiene is Lahore's trusted wholesale supplier for commercial facial tissues, providing master cartons directly to offices, clinics, hospitals, hotels, and residences across Gulberg, DHA, Bahria Town, and Johar Town. Our facial tissue portfolio features factory-sealed cartons from leading national brands including Rose Petal and Nozomi. Choose from everyday essentials like Rose Petal Essential and Multicolor boxes and elegant Rose Petal Luxury and Perfumed tissue boxes. Every product is sold in full wholesale cartons with transparent carton pricing, confirmed piece counts per box, and clearly defined minimum order quantities (MOQ). Whether you need scheduled monthly replenishments for a corporate facility or immediate event stock, our Lahore warehouse coordinates prompt same-day or next-day delivery, alongside reliable cargo dispatch to commercial clients across Pakistan.",
    faqs: [
      {
        question: "What brands of facial tissues do you supply wholesale in Lahore?",
        answer:
          "We supply factory-sealed master cartons from recognized brands including Rose Petal (Luxury, Essential, Perfumed, Multicolor, Ciblure) and Nozomi.",
      },
      {
        question: "What is the minimum order quantity (MOQ) for facial tissue cartons?",
        answer:
          "The minimum order is one wholesale carton or a minimum order value of PKR 5,000. Each product page displays specific carton packing and MOQ details.",
      },
      {
        question: "How fast is delivery for facial tissues in Lahore?",
        answer:
          "We provide same-day or next-day scheduled delivery across Gulberg, DHA, Bahria Town, Model Town, Johar Town, and all commercial zones in Lahore.",
      },
      {
        question: "Do you provide corporate account billing and bulk quotations?",
        answer:
          "Yes, corporate clients and institutions can message our sales desk at +92 317 1678 829 on WhatsApp for formal quotations, tax invoices, and scheduled restocking contracts.",
      },
    ],
  },
  "disposable-items": {
    metaTitle: "Disposable Hygiene Items Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale disposable items in Lahore by carton — paper cups, garbage bags, nitrile gloves, wet wipes and masks for corporate workplaces. Pak Multilinks.",
    heading: "Wholesale Disposable Items & Garbage Bags in Lahore",
    intro:
      "Pak Multilinks Hygiene supplies commercial single-use disposables and sanitation essentials by the wholesale carton to companies, catering teams, diagnostic clinics, and educational centers in Lahore. Our catalog focuses on certified daily-use essentials needed for hygienic workspace management. Stock up on Sicura insulated hot and cold paper cups in 6.5oz and 8oz sizes for office pantries and water stations, powder-free disposable nitrile examination gloves in boxes of 100 for housekeeping and food handling, and Germi Cure 3-ply protective face masks in 50-piece dispenser packs. For facility cleanliness and refuse collection, we provide tear-resistant 55-gallon heavy-duty industrial black garbage bags, as well as Rose Petal Freshen Up antibacterial rose-scented wet wipes. All disposables are supplied in original master shipping cartons with published carton prices and established minimum orders. We ensure rapid same-day or next-day scheduled delivery across Lahore and coordinate cargo dispatch throughout Punjab and nationwide.",
    faqs: [
      {
        question: "What disposable hygiene products do you stock by the carton?",
        answer:
          "Our disposable inventory includes Sicura hot and cold paper cups (6.5oz and 8oz), powder-free nitrile examination gloves, Germi Cure 3-ply protective masks, heavy-duty 55-gallon garbage bags, and Rose Petal freshen-up wet wipes.",
      },
      {
        question: "What is the carton packing for paper cups and gloves?",
        answer:
          "Sicura paper cups come packed in sleeves within master shipping cartons, nitrile gloves are packed 100 pieces per box in master cases, and garbage bags are packaged in commercial 50-count packs.",
      },
      {
        question: "Can I order disposable items for delivery in Lahore?",
        answer:
          "Yes, we provide same-day or next-day delivery across Lahore (Gulberg, DHA, Bahria Town, Johar Town, and industrial areas) and daily freight dispatch nationwide.",
      },
      {
        question: "What is the minimum order quantity for commercial disposables?",
        answer:
          "The minimum order is one wholesale carton or a minimum total order value of PKR 5,000. Orders above 10 cartons qualify for custom bulk rate quotations.",
      },
    ],
  },
  "soft-pack-tissues": {
    metaTitle: "Soft Pack & Pocket Tissues Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale soft pack tissues in Lahore by carton — Rose Petal pocket packs, party packs and multipurpose tissues for cars and offices. Pak Multilinks rates.",
    heading: "Wholesale Soft Pack & Pocket Tissues in Lahore",
    intro:
      "Pak Multilinks Hygiene is your primary wholesale distributor for commercial soft pack and portable pocket pack tissues in Lahore. Ideal for vehicles, hotel housekeeping kits, corporate giveaways, conference tables, and busy retail counters, soft pack tissues offer space-efficient convenience without boxed packaging bulk. Our extensive inventory includes the full Rose Petal pocket pack collection in Purple, Teal, White, and Blue variants, as well as the high-demand Rose Petal Party Pack multipurpose tissues and Rose Petal Flu Packs. We also carry Nozomi commercial soft packs, delivering reliable 2-ply softness and high absorbency in every sheet. Products are delivered in original manufacturer master cartons with clear per-carton piece counts and per-unit breakdowns. With wholesale carton pricing, an accessible minimum order quantity, and dependable same-day or next-day scheduled delivery across Lahore, Pak Multilinks makes procurement effortless for procurement heads, distributors, and facility managers across Pakistan.",
    faqs: [
      {
        question: "What soft pack and pocket tissue variants are available in bulk?",
        answer:
          "We stock Rose Petal Pocket Packs (Purple, Teal, White, Blue), Rose Petal Party Packs, Rose Petal Flu Packs, and Nozomi commercial soft packs.",
      },
      {
        question: "Why choose soft pack tissues over boxed facial tissues?",
        answer:
          "Soft packs take up less storage space, resist crushing in transport and vehicles, and offer cost-effective per-unit rates for hospitality, corporate kits, and everyday workplace use.",
      },
      {
        question: "What is the minimum carton order for pocket packs?",
        answer:
          "The minimum order is one wholesale master carton containing manufacturer standard pack counts, or a PKR 5,000 cumulative order across our catalog.",
      },
      {
        question: "How fast can you dispatch soft pack cartons across Pakistan?",
        answer:
          "Orders in Lahore are delivered same-day or next-day. For clients in Karachi, Islamabad, Faisalabad, Multan, Sialkot, and other cities, shipments are dispatched daily via cargo service.",
      },
    ],
  },
  "tissue-rolls": {
    metaTitle: "Tissue Rolls & Toilet Paper Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale tissue rolls in Lahore by carton — toilet rolls, kitchen towels and commercial maxi rolls for offices and washrooms. Bulk rates at Pak Multilinks.",
    heading: "Wholesale Tissue Rolls & Toilet Paper in Lahore",
    intro:
      "Pak Multilinks Hygiene provides high-capacity commercial tissue rolls, toilet rolls, and kitchen paper towels by the wholesale master carton to facilities, restaurants, corporate headquarters, and shopping malls in Lahore. Our washroom paper roll portfolio features recognized brands engineered for heavy daily consumption, including Rose Petal Maxob Toilet Rolls (8+2 pack), Rose Petal Zzoop Maxi Rolls, and Hi-jeen Jumbo dispenser rolls. For hospitality pantries, commercial kitchens, and janitorial stations, we stock absorbent Nozomi Jumbo Kitchen Towels and Nozomi 200-meter Autocut Maxi Roll Hand Towels. All paper rolls offer superior wet strength, rapid absorbency, and consistent perforations. Cartons are dispatched in sealed manufacturer packaging with transparent per-roll and per-carton pricing. With our MOQ starting at a single wholesale carton and scheduled same-day or next-day delivery across Gulberg, DHA, and Lahore industrial zones, restock your washrooms reliably.",
    faqs: [
      {
        question: "What types of paper rolls do you supply for commercial washrooms?",
        answer:
          "We supply 2-ply toilet rolls (Rose Petal Maxob, Nozomi), high-absorbency kitchen towel rolls (Rose Petal Zzoop), and high-capacity maxi autocut hand towel rolls (200m).",
      },
      {
        question: "Are commercial toilet rolls compatible with standard dispensers?",
        answer:
          "Yes, our commercial toilet rolls fit standard washroom spindles, while our autocut and maxi rolls are sized for standard commercial wall dispensers.",
      },
      {
        question: "What is the carton packing for toilet and kitchen rolls?",
        answer:
          "Packing varies by product: Rose Petal Maxob comes in multipacks per carton, commercial toilet rolls are packed in 10-roll bundles, and jumbo kitchen towels come in 2-roll packs within master cartons.",
      },
      {
        question: "How can I order washroom tissue rolls in bulk for my facility in Lahore?",
        answer:
          "You can order directly online or message our sales desk on WhatsApp at +92 317 1678 829 for same-day delivery coordination in Lahore and custom corporate billing.",
      },
    ],
  },
  "paper-napkins": {
    metaTitle: "Paper Napkins & Table Napkins Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale paper napkins in Lahore by carton — table napkins, coffee napkins and kitchen towels for cafes, restaurants and events. Bulk rates at Pak Multilinks.",
    heading: "Wholesale Paper Napkins & Hand Towels in Lahore",
    intro:
      "Pak Multilinks Hygiene is the premier wholesale source for commercial paper napkins, dispenser refills, and kitchen hand towels in Lahore. Catering to food service operators, cafeteria managers, corporate pantries, event planners, and catering businesses, our napkin inventory delivers practical hygiene and soft absorbency at predictable carton costs. We supply 1-ply 100-sheet Nozomi embossed table napkins, Super Soft table napkins, and compact Super Soft coffee napkins suited for cafes, beverage stations, and conference breaks. For washroom and pantry hand drying, we offer Rose Petal Hand Towels in standard and economy packaging, as well as the grease-fighting Rose Petal Zzoop Kitchen Towel. All products are delivered in factory-sealed master cartons with clear sheet counts and unit specifications. With an accessible minimum order requirement of one carton, wholesale pricing tiers, and fast same-day or next-day scheduled delivery across Lahore and nationwide shipping, Pak Multilinks ensures seamless table and pantry service for your facility.",
    faqs: [
      {
        question: "What paper napkins are available for restaurants and corporate pantries?",
        answer:
          "We supply Nozomi 1-ply 100-sheet table napkins, Super Soft table and coffee napkins, and Rose Petal hand towels in standard and economy packs.",
      },
      {
        question: "What are the sheet dimensions and ply specifications?",
        answer:
          "Our table napkins are 1-ply embossed sheets (100 sheets per pack) designed for dispenser use and tabletop service, while hand towels offer multi-ply absorbency for hand drying.",
      },
      {
        question: "What is the MOQ for paper napkins?",
        answer:
          "The minimum order is one master carton or an aggregate order of PKR 5,000. Master cartons contain multiple 100-sheet packs as specified on each product page.",
      },
      {
        question: "Do you deliver paper napkins across Lahore?",
        answer:
          "Yes, we provide same-day or next-day delivery across Lahore including Gulberg, DHA, Bahria Town, Model Town, Johar Town, and restaurant clusters.",
      },
    ],
  },
  "hand-wash": {
    metaTitle: "Hand Wash & Liquid Soaps Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale hand wash in Lahore by carton — antibacterial liquid hand wash and 4-litre refill gallons for offices, clinics and hotels. Pak Multilinks supplies.",
    heading: "Wholesale Liquid Hand Wash & Refill Gallons in Lahore",
    intro:
      "Pak Multilinks Hygiene is Lahore's trusted commercial supplier for antibacterial and antiseptic liquid hand wash by the wholesale carton and bulk gallon. Designed for offices, healthcare clinics, hospitality restrooms, educational facilities, and shared washrooms, our hand hygiene products provide thorough germ protection while remaining gentle on frequent users' skin. We stock Fresco Anti-Bacterial Liquid Hand Wash in practical 500ml pump bottles for vanity tops and individual sinks, as well as cost-effective Fresco 4000ml (4 Litre) bulk refill gallons designed for wall-mounted manual and automatic dispensers. For healthcare facilities and commercial centers requiring clinical-grade antiseptic standards, we supply Germi Cure Antiseptic Liquid Hand Wash in 500ml bottles. All liquid soaps are packaged in original leak-tested factory cartons with established carton bottle counts and clear volume metrics. With competitive wholesale rates, low minimum order quantities, and rapid same-day or next-day scheduled dispatch across Lahore and nationwide shipping, Pak Multilinks ensures your washrooms never run out of vital sanitizing supplies.",
    faqs: [
      {
        question: "What sizes of commercial hand wash are available?",
        answer:
          "We stock Fresco Anti-Bacterial Hand Wash in 500ml pump bottles and 4000ml (4 Litre) bulk refill gallons, as well as Germi Cure Antiseptic Hand Wash in 500ml bottles.",
      },
      {
        question: "Are the 4-litre gallons suitable for commercial dispensers?",
        answer:
          "Yes, the 4000ml bulk gallons are specifically formulated for refilling manual and automatic wall-mounted washroom soap dispensers in offices and commercial buildings.",
      },
      {
        question: "Are these hand washes antibacterial and skin-safe?",
        answer:
          "Yes, both Fresco and Germi Cure formulas provide certified antibacterial and antiseptic protection while containing skin-friendly moisturizers for frequent daily handwashing.",
      },
      {
        question: "What is the delivery timeline for hand wash cartons in Lahore?",
        answer:
          "We deliver in-stock hand wash cartons same-day or next-day throughout Lahore and dispatch nationwide via freight cargo for multi-carton corporate orders.",
      },
    ],
  },
  "floor-surface-care": {
    metaTitle: "Floor & Surface Cleaners Wholesale in Lahore | Pak Multilinks",
    metaDescription:
      "Wholesale floor and surface cleaners in Lahore by carton — phenyl, floor cleaner, dish wash, bleach and glass polish for facilities. Pak Multilinks supplies.",
    heading: "Wholesale Floor & Surface Cleaners in Lahore",
    intro:
      "Pak Multilinks Hygiene supplies commercial cleaning chemicals, floor sanitizers, and hard surface maintenance solutions by the wholesale carton to housekeeping teams, schools, commercial towers, and medical centers in Lahore. Our cleaning chemical catalog features tested formulas designed for deep commercial degreasing and surface disinfection. We stock Fresco Floor Cleaner in 4000ml (4 Litre) bulk gallons, Germi Cure Perfumed White Phenyl in 3000ml canisters for daily mopping and odor suppression, and Germi Cure Toilet Cleaner in 500ml squeeze bottles for ceramic bowl stain removal. For pantry and kitchen hygiene, we provide Fresco Dish Wash Liquid in 500ml bottles and 4-litre bulk refills, alongside Fresco Bleach Disinfectant 4000ml for intensive surface sanitization. For housekeeping finishing, our range includes Shine Well Glass Cleaner 500ml spray bottles and Shine Well Furniture Polish 400ml aerosols. Every item is packed in original manufacturer master cartons with clearly stated carton quantities and transparent wholesale prices. Enjoy dependable scheduled same-day or next-day delivery throughout Lahore and freight dispatch nationwide.",
    faqs: [
      {
        question: "What cleaning chemicals do you supply by the wholesale carton?",
        answer:
          "Our cleaning chemical catalog includes Fresco 4L Floor Cleaner, Germi Cure 3L White Phenyl, Germi Cure 500ml Toilet Cleaner, Fresco Dish Wash (500ml & 4L), Fresco 4L Bleach Disinfectant, Shine Well 500ml Glass Cleaner, and Shine Well 400ml Furniture Polish.",
      },
      {
        question: "Are commercial cleaners available in bulk gallons?",
        answer:
          "Yes, we supply 4000ml (4-litre) bulk gallons for floor cleaner, dish wash, and bleach disinfectant, as well as 3000ml canisters for white phenyl.",
      },
      {
        question: "What is the minimum order for cleaning supplies in Lahore?",
        answer:
          "The minimum order is one wholesale carton (or PKR 5,000 total order value). Carton packing and bottle counts are specified on each product page.",
      },
      {
        question: "Can you provide recurring restocking for commercial facilities?",
        answer:
          "Yes, corporate clients and facility management teams can set up scheduled restocking via WhatsApp at +92 317 1678 829 with custom invoicing and corporate terms.",
      },
    ],
  },
};

export function getCategorySeoInfo(categorySlug: string, categoryName: string, categoryDescription?: string | null): CategorySeoInfo {
  const direct = CATEGORY_SEO_DATA[categorySlug];
  if (direct) return direct;

  const title = `${categoryName} Wholesale in Lahore | Pak Multilinks`;
  const desc = categoryDescription && categoryDescription.length >= 100
    ? categoryDescription
    : `Buy official ${categoryName} wholesale supplies by carton in Lahore. Factory-sealed cartons, competitive carton rates, and same-day delivery at Pak Multilinks.`;

  return {
    metaTitle: title,
    metaDescription: desc.slice(0, 160),
    heading: `${categoryName} Wholesale in Lahore`,
    intro:
      categoryDescription ||
      `Pak Multilinks Hygiene supplies commercial ${categoryName.toLowerCase()} by the wholesale carton to businesses, institutions, and hospitality facilities in Lahore. All products are supplied in original factory-sealed master cartons with confirmed unit counts, carton pricing, and dependable same-day or next-day delivery across Lahore and nationwide shipping.`,
    faqs: [
      {
        question: `What is the minimum order quantity for ${categoryName}?`,
        answer:
          "The minimum order is one wholesale carton or a minimum total order value of PKR 5,000. Carton quantities are shown on each product page.",
      },
      {
        question: `How fast is delivery for ${categoryName} in Lahore?`,
        answer:
          "We offer same-day or next-day scheduled delivery across Lahore, including Gulberg, DHA, Bahria Town, and industrial zones.",
      },
      {
        question: "Do you deliver outside Lahore?",
        answer:
          "Yes, daily cargo and freight dispatch is available to Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Sialkot, Peshawar, and across Pakistan.",
      },
      {
        question: "How do I place an order on WhatsApp?",
        answer:
          "Message +92 317 1678 829 with your product list and carton quantities for an instant quotation, packing confirmation, and delivery coordination.",
      },
    ],
  };
}
