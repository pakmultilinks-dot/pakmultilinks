"use client";

import { ArrowUp, LoaderCircle, MessageCircle, X } from "lucide-react";
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

import { company } from "@/lib/company";

type Message = { role: "user" | "assistant"; content: string };

export function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    // Avoid opening the on-screen keyboard as soon as the panel appears on mobile.
    if (window.matchMedia("(min-width: 640px)").matches) inputRef.current?.focus();
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

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  }, [draft, open]);

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
      requestRef.current = null;
    }
  }

  function onInputKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <>
      {open && (
        <section id="support-assistant" role="dialog" aria-modal="false" aria-labelledby="support-assistant-title" className="fixed bottom-[5.25rem] left-3 z-[70] flex h-[min(25rem,calc(100dvh-6rem))] w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg sm:left-6">
          <div className="flex shrink-0 items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3.5 text-neutral-900">
            <div className="min-w-0 flex-1"><h2 id="support-assistant-title" className="text-sm font-medium leading-5">Chat with us</h2><p className="text-[11px] leading-4 text-neutral-500">Pak Multilinks support</p></div>
            <button type="button" onClick={close} className="grid size-9 shrink-0 place-items-center rounded-lg transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-neutral-500" aria-label="Close chat"><X className="size-5" /></button>
          </div>
          <div ref={logRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-white px-4 py-5">
            <p className="w-fit max-w-[90%] rounded-md border border-[#e0ebe2] bg-white px-3.5 py-3 text-sm leading-5 text-[#315943]">Welcome to Pak Multilinks. Send us a message.</p>
            {messages.map((message, index) => <p key={index} className={`w-fit max-w-[90%] whitespace-pre-wrap break-words rounded-md px-3.5 py-2.5 text-sm leading-5 ${message.role === "user" ? "ml-auto bg-[#17643a] text-white" : "border border-[#e0ebe2] bg-white text-[#315943]"}`}><span className="sr-only">{message.role === "user" ? "You: " : "Assistant: "}</span>{message.content}</p>)}
            {pending && <p className="flex items-center gap-2 text-xs text-[#66756c]"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Replying…</p>}
          </div>
          <div className="shrink-0 border-t border-[#e3ece5] bg-white px-3 py-3">
            {error && <p role="alert" className="mb-2 rounded-lg bg-[#fff1f0] px-3 py-2 text-xs leading-5 text-[#a1242c]">{error}</p>}
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <label htmlFor="support-message" className="sr-only">Your message</label>
              <textarea ref={inputRef} id="support-message" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={onInputKeyDown} maxLength={2000} readOnly={pending} rows={1} placeholder="Write a message…" className="max-h-28 min-h-11 min-w-0 flex-1 resize-none overflow-y-auto rounded-md border border-[#ceddd2] bg-white px-3.5 py-2.5 text-sm leading-6 text-[#173328] outline-none transition-colors placeholder:text-[#8b9890] focus:border-[#17643a] focus:ring-2 focus:ring-[#dff2e5]" />
              <button type="submit" disabled={pending || !draft.trim()} aria-label="Send message" className="focus-ring grid size-11 shrink-0 place-items-center rounded-md bg-[#17643a] text-white transition-colors hover:bg-[#104d31] disabled:cursor-not-allowed disabled:bg-[#b7cbbd]"><ArrowUp className="size-5" /></button>
            </form>
            <p className="mt-2 text-center text-[11px] leading-4 text-[#718077]">Need a person? <a className="font-semibold text-[#17643a] underline underline-offset-2" href={`tel:${company.phoneHref}`}>Call our team</a></p>
          </div>
        </section>
      )}
      <button ref={launcherRef} type="button" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls={open ? "support-assistant" : undefined} aria-label={open ? "Close chat" : "Chat with us"} className="focus-ring fixed bottom-16 left-3 z-[65] flex h-10 items-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-3 text-xs font-semibold text-[#23372d] shadow-md backdrop-blur-sm transition hover:bg-neutral-50 sm:bottom-5 sm:left-6 sm:h-11 sm:rounded-md sm:text-sm sm:font-medium">{open ? <X className="size-4" /> : <MessageCircle className="size-4" />}<span>Chat</span></button>
      <a href={`https://wa.me/${company.phoneHref.replace("+", "")}`} target="_blank" rel="noreferrer" className="focus-ring fixed bottom-5 right-6 z-[65] hidden size-12 place-items-center rounded-full border border-white/60 bg-[#25D366] text-white shadow-lg transition hover:bg-[#1fb355] sm:grid" aria-label="Chat with our team on WhatsApp" title="Chat on WhatsApp"><MessageCircle className="size-6" /></a>
    </>
  );
}
