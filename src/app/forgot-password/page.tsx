import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/commerce/auth-forms";
import { CommerceShell } from "@/components/commerce/commerce-shell";

export const metadata: Metadata = { title: "Password Recovery", robots: { index: false, follow: false } };

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const hasToken = Boolean(params.token);
  return <CommerceShell eyebrow="Account security" title={hasToken ? "Reset your password" : "Forgot your password?"} description={hasToken ? "Choose a secure new password for your customer account." : "Request a one-time reset link for your account email."}><div className="mx-auto max-w-xl"><PasswordRecoveryForm token={params.token} /></div></CommerceShell>;
}
