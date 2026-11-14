import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const DOWNLOADS_DIR = path.join(process.cwd(), "public", "downloads");
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Brand Rate Data
const BRAND_CATALOGUES = [
  {
    id: "fresco",
    filename: "fresco-rate-list.pdf",
    brandTitle: "FRESCO OFFICIAL RATE LIST",
    subtitle: "Air Fresheners, Aerosol Refills, Automated Dispensers & Restroom Hygiene",
    headerColor: rgb(0.07, 0.39, 0.24), // #11643d
    accentColor: rgb(0.12, 0.55, 0.33),
    items: [
      { name: "Fresco Manual Air Freshener 300ml", spec: "300ml aerosol / 6 fragrances", pack: "24 cans / carton", rate: "Rs 390" },
      { name: "Fresco Automatic Spray Refill 300ml", spec: "300ml / 3000+ metered sprays", pack: "24 cans / carton", rate: "Rs 420" },
      { name: "Fresco Body Spray Deodorant 175ml", spec: "175ml aerosol / 6 fragrances", pack: "24 cans / carton", rate: "Rs 550" },
      { name: "Fresco Automatic Dispenser LCD Large (PL-1510)", spec: "Digital LCD programmable timer", pack: "10 units / carton", rate: "Rs 2,950" },
      { name: "Fresco Automatic Dispenser LCD Small (V-410)", spec: "Compact digital LCD dispenser", pack: "10 units / carton", rate: "Rs 2,750" },
      { name: "Fresco Automatic Dispenser LED Small", spec: "LED interval timer machine", pack: "10 units / carton", rate: "Rs 1,950" },
      { name: "Fresco Anti-Bacterial Hand Wash 500ml", spec: "500ml pump bottle", pack: "24 bottles / carton", rate: "Rs 290" },
      { name: "Fresco Liquid Hand Wash 4000ml (4L)", spec: "Commercial bulk gallon", pack: "4 gallons / carton", rate: "Rs 1,150" },
      { name: "Fresco Floor Cleaner 4000ml (4L)", spec: "Disinfectant scented floor wash", pack: "4 gallons / carton", rate: "Rs 950" },
      { name: "Fresco Dish Wash Liquid 500ml", spec: "Grease cutting lemon formula", pack: "24 bottles / carton", rate: "Rs 240" },
      { name: "Fresco Dish Wash Liquid 4000ml (4L)", spec: "Concentrated restaurant gallon", pack: "4 gallons / carton", rate: "Rs 1,150" },
      { name: "Fresco Bleach Disinfectant 4000ml (4L)", spec: "Sodium hypochlorite sanitizer", pack: "4 gallons / carton", rate: "Rs 750" },
      { name: "Fresco Stainless Steel Soap Dispenser", spec: "Brushed SS wall mounted", pack: "12 units / carton", rate: "Rs 2,250" },
      { name: "Fresco Manual Soap Dispenser 1000ml", spec: "Heavy duty ABS plastic", pack: "12 units / carton", rate: "Rs 1,250" },
      { name: "Fresco Urinal Screen Mat / Smell Free", spec: "Anti-splash fragrance deodorizer", pack: "20 mats / carton", rate: "Rs 450" },
    ],
  },
  {
    id: "rosepetal",
    filename: "rose-petal-rate-list.pdf",
    brandTitle: "ROSE PETAL OFFICIAL WHOLESALE RATE LIST",
    subtitle: "Complete Range: Facial Tissues, Soft Packs, Party Packs, Zzoop Towels & Maxi Rolls",
    headerColor: rgb(0.55, 0.08, 0.18),
    accentColor: rgb(0.75, 0.15, 0.28),
    items: [
      { name: "Rose Petal Pocket Pack Purple", spec: "Pocket size soft facial tissue", pack: "48 packs / carton", rate: "Rs 65" },
      { name: "Rose Petal Party Pack", spec: "Multi-ply soft pack napkins", pack: "24 packs / carton", rate: "Rs 365" },
      { name: "Rose Petal Party Pack Multipurpose Tissue", spec: "High absorption multipurpose soft pack", pack: "24 packs / carton", rate: "Rs 375" },
      { name: "Rose Petal Wet Wipes Rose-Scent Freshen Up", spec: "Moisturizing scented wet wipes", pack: "30 packs / carton", rate: "Rs 270" },
      { name: "Rose Petal Essential Tissues Peach", spec: "2-ply peach soft facial box", pack: "30 boxes / carton", rate: "Rs 255" },
      { name: "Rose Petal Perfumed Tissues Red", spec: "2-ply perfumed floral facial box", pack: "30 boxes / carton", rate: "Rs 265" },
      { name: "Rose Petal Pocket Pack Teal", spec: "Pocket pack soft facial tissue", pack: "48 packs / carton", rate: "Rs 65" },
      { name: "Rose Petal Party Pack Napkins", spec: "Table & party folded paper napkins", pack: "24 packs / carton", rate: "Rs 350" },
      { name: "Rose Petal Ciblure Tissues", spec: "Luxury 2-ply soft facial box", pack: "30 boxes / carton", rate: "Rs 310" },
      { name: "Rose Petal Zzoop Kitchen Towel", spec: "Embossed absorbent kitchen paper roll", pack: "12 packs / carton", rate: "Rs 309" },
      { name: "Rose Petal Pocket Pack White", spec: "Pocket pack soft facial tissue", pack: "48 packs / carton", rate: "Rs 65" },
      { name: "Rose Petal Occasions Tissues", spec: "Premium event facial tissue box", pack: "30 boxes / carton", rate: "Rs 395" },
      { name: "Rose Petal Multicolor Tissues", spec: "Color variant 2-ply facial box", pack: "30 boxes / carton", rate: "Rs 265" },
      { name: "Rose Petal Pocket Pack Blue", spec: "Pocket pack soft facial tissue", pack: "48 packs / carton", rate: "Rs 65" },
      { name: "Rose Petal Hand Towel Economy Pack", spec: "Hand towel sheets economy pack", pack: "24 packs / carton", rate: "Rs 300" },
      { name: "Rose Petal Pocket Pack", spec: "Standard pocket pack tissue", pack: "48 packs / carton", rate: "Rs 65" },
      { name: "Rose Petal Essential Tissues", spec: "2-ply everyday soft tissue box", pack: "30 boxes / carton", rate: "Rs 250" },
      { name: "Rose Petal Flu Pack Tissues", spec: "Extra soft cold & flu pack", pack: "24 packs / carton", rate: "Rs 330" },
      { name: "Rose Petal Luxury Tissues", spec: "Luxury 2-ply executive box", pack: "30 boxes / carton", rate: "Rs 310" },
      { name: "Rose Petal Maxob Toilet Roll 8+2 Offer", spec: "Premium toilet rolls 8+2 bonus pack", pack: "8 packs / carton", rate: "Rs 1,600" },
      { name: "Rose Petal Hand Towel", spec: "Washroom hand paper towel", pack: "24 packs / carton", rate: "Rs 265" },
      { name: "Rose Petal Zzoop Maxi Roll", spec: "Maxi kitchen paper towel roll", pack: "6 rolls / carton", rate: "Rs 350" },
      { name: "Rose Petal Perfumed Tissues 200 Sheets", spec: "2-ply 200 sheets high count box", pack: "30 boxes / carton", rate: "Rs 310" },
      { name: "Rose Petal Perfumed Tissues", spec: "2-ply scented facial box", pack: "30 boxes / carton", rate: "Rs 265" },
      { name: "Hi-jeen Tissues (Rose Petal)", spec: "Hygienic 2-ply soft box", pack: "30 boxes / carton", rate: "Rs 250" },
      { name: "Hi-jeen Jumbo Roll (Rose Petal)", spec: "Large washroom tissue roll", pack: "12 rolls / carton", rate: "Rs 350" },
      { name: "Rose Petal Pop-Up Tissues Ultra Soft", spec: "Pop-up touchless dispensing pack", pack: "40 boxes / carton", rate: "Rs 315" },
    ],
  },
  {
    id: "nozomi",
    filename: "nozomi-rate-list.pdf",
    brandTitle: "NOZOMI PURE SOFT TISSUES RATE LIST",
    subtitle: "Commercial Pop-Up Boxes, Luxury Facial Tissues, Soft Packs & Toilet Rolls",
    headerColor: rgb(0.15, 0.45, 0.35),
    accentColor: rgb(0.20, 0.58, 0.45),
    items: [
      { name: "Nozomi Pop-Up Tissues (100 Sheets x 2 Ply)", spec: "100 sheets x 2 ply virgin pulp soft tissue", pack: "40 boxes / carton", rate: "Rs 175" },
      { name: "Nozomi Luxury Facial Tissues (150 Sheets x 2 Ply)", spec: "150 sheets x 2 ply emerald gold box", pack: "30 boxes / carton", rate: "Rs 220" },
      { name: "Nozomi Executive Facial Tissues (200 Sheets x 2 Ply)", spec: "200 sheets x 2 ply high capacity box", pack: "30 boxes / carton", rate: "Rs 275" },
      { name: "Nozomi Soft Pack Tissues (Twin Pack)", spec: "Twin pack water-resistant poly wrap", pack: "24 twin packs / carton", rate: "Rs 260" },
      { name: "Nozomi Soft Pack Single Tissues (100 Sheets)", spec: "100 sheets compact single soft pack", pack: "48 packs / carton", rate: "Rs 135" },
      { name: "Nozomi Jumbo Kitchen Towel (2 Large Rolls)", spec: "Thick embossed absorbent 2 rolls", pack: "12 packs / carton", rate: "Rs 360" },
      { name: "Nozomi Commercial Toilet Roll (10 Rolls Pack)", spec: "2-ply soft commercial washroom rolls", pack: "10 packs / carton (100 rolls)", rate: "Rs 620" },
      { name: "Nozomi Autocut Maxi Roll Hand Towel (200m)", spec: "200m industrial roll for dispensers", pack: "6 rolls / carton", rate: "Rs 490" },
      { name: "Nozomi Table Napkins 1-Ply (100 Sheets)", spec: "100 sheets embossed cafeteria napkins", pack: "50 packs / carton", rate: "Rs 160" },
      { name: "Nozomi Party Pack Multipurpose Tissue", spec: "High capacity multipurpose soft pack", pack: "20 packs / carton", rate: "Rs 320" },
    ],
  },
  {
    id: "germicure",
    filename: "germicure-rate-list.pdf",
    brandTitle: "GERMI CURE WHOLESALE RATE LIST",
    subtitle: "Disinfectants, Cleaners, Antiseptic Hand Wash & Certified Face Masks",
    headerColor: rgb(0.08, 0.35, 0.52), // #145984
    accentColor: rgb(0.12, 0.48, 0.70),
    items: [
      { name: "Germi Cure Perfumed White Phenyl 3000ml", spec: "Concentrated pine perfumed phenyl", pack: "4 cans / carton", rate: "Rs 650" },
      { name: "Germi Cure Toilet Cleaner 500ml", spec: "Acid-safe scale & stain formula", pack: "24 bottles / carton", rate: "Rs 250" },
      { name: "Germi Cure Antiseptic Liquid Hand Wash 500ml", spec: "Moisturizing germ protection", pack: "24 bottles / carton", rate: "Rs 295" },
      { name: "Germi Cure 3-Ply Protective Face Mask (50 Pcs)", spec: "Meltblown certified soft loops", pack: "40 boxes / carton", rate: "Rs 250" },
    ],
  },
  {
    id: "glad",
    filename: "glad-rate-list.pdf",
    brandTitle: "GLAD TISSUES WHOLESALE RATE LIST",
    subtitle: "Commercial Pop-Up Tissue Boxes & Institutional Paper Packs",
    headerColor: rgb(0.72, 0.45, 0.08), // #b87314
    accentColor: rgb(0.88, 0.58, 0.12),
    items: [
      { name: "Glad Pop-Up Facial Tissue Box (100 Sheets x 2 Ply)", spec: "2-ply virgin pulp soft tissue", pack: "40 boxes / carton", rate: "Rs 175" },
      { name: "Glad Pop-Up Carton Wholesale Lot", spec: "Full Master Carton Supply", pack: "40 boxes / carton", rate: "Rs 7,000" },
    ],
  },
  {
    id: "shinewell",
    filename: "shinewell-rate-list.pdf",
    brandTitle: "SHINE WELL WHOLESALE RATE LIST",
    subtitle: "Aerosol Furniture Polishes, Multi-Surface Shine & Glass Cleaners",
    headerColor: rgb(0.38, 0.22, 0.58), // #613894
    accentColor: rgb(0.50, 0.30, 0.75),
    items: [
      { name: "Shine Well Furniture Polish Aerosol 400ml", spec: "Deep wood gloss & dust shield", pack: "24 cans / carton", rate: "Rs 550" },
      { name: "Shine Well Glass Cleaner 500ml", spec: "Streak-free trigger spray bottle", pack: "24 bottles / carton", rate: "Rs 295" },
      { name: "Shine Well Multi Surface & Leather Polish", spec: "Executive dashboard & chair care", pack: "24 cans / carton", rate: "Rs 550" },
    ],
  },
  {
    id: "sicura",
    filename: "sicura-rate-list.pdf",
    brandTitle: "SICURA DISPOSABLES RATE LIST",
    subtitle: "Hot & Cold Beverage Paper Cups & Food Grade Disposables",
    headerColor: rgb(0.68, 0.28, 0.12), // #ad471f
    accentColor: rgb(0.82, 0.38, 0.18),
    items: [
      { name: "Sicura Hot & Cold Paper Cups 8oz (Sleeve 50 Pcs)", spec: "Leak-proof coffee & tea cups", pack: "20 sleeves (1000 cups) / ctn", rate: "Rs 225 / sleeve" },
      { name: "Sicura Hot & Cold Paper Cups 6.5oz (Sleeve 50 Pcs)", spec: "Water cooler & beverage cups", pack: "20 sleeves (1000 cups) / ctn", rate: "Rs 200 / sleeve" },
      { name: "Heavy-Duty Black Garbage Bags 55 Gal (Pack of 50)", spec: "Tear-resistant commercial bags", pack: "10 packs / carton", rate: "Rs 1,450" },
      { name: "Disposable Nitrile Gloves Powder-Free (Box of 100)", spec: "Food & medical grade blue/black", pack: "10 boxes / carton", rate: "Rs 1,250" },
    ],
  },
  {
    id: "paper-supplies",
    filename: "softex-supersoft-rate-list.pdf",
    brandTitle: "SOFTEX & SUPER SOFT RATE LIST",
    subtitle: "Economy & Commercial Paper Rolls, Napkins, Soft Packs & Tissues",
    headerColor: rgb(0.18, 0.45, 0.38),
    accentColor: rgb(0.24, 0.58, 0.48),
    items: [
      { name: "Softex Pop Up Tissue Box", spec: "2-ply soft commercial tissue", pack: "40 boxes / carton", rate: "Rs 160" },
      { name: "Softex Mambo Roll (Carton)", spec: "Heavy-traffic washroom roll", pack: "24 rolls / carton", rate: "Rs 1,650" },
      { name: "Super Soft Pop Up Tissues", spec: "Perfumed soft facial tissue", pack: "40 boxes / carton", rate: "Rs 160" },
      { name: "Super Soft Party Pack Tissues", spec: "Soft poly pack commercial pack", pack: "30 packs / carton", rate: "Rs 220" },
      { name: "Super Soft Table Napkin (100 Sheets)", spec: "100 sheets folded dinner napkin", pack: "30 packs / carton", rate: "Rs 160" },
      { name: "Super Soft Coffee Napkin (100 Sheets)", spec: "22x22cm café napkin", pack: "40 packs / carton", rate: "Rs 140" },
    ],
  },
];

