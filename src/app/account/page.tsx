import type { Metadata } from "next";
import { AccountClient } from "@/components/commerce/account-client";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = { title: "My Account", description: "Manage your Pak Multilinks Hygiene customer profile, addresses, and linked orders.", robots: { index: false, follow: false } };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const params = await searchParams;
  return <CommerceShell eyebrow="Customer area" title="My account" description="Manage personal information and saved addresses, and review orders linked to your signed-in account."><AccountClient welcome={params.welcome === "1"} /></CommerceShell>;
}
