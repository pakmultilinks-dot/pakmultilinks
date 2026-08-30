"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";

export function AdminLoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to sign in.");
      if (result.user?.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This account does not have administrator access.");
      }
      router.replace("/admin");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold text-slate-800">
        Email address
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
          <Mail className="size-4 text-slate-400" aria-hidden="true" />
          <input name="email" type="email" autoComplete="username" required disabled={disabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Password
        <span className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
          <LockKeyhole className="size-4 text-slate-400" aria-hidden="true" />
          <input name="password" type="password" autoComplete="current-password" required disabled={disabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button disabled={disabled || pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  );
}
