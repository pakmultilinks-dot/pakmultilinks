import type { Metadata } from "next";
import { RegisterForm } from "@/components/commerce/auth-forms";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = { title: "Create Account", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return <CommerceShell eyebrow="Customer account" title="Create your account" description="Save your details and view linked order history when customer authentication and the database are configured."><div className="mx-auto max-w-2xl"><RegisterForm /></div></CommerceShell>;
}