async function generateBrandPdf(catalog) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Top Accent Bar
  page.drawRectangle({
    x: 0,
    y: height - 12,
    width,
    height: 12,
    color: catalog.headerColor,
  });

  // Header Box
  page.drawRectangle({
    x: 36,
    y: height - 110,
    width: width - 72,
    height: 85,
    color: rgb(0.96, 0.97, 0.98),
  });
  page.drawRectangle({
    x: 36,
    y: height - 110,
    width: 6,
    height: 85,
    color: catalog.headerColor,
  });

  // Header Text
  page.drawText("PAK MULTILINKS HYGIENE & CORPORATE SUPPLIES", {
    x: 52,
    y: height - 48,
    size: 11,
    font: fontBold,
    color: catalog.headerColor,
  });

  page.drawText(catalog.brandTitle, {
    x: 52,
    y: height - 72,
    size: 18,
    font: fontBold,
    color: rgb(0.1, 0.12, 0.15),
  });

  page.drawText(catalog.subtitle, {
    x: 52,
    y: height - 92,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.35, 0.4, 0.45),
  });

  // Meta bar (Date, Contact, Delivery)
  page.drawRectangle({
    x: 36,
    y: height - 142,
    width: width - 72,
    height: 24,
    color: catalog.headerColor,
  });

  page.drawText("Official B2B Rates in PKR · Delivery Across Lahore & Punjab · WhatsApp: 0300 6917385 / 0317 1678829", {
    x: 46,
    y: height - 134,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Table Headers
  const tableTop = height - 170;
  const colX = [36, 60, 260, 420, 500];

  page.drawRectangle({
    x: 36,
    y: tableTop - 18,
    width: width - 72,
    height: 22,
    color: rgb(0.92, 0.94, 0.96),
  });

  page.drawText("#", { x: colX[0] + 6, y: tableTop - 11, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
  page.drawText("PRODUCT NAME", { x: colX[1], y: tableTop - 11, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
  page.drawText("SPECIFICATION", { x: colX[2], y: tableTop - 11, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
  page.drawText("PACKING", { x: colX[3], y: tableTop - 11, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
  page.drawText("OFFICIAL RATE", { x: colX[4], y: tableTop - 11, size: 8.5, font: fontBold, color: rgb(0.2, 0.25, 0.3) });

  // Rows
  let currentY = tableTop - 24;
  catalog.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    const rowHeight = 28;

    if (isEven) {
      page.drawRectangle({
        x: 36,
        y: currentY - rowHeight + 4,
        width: width - 72,
        height: rowHeight,
        color: rgb(0.98, 0.99, 1),
      });
    }

    // Border line below row
    page.drawLine({
      start: { x: 36, y: currentY - rowHeight + 4 },
      end: { x: width - 36, y: currentY - rowHeight + 4 },
      thickness: 0.5,
      color: rgb(0.88, 0.9, 0.92),
    });

    page.drawText(`${index + 1}`, {
      x: colX[0] + 6,
      y: currentY - 12,
      size: 8.5,
      font: fontBold,
      color: catalog.headerColor,
    });

    // Truncate long name if necessary
    const displayName = item.name.length > 36 ? item.name.slice(0, 34) + "..." : item.name;
    page.drawText(displayName, {
      x: colX[1],
      y: currentY - 12,
      size: 9,
      font: fontBold,
      color: rgb(0.12, 0.15, 0.18),
    });

    page.drawText(item.spec, {
      x: colX[2],
      y: currentY - 12,
      size: 8,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.45),
    });

    page.drawText(item.pack, {
      x: colX[3],
      y: currentY - 12,
      size: 8,
      font: fontRegular,
      color: rgb(0.3, 0.35, 0.4),
    });

    page.drawText(item.rate, {
      x: colX[4],
      y: currentY - 12,
      size: 9.5,
      font: fontBold,
      color: catalog.headerColor,
    });

    currentY -= rowHeight;
  });

  // Bottom Notice Box
  const noticeY = Math.max(currentY - 30, 80);
  page.drawRectangle({
    x: 36,
    y: noticeY - 45,
    width: width - 72,
    height: 48,
    color: rgb(0.96, 0.98, 0.96),
    borderColor: rgb(0.8, 0.88, 0.82),
    borderWidth: 1,
  });

  page.drawText("TERMS & BULK ORDER INQUIRIES:", {
    x: 48,
    y: noticeY - 14,
    size: 8.5,
    font: fontBold,
    color: catalog.headerColor,
  });

  page.drawText("• Rates are wholesale reference subject to final quantity confirmation and inventory availability.", {
    x: 48,
    y: noticeY - 26,
    size: 7.8,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
  });

  page.drawText("• For institutional invoices, bulk quotes (5% to 10% discount) & orders: WhatsApp +92 300 6917 385 | Shop No LG-9, Rehman Tower Main Market Gulberg II, Lahore.", {
    x: 48,
    y: noticeY - 38,
    size: 7.8,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
  });

  // Footer
  page.drawText(`Pak Multilinks Official Catalogue | Generated on October 2026 | www.pakmultilinks.com`, {
    x: 36,
    y: 20,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.55, 0.6),
  });

  const pdfBytes = await pdfDoc.save();
  const destPath = path.join(DOWNLOADS_DIR, catalog.filename);
  fs.writeFileSync(destPath, pdfBytes);
  console.log(`Generated: ${catalog.filename} (${pdfBytes.length} bytes)`);
}

async function run() {
  for (const cat of BRAND_CATALOGUES) {
    await generateBrandPdf(cat);
  }
  // Also copy master rate-list if exists
  const masterSrc = path.join(process.cwd(), "public", "rate-list.pdf");
  const masterDest = path.join(DOWNLOADS_DIR, "pak-multilinks-master-rate-list.pdf");
  if (fs.existsSync(masterSrc)) {
    fs.copyFileSync(masterSrc, masterDest);
    console.log("Copied master rate list to downloads/pak-multilinks-master-rate-list.pdf");
  }
  console.log("All brand rate list PDFs successfully created in public/downloads/");
}

run().catch(console.error);
