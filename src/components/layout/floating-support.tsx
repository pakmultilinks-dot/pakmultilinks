"use client";

import { Bot, LoaderCircle, MessageCircle, Send, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";

import { company } from "@/lib/company";

type Message = { role: "user" | "assistant"; content: string };

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, pending, open]);

  useEffect(() => () => requestRef.current?.abort(), []);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || pending) return;
    const nextMessages: Message[] = [...messages, { role: "user", content }];
    const controller = new AbortController();
    requestRef.current = controller;
    setMessages(nextMessages);
    setDraft("");
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-12) }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error(typeof data.error === "string" ? data.error : "We couldn't send your message. Please try again.");
      }
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (cause) {
      if (controller.signal.aborted) return;
      setMessages(nextMessages.slice(0, -1));
      setDraft(content);
      setError(cause instanceof Error ? cause.message : "Please try again or contact us on WhatsApp.");
    } finally {
      setPending(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      {open && (
        <section id="support-assistant" role="dialog" aria-modal="false" aria-labelledby="support-assistant-title" className="fixed bottom-24 left-4 z-[70] flex max-h-[calc(100dvh-7rem)] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-[#c9ddcf] bg-white shadow-[0_24px_70px_rgba(10,57,34,.24)] animate-slide-up sm:left-6">
          <div className="flex shrink-0 items-center gap-3 bg-gradient-to-br from-[#104d31] to-[#21804d] p-5 text-white">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white/15"><Bot className="size-6" aria-hidden="true" /></span>
            <div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-100">A little help, anytime</p><h2 id="support-assistant-title" className="mt-1 text-base font-extrabold">Pak Multilinks Assistant</h2></div>
            <button type="button" onClick={close} className="ml-auto grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white" aria-label="Close assistant"><X className="size-5" /></button>
          </div>
          <div ref={logRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#fafcf9] p-4">
            <p className="mr-5 rounded-2xl rounded-tl-sm border border-[#e1ebe3] bg-white p-3 text-sm leading-6 text-[#315943]">Assalam-o-Alaikum! Welcome to Pak Multilinks. How can we help with your hygiene supplies today?</p>
            {messages.map((message, index) => <p key={index} className={`whitespace-pre-wrap break-words rounded-2xl p-3 text-sm leading-6 ${message.role === "user" ? "ml-8 rounded-br-sm bg-[#17643a] text-white" : "mr-5 rounded-tl-sm border border-[#e1ebe3] bg-white text-[#315943]"}`}><span className="sr-only">{message.role === "user" ? "You: " : "Assistant: "}</span>{message.content}</p>)}
            {pending && <p className="flex items-center gap-2 text-xs text-[#66756c]"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Preparing a reply…</p>}
          </div>
          <div className="shrink-0 border-t border-[#e0e9e2] p-4">
            <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold text-[#17643a]">
              <Link href="/shop" onClick={close} className="focus-ring rounded-full bg-[#eef7f0] px-3 py-2">Browse products</Link>
              <Link href="/request-quote" onClick={close} className="focus-ring rounded-full bg-[#eef7f0] px-3 py-2">Get a bulk quote ↗</Link>
            </div>
            {error && <p role="alert" className="mb-3 text-xs leading-5 text-[#a1242c]">{error}</p>}
            <form onSubmit={sendMessage} className="flex gap-2">
              <label htmlFor="support-message" className="sr-only">Your message</label>
              <input ref={inputRef} id="support-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} readOnly={pending} placeholder="Type your message…" autoComplete="off" className="min-w-0 flex-1 rounded-xl border border-[#ceddd2] px-3 py-3 text-base outline-none focus:border-[#17643a] focus:ring-2 focus:ring-[#dff2e5]" />
              <button type="submit" disabled={pending || !draft.trim()} aria-label="Send message" className="focus-ring grid size-12 shrink-0 place-items-center rounded-xl bg-[#17643a] text-white disabled:cursor-not-allowed disabled:opacity-40"><Send className="size-4" /></button>
            </form>
            <p className="mt-2 text-center text-[10px] text-[#718077]">Need a person? <a className="underline" href={`tel:${company.phoneHref}`}>Call our team</a></p>
          </div>
        </section>
      )}
      <div className="fixed bottom-5 left-4 z-[65] flex items-center sm:left-6">
        <button ref={launcherRef} type="button" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls={open ? "support-assistant" : undefined} aria-label={open ? "Close assistant" : "Open chat assistant"} className="focus-ring flex h-12 items-center gap-2 rounded-full bg-[#7CFC00] px-5 text-sm font-bold text-[#173328] shadow-sm transition-colors hover:bg-[#70e600]">{open ? <X className="size-5" /> : <Bot className="size-6" />}<span>Let’s chat</span></button>
        <a href={`https://wa.me/${company.phoneHref.replace("+", "")}`} target="_blank" rel="noreferrer" className="focus-ring fixed bottom-5 right-4 grid size-11 place-items-center sm:right-6 rounded-full border border-white/60 bg-[#238b4e] text-white shadow-lg" aria-label="Chat with our team on WhatsApp" title="Chat on WhatsApp"><MessageCircle className="size-5" /></a>
      </div>
    </>
  );
}
