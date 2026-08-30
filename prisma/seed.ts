import { PrismaClient, ProductStatus, UserRole } from "@prisma/client";
import { categories, products } from "../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  const brand = await prisma.brand.upsert({
    where: { slug: "unbranded" },
    update: { name: "Unbranded", isActive: true },
    create: { id: "brand-unbranded", slug: "unbranded", name: "Unbranded", isActive: true },
  });

  const categoryIds = new Map<string, string>();
  for (const [sortOrder, category] of categories.entries()) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder,
        isActive: true,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        sortOrder,
        isActive: true,
      },
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing seed category: ${product.categorySlug}`);

    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice ?? null,
        priceOnRequest: product.priceOnRequest,
        unitsPerCarton: product.unitsPerCarton,
        minimumOrderCartons: product.minimumOrderCartons,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        allowBackorder: product.allowBackorder ?? false,
        featured: product.featured ?? false,
        bestSeller: product.bestSeller ?? false,
        bulkPricing: product.bulkPricing ?? false,
        status: ProductStatus.ACTIVE,
        categoryId,
        brandId: brand.id,
        images: {
          deleteMany: {},
          create: product.gallery.map((url, sortOrder) => ({ url, alt: product.name, sortOrder })),
        },
        attributes: {
          deleteMany: {},
          create: product.attributes.map((attribute, sortOrder) => ({ ...attribute, sortOrder })),
        },
      },
      create: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        salePrice: product.salePrice ?? null,
        priceOnRequest: product.priceOnRequest,
        unitsPerCarton: product.unitsPerCarton,
        minimumOrderCartons: product.minimumOrderCartons,
        stock: product.stock,
        lowStockThreshold: product.lowStockThreshold,
        allowBackorder: product.allowBackorder ?? false,
        featured: product.featured ?? false,
        bestSeller: product.bestSeller ?? false,
        bulkPricing: product.bulkPricing ?? false,
        status: ProductStatus.ACTIVE,
        categoryId,
        brandId: brand.id,
        images: { create: product.gallery.map((url, sortOrder) => ({ url, alt: product.name, sortOrder })) },
        attributes: { create: product.attributes.map((attribute, sortOrder) => ({ ...attribute, sortOrder })) },
      },
    });
  }

  await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      businessName: "Pak Multilinks Hygiene",
      subtitle: "Corporate Supplies",
      tagline: "Your Hygiene Partner",
      phone: "+92 300 6917 385",
      email: "zohair.shah8@gmail.com",
      address: "Shop No LG-9, Rehman Tower Main Market Gulberg II, Lahore",
      currency: "PKR",
      bankTransferEnabled: false,
      deliveryInformation: "Delivery timing and charges are confirmed after order review.",
      announcement: "Corporate and bulk enquiries are welcome.",
    },
  });

  const defaultDeals = [
    {
      id: "deal-warehouse-quality",
      title: "Quality hygiene supply",
      imageUrl: "/images/deals/warehouse-quality.png",
      alt: "Pak Multilinks bulk hygiene products and warehouse supply",
      linkUrl: "/shop",
      sortOrder: 0,
    },
    {
      id: "deal-special-offer",
      title: "Special hygiene offer",
      imageUrl: "/images/deals/special-offer.png",
      alt: "Pak Multilinks special offer on selected hygiene products",
      linkUrl: "/shop",
      sortOrder: 1,
    },
  ];
  for (const deal of defaultDeals) {
    await prisma.dealBanner.upsert({
      where: { id: deal.id },
      update: {},
      create: { ...deal, isActive: true },
    });
  }

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
      update: { role: UserRole.ADMIN, passwordHash: process.env.ADMIN_PASSWORD_HASH, isActive: true },
      create: {
        email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
        name: "Administrator",
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
        role: UserRole.ADMIN,
      },
    });
  }

  console.info(`Seeded ${categories.length} demo categories, ${products.length} demo products, and ${defaultDeals.length} deal banners.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
