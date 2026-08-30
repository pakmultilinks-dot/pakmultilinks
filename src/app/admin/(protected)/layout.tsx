import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth";
import { AdminShell } from "../_components/admin-shell";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
