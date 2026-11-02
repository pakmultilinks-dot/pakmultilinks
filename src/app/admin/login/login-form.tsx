"use client";

import {
  useEffect,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function AdminLoginForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const interactive = useSyncExternalStore(
    subscribeToHydration,
    clientReady,
    serverReady,
  );
  const formDisabled = disabled || !interactive;
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
    <form
      action="/api/auth/login"
      method="post"
      onSubmit={submit}
      className="space-y-4"
    >
      <label className="block text-sm font-semibold text-content">
        Email address
        <span className="mt-2 flex items-center gap-2 rounded-md border border-line px-3 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/10">
          <Mail className="size-4 text-muted" aria-hidden="true" />
          <input name="email" type="email" autoComplete="username" required disabled={formDisabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      <label className="block text-sm font-semibold text-content">
        Password
        <span className="mt-2 flex items-center gap-2 rounded-md border border-line px-3 focus-within:border-focus focus-within:ring-2 focus-within:ring-focus/10">
          <LockKeyhole className="size-4 text-muted" aria-hidden="true" />
          <input name="password" type="password" autoComplete="current-password" required disabled={formDisabled} className="h-12 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-not-allowed" />
        </span>
      </label>
      {retrySeconds > 0 && <p role="status" className="rounded-md bg-warning-soft px-4 py-3 text-sm text-warning">Too many sign-in attempts. You can try again in {retryLabel}.</p>}
      {error && <p role="alert" className="rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>}
      <button disabled={formDisabled || pending || retrySeconds > 0} className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-neutral-900 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Signing in…" : retrySeconds > 0 ? `Try again in ${retryLabel}` : "Sign in securely"}
      </button>
    </form>
  );
}
