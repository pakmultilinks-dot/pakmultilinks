export type CategorySeoCopy = {
  heading: string;
  paragraphs: string[];
};

// Factual buying-guide copy shown at the bottom of category pages.
// Facts only: product range per the catalogue, carton supply, minimum order
// PKR 5,000 or one carton, Lahore same/next-day delivery, nationwide dispatch,
// WhatsApp ordering (all as published in llms.txt and the FAQ answers).
export const CATEGORY_SEO_COPY: Record<string, CategorySeoCopy> = {
  "tissue-paper-products": {
    heading: "Tissue paper products at wholesale rates in Lahore",
    paragraphs: [
      "Pak Multilinks Hygiene supplies the full tissue paper range by the carton: facial tissues in pop-up boxes and soft packs, toilet rolls and jumbo rolls, kitchen towel rolls, and table and party napkins. The range covers Rose Petal and Nozomi, the tissue brands offices, hotels, restaurants and clinics across Pakistan reorder most.",
      "Every product on this page is sold wholesale by the carton with the packing and minimum order shown on the product. Orders placed in Lahore are delivered the same day or the next day, and cartons are dispatched by cargo to Karachi, Islamabad and all other cities. Send your list on WhatsApp for the current carton rate before you order.",
    ],
  },
  "facial-tissues": {
    heading: "Facial tissues wholesale, by the carton",
    paragraphs: [
      "Facial tissues are the highest-rotation hygiene item in any office, clinic or hotel. We stock pop-up boxes, luxury cubes and soft packs in 100, 150 and 200 sheet counts from Rose Petal and Nozomi, all supplied in sealed factory cartons at wholesale rates.",
      "Buying by the carton keeps the per-box cost at the wholesale rate and avoids mid-month stock-outs. Tell us your monthly usage on WhatsApp and we will confirm the right pack size, carton packing and rate for your facility.",
    ],
  },
  "soft-pack-tissues": {
    heading: "Soft pack and pocket tissues in bulk",
    paragraphs: [
      "Soft pack tissues, pocket tissues and party packs are supplied in bulk cartons for retail shops, events, salons and promotional distribution. Perfumed and plain variants are available, with the carton packing shown on each product.",
      "Minimum order is one carton or PKR 5,000. Lahore orders are delivered the same day or the next day, and bulk quantities can be reserved on WhatsApp for events and seasonal demand.",
    ],
  },
  "tissue-rolls": {
    heading: "Toilet rolls and jumbo rolls at wholesale prices",
    paragraphs: [
      "Toilet tissue rolls are supplied in embossed 2-ply and 3-ply packs for home and commercial washrooms, along with commercial jumbo rolls for high-traffic facilities such as malls, hospitals, schools and banquet halls. Jumbo rolls reduce refill frequency, which is why facilities with heavy footfall standardise on them.",
      "All rolls are sold by the carton at wholesale rates with packing confirmed on the product page. For a standing monthly supply of rolls for your building, ask about scheduled restocking on WhatsApp.",
    ],
  },
  "paper-napkins": {
    heading: "Paper napkins and kitchen towels wholesale",
    paragraphs: [
      "Table napkins, dinner napkins, dispenser napkins and party packs are stocked for restaurants, cafes, caterers and banquet halls, together with absorbent kitchen towel rolls for commercial kitchens. Custom logo printing is also available on facial tissue boxes for corporate clients.",
      "Napkins and towels are supplied by the carton so your per-piece cost stays at the wholesale rate. Send your monthly requirement on WhatsApp and we will quote the full list together.",
    ],
  },
  "washroom-supplies": {
    heading: "Washroom supplies for commercial facilities",
    paragraphs: [
      "This range covers everything a commercial washroom runs on: manual and automatic soap dispensers, jumbo roll and hand towel dispensers, automatic hand dryers, urinal screens, toilet seat sanitizers and automatic air freshener dispensers, plus the refills that go with them.",
      "Facilities teams buy washroom hardware and refills together so nothing runs dry between visits. Order by the carton from Lahore with same-day or next-day delivery, or set up a recurring supply for your building through our corporate orders desk.",
    ],
  },
  "hand-wash": {
    heading: "Liquid hand wash wholesale, including 5 litre refills",
    paragraphs: [
      "Liquid hand wash is supplied in pump bottles for washrooms and in 5 litre refill drums for offices, hospitals, hotels and industrial facilities that refill dispensers in bulk. The 5 litre drum is the standard institutional size because it brings the per-litre cost down to the wholesale rate.",
      "Shine Well hand wash and surface care products are stocked alongside dispenser hardware, so a full washroom setup can be ordered in one carton list. Message your requirement on WhatsApp for the current rate.",
    ],
  },
  "cleaning-products": {
    heading: "Cleaning products and chemicals at wholesale rates",
    paragraphs: [
      "Commercial cleaning products stocked here include disinfectant phenyl in white and black, floor cleaners, multi-surface degreasers, glass cleaners, toilet bowl cleaners, bleach and surface sanitizers, including Germi Cure institutional disinfectants used by hospitals and facility managers.",
      "Chemicals are supplied in bulk packing and 5 litre drums at wholesale carton rates. If your facility cleans daily, a monthly contract supply keeps rates locked to the rate list and stock reserved for you.",
    ],
  },
  "floor-surface-care": {
    heading: "Floor and surface care, mops and cleaning tools",
    paragraphs: [
      "Floor and surface care covers the daily cleaning kit: floor cleaners and phenyl, microfiber cloths, wet floor mops, steel wipers, sponges and brushes for kitchens, washrooms and common areas in offices, schools, hospitals and industrial sites.",
      "Tools and chemicals are supplied together by the carton, so a new facility can be fitted out in a single order. WhatsApp your floor area and cleaning frequency and the team will suggest the right quantities.",
    ],
  },
  "disposable-items": {
    heading: "Disposable items and garbage bags wholesale",
    paragraphs: [
      "Disposable and janitorial items include heavy-duty garbage bags and trash liners from small to extra-large sizes (30x40 to 40x50 inches), disposable paper cups, gloves, aprons, microfiber cloths and cleaning tools for restaurants, hospitals, caterers and facility contractors.",
      "These are fast-moving consumables, so most buyers order them with their monthly tissue and chemical cartons in one delivery. Minimum order is one carton or PKR 5,000, with same-day or next-day delivery in Lahore.",
    ],
  },
};

export function getCategorySeoCopy(slug: string): CategorySeoCopy | undefined {
  return CATEGORY_SEO_COPY[slug];
}
