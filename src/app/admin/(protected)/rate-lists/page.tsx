import { RateListsManager } from "../../_components/rate-lists-manager";
import { DemoNotice, PageHeading } from "../../_components/ui";
import { isDatabaseConfigured } from "@/lib/db";
import { listAllRateListFiles } from "@/lib/rate-lists-server";

export const metadata = {
  title: "Catalogues & Rate Lists — Pak Multilinks Admin",
};

export default async function RateListsAdminPage() {
  const connected = isDatabaseConfigured;
  const files = await listAllRateListFiles();

  return (
    <>
      <PageHeading
        eyebrow="Catalogue & Distribution"
        title="Catalogues & Rate Lists"
        description="Manage both document types in one place. Choose catalogue or rate list, upload its PDF, select a hygiene or cleaning cover, or provide a custom cover."
      />
      {!connected && <DemoNotice />}
      <RateListsManager initialFiles={files} disabled={!connected} />
    </>
  );
}
