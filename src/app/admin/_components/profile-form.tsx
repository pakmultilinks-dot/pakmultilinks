"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save, LoaderCircle, UserRound } from "lucide-react";
import { buttonClass, inputClass, panelClass } from "./ui";

export function ProfileForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/profile", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.error || "Could not load your profile.");
        setName(result.profile.name);
        setEmail(result.profile.email);
        setLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not save your name.");
      setName(result.profile.name);
      setMessage("Administrator name saved.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not save your profile.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <section
      id="administrator"
      className={`${panelClass} mb-6 scroll-mt-20 p-5 sm:p-6`}
    >
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <UserRound size={20} aria-hidden="true" /> Administrator profile
      </h2>
      <p className="mt-2 text-sm text-secondary">
        Set the name shown in your admin account and navigation.
      </p>
      <form onSubmit={submit} className="mt-5 space-y-4">
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-sm text-accent">
            {message}
          </p>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Your display name
            <input
              className={inputClass}
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              disabled={!loaded || saving}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold">
            Sign-in email
            <input
              className={inputClass}
              value={email}
              readOnly
              disabled
              aria-describedby="profile-email-help"
            />
            <span
              id="profile-email-help"
              className="mt-2 block text-xs font-normal text-muted"
            >
              Your sign-in email is unchanged.
            </span>
          </label>
        </div>
        <button className={buttonClass} disabled={!loaded || saving}>
          {saving ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Save size={16} aria-hidden="true" />
          )}
          {saving ? "Saving…" : "Save administrator name"}
        </button>
      </form>
    </section>
  );
}
