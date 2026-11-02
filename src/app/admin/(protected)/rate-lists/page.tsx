import { RateListsManager } from "../../_components/rate-lists-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { db, isDatabaseConfigured } from "@/lib/db";
import { listAllRateListFiles } from "@/lib/rate-lists-server";
import { syncStorefrontTaxonomy } from "@/lib/admin-catalog-sync";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogues & Rate Lists — Pak Multilinks Admin",
};

export default async function RateListsAdminPage() {
  const connected = isDatabaseConfigured;
  if (connected) await syncStorefrontTaxonomy();
  const [files, categories, brands] = await Promise.all([
    listAllRateListFiles(),
    connected ? db.category.findMany({ where: { isActive: true }, orderBy: [{ parentId: "asc" }, { name: "asc" }], select: { name: true } }) : [],
    connected ? db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { name: true } }) : [],
  ]);
  const taxonomyOptions = [...categories.map((item) => item.name), ...brands.map((item) => item.name)];

  return (
    <>
      <PageHeading
        eyebrow="Catalogue & Distribution"
        title="Catalogues & Rate Lists"
        description="Manage both document types in one place. Choose catalogue or rate list, upload its PDF, select a hygiene or cleaning cover, or provide a custom cover."
      />
      {!connected && <DemoNotice />}
      <RateListsManager initialFiles={files} taxonomyOptions={taxonomyOptions} disabled={!connected} />
    </>
  );
}
