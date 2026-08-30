"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:ring-4 focus:ring-emerald-100";

async function parseResponse(response: Response) {
  try {
    const value: unknown = await response.json();
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

function apiError(response: Response, data: Record<string, unknown>) {
  if (typeof data.error === "string") return data.error;
  if (response.status === 404) return "Customer authentication is not configured on this deployment.";
  if (response.status === 503) return "The account database is not configured or is temporarily unavailable.";
  return "The request could not be completed. Please try again.";
}

function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <div className={`mt-5 flex gap-2 rounded-xl border p-4 text-sm leading-6 ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`} role={error ? "alert" : "status"}>
      {error ? <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> : <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
      {error || success}
    </div>
  );
}

export function LoginForm({ nextPath = "/account" }: { nextPath?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || submitting) return;
    const values = new FormData(form);
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.get("email"), password: values.get("password") }),
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(apiError(response, data));
      const user = data.user && typeof data.user === "object" ? (data.user as Record<string, unknown>) : {};
      const safeNext = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/account";
      router.push(user.role === "ADMIN" && safeNext === "/account" ? "/admin" : safeNext);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Sign in failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">Sign in securely</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Your session is created by the server; credentials are never stored in the browser store.</p>
      <div className="mt-6 space-y-5">
        <label className="block text-sm font-semibold text-slate-800">Email address
          <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="block text-sm font-semibold text-slate-800">Password
          <input className={inputClass} name="password" type="password" autoComplete="current-password" required maxLength={128} />
        </label>
      </div>
      <StatusMessage error={error} />
      <div className="mt-5 flex justify-end"><Link href="/forgot-password" className="text-sm font-semibold text-emerald-800 hover:underline">Forgot password?</Link></div>
      <button type="submit" disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{submitting ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Signing in…</> : <><LockKeyhole aria-hidden="true" className="size-4" /> Sign in</>}</button>
      <p className="mt-6 text-center text-sm text-slate-600">New customer? <Link href="/register" className="font-semibold text-emerald-800 hover:underline">Create an account</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || submitting) return;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    if (password !== String(values.get("confirmPassword") ?? "")) {
      setError("The password confirmation does not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.get("name"),
          email: values.get("email"),
          phone: values.get("phone") || undefined,
          password,
        }),
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(apiError(response, data));
      router.push("/account?welcome=1");
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">Customer details</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Registration requires the account database. Guest checkout remains available without an account.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800 sm:col-span-2">Full name
          <input className={inputClass} name="name" autoComplete="name" required minLength={2} maxLength={100} />
        </label>
        <label className="text-sm font-semibold text-slate-800">Email address
          <input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className="text-sm font-semibold text-slate-800">Phone <span className="font-normal text-slate-500">(optional)</span>
          <input className={inputClass} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={24} pattern="[+0-9][0-9 ()-]{6,23}" />
        </label>
        <label className="text-sm font-semibold text-slate-800">Password
          <input className={inputClass} name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}" aria-describedby="password-help" />
        </label>
        <label className="text-sm font-semibold text-slate-800">Confirm password
          <input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
        </label>
      </div>
      <p id="password-help" className="mt-3 text-xs leading-5 text-slate-500">Use at least 10 characters with uppercase, lowercase, and a number.</p>
      <StatusMessage error={error} />
      <button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{submitting ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Creating account…</> : "Create account"}</button>
      <p className="mt-6 text-center text-sm text-slate-600">Already registered? <Link href="/login" className="font-semibold text-emerald-800 hover:underline">Sign in</Link></p>
    </form>
  );
}

export function PasswordRecoveryForm({ token = "" }: { token?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [developmentToken, setDevelopmentToken] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || submitting) return;
    const values = new FormData(form);
    const password = String(values.get("password") ?? "");
    if (token && password !== String(values.get("confirmPassword") ?? "")) {
      setError("The password confirmation does not match.");
      return;
    }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(token ? "/api/auth/reset-password" : "/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token, password } : { email: values.get("email") }),
      });
      const data = await parseResponse(response);
      if (!response.ok) throw new Error(apiError(response, data));
      if (typeof data.developmentResetToken === "string") setDevelopmentToken(data.developmentResetToken);
      setSuccess(
        token
          ? "Your password was updated. You can now sign in."
          : "The request was accepted. If an active account exists, reset instructions can be sent when transactional email delivery is configured.",
      );
      form.reset();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Password recovery failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-slate-950">{token ? "Choose a new password" : "Request password reset"}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{token ? "The reset token is verified securely by the server and can only be used once." : "For privacy, the response does not reveal whether an email address has an account."}</p>
      {token ? (
        <div className="mt-6 grid gap-5">
          <label className="text-sm font-semibold text-slate-800">New password<input className={inputClass} name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,}" /></label>
          <label className="text-sm font-semibold text-slate-800">Confirm new password<input className={inputClass} name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} maxLength={128} /></label>
          <p className="text-xs text-slate-500">Use at least 10 characters with uppercase, lowercase, and a number.</p>
        </div>
      ) : (
        <label className="mt-6 block text-sm font-semibold text-slate-800">Account email<input className={inputClass} name="email" type="email" autoComplete="email" required maxLength={254} /></label>
      )}
      <StatusMessage error={error} success={success} />
      {developmentToken ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Development only:</strong> no email provider is used. Continue using the generated <Link href={`/forgot-password?token=${encodeURIComponent(developmentToken)}`} className="font-bold underline">local reset link</Link>. Do not use this workflow in production.</div> : null}
      <button type="submit" disabled={submitting} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60">{submitting ? <><Loader2 aria-hidden="true" className="size-4 animate-spin" /> Submitting…</> : token ? "Update password" : "Request reset instructions"}</button>
      <p className="mt-6 text-center text-sm"><Link href="/login" className="font-semibold text-emerald-800 hover:underline">Return to sign in</Link></p>
    </form>
  );
}
