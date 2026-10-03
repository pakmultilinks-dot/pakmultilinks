"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";

export function AdminLoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);
  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = window.setTimeout(() => setRetrySeconds(seconds => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [retrySeconds]);
  const retryLabel = `${Math.floor(retrySeconds / 60)}:${String(retrySeconds % 60).padStart(2, "0")}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || retrySeconds > 0) return;
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
      if (response.status === 429) {
        const wait = Number(response.headers.get("Retry-After") || result.retryAfter);
        setRetrySeconds(Number.isFinite(wait) && wait > 0 ? Math.ceil(wait) : 60);
        return;
      }
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
        <span className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
          <Mail className="size-4 text-slate-400" aria-hidden="true" />
          <input name="email" type="email" autoComplete="username" required disabled={disabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Password
        <span className="mt-2 flex items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-700/10">
          <LockKeyhole className="size-4 text-slate-400" aria-hidden="true" />
          <input name="password" type="password" autoComplete="current-password" required disabled={disabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      {retrySeconds > 0 && <p role="status" className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">Too many sign-in attempts. You can try again in {retryLabel}.</p>}
      {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      <button disabled={disabled || pending || retrySeconds > 0} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-neutral-900 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Signing in…" : retrySeconds > 0 ? `Try again in ${retryLabel}` : "Sign in securely"}
      </button>
    </form>
  );
}
