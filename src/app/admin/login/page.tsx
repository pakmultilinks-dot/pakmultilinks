import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "ADMIN") redirect("/admin");
  const configured = Boolean(
    process.env.ADMIN_EMAIL &&
      (process.env.ADMIN_PASSWORD_HASH || (process.env.NODE_ENV !== "production" && process.env.ADMIN_PASSWORD)),
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f8f5] px-4 py-12">
      <section className="w-full max-w-md rounded-[2rem] border border-emerald-950/10 bg-white p-7 shadow-[0_24px_70px_rgba(16,66,45,0.12)] sm:p-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-emerald-900 text-white"><ShieldCheck aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Secure area</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Administration</h1>
          </div>
        </div>
        <p className="mb-7 text-sm leading-6 text-slate-600">Sign in to manage products, inventory, orders, quotation requests, and store details.</p>
        {!configured && (
          <div role="status" className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Admin sign-in is not configured. Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD_HASH</code>. During local development only, <code>ADMIN_PASSWORD</code> may replace the hash.
          </div>
        )}
        <AdminLoginForm disabled={!configured} />
        <Link href="/" className="mt-7 block text-center text-sm font-semibold text-emerald-800 hover:underline">Return to storefront</Link>
      </section>
    </main>
  );
}
