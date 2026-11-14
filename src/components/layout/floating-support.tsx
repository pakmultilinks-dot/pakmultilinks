"use client";

import { ArrowUp, Bot, LoaderCircle, MessageCircle, X } from "lucide-react";
import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";

import { useSalesContactNumber } from "@/components/commerce/sales-contact";
import { company } from "@/lib/company";

type Message = { role: "user" | "assistant"; content: string };

export function FloatingSupport() {
  const whatsapp = useSalesContactNumber();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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
    function onClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        launcherRef.current &&
        !launcherRef.current.contains(event.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
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
        <section
          ref={panelRef}
          id="support-assistant"
          role="dialog"
          aria-modal="false"
          aria-labelledby="support-assistant-title"
          className="fixed bottom-[4.5rem] left-6 z-[70] hidden sm:flex h-[min(26rem,calc(100dvh-6rem))] w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-line bg-surface px-4 py-3 text-content">
            <div className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-action text-white">
              <Bot className="size-4.5" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-surface bg-green-500" />
            </div>
            <div className="min-w-0 flex-1"><h2 id="support-assistant-title" className="text-sm font-semibold leading-5">Pak Multilinks AI</h2><p className="text-[11px] leading-4 text-muted">Online - replies instantly</p></div>
            <button type="button" onClick={close} className="grid size-8 shrink-0 place-items-center rounded-lg transition-colors hover:bg-surface-soft focus-visible:outline-2 focus-visible:outline-focus" aria-label="Close chat"><X className="size-4.5" /></button>
          </div>
          <div ref={logRef} role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-surface px-4 py-5">
            <div className="flex items-start gap-2">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-action/10 text-action"><Bot className="size-4" /></div>
              <p className="w-fit max-w-[85%] rounded-md rounded-tl-sm border border-line bg-surface px-3.5 py-3 text-sm leading-5 text-accent">Hello, and welcome to Pak Multilinks support. How can I help you today? I can answer questions about our hygiene supplies and bulk orders.</p>
            </div>
            {messages.map((message, index) => message.role === "user" ? (
              <p key={index} className="ml-auto w-fit max-w-[90%] whitespace-pre-wrap break-words rounded-md rounded-br-sm bg-action px-3.5 py-2.5 text-sm leading-5 text-white"><span className="sr-only">You: </span>{message.content}</p>
            ) : (
              <div key={index} className="flex items-start gap-2">
                <div className="grid size-7 shrink-0 place-items-center rounded-full bg-action/10 text-action"><Bot className="size-4" /></div>
                <p className="w-fit max-w-[85%] whitespace-pre-wrap break-words rounded-md rounded-tl-sm border border-line bg-surface px-3.5 py-2.5 text-sm leading-5 text-accent"><span className="sr-only">Assistant: </span>{message.content}</p>
              </div>
            ))}
            {pending && <div className="flex items-start gap-2">
              <div className="grid size-7 shrink-0 place-items-center rounded-full bg-action/10 text-action"><Bot className="size-4" /></div>
              <p className="flex items-center gap-2 rounded-md rounded-tl-sm border border-line bg-surface px-3.5 py-2.5 text-xs text-secondary"><LoaderCircle className="size-4 animate-spin" aria-hidden="true" />Typing…</p>
            </div>}
          </div>
          <div className="shrink-0 border-t border-line bg-surface px-3 py-3">
            {error && <p role="alert" className="mb-2 rounded-lg bg-surface-soft px-3 py-2 text-xs leading-5 text-danger">{error}</p>}
            <form onSubmit={sendMessage} className="flex items-end gap-2">
              <label htmlFor="support-message" className="sr-only">Your message</label>
              <textarea
                ref={inputRef}
                id="support-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onInputKeyDown}
                maxLength={2000}
                readOnly={pending}
                rows={1}
                placeholder="Write a message…"
                className="no-scrollbar max-h-28 min-h-11 min-w-0 flex-1 resize-none overflow-hidden rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm leading-6 text-accent outline-none transition-colors placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus"
                style={{ scrollbarWidth: "none" }}
              />
              <button type="submit" disabled={pending || !draft.trim()} aria-label="Send message" className="focus-ring grid size-11 shrink-0 place-items-center rounded-md bg-action text-white transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:bg-disabled"><ArrowUp className="size-5" /></button>
            </form>
            <p className="mt-2 text-center text-[11px] leading-4 text-muted">Need a person? <a className="font-semibold text-accent underline underline-offset-2" href={`tel:${company.phoneHref}`}>Call our team</a></p>
          </div>
        </section>
      )}
      <button
        ref={launcherRef}
        type="button"
        onClick={() => open ? close() : setOpen(true)}
        aria-expanded={open}
        aria-controls={open ? "support-assistant" : undefined}
        aria-label={open ? "Close chat" : "Chat with us"}
        className="focus-ring fixed bottom-5 left-6 z-[65] hidden sm:grid size-10 place-items-center rounded-xl bg-action text-white shadow-md transition hover:bg-action-hover hover:scale-105"
        title="Chat with Pak Multilinks AI"
      >
        {open ? <X className="size-5" /> : <Bot className="size-5" />}
      </button>
      <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi Pak Multilinks, I am inquiring about wholesale supplies")}`} target="_blank" rel="noreferrer" className="focus-ring fixed bottom-5 right-6 z-[65] hidden size-10 place-items-center rounded-xl border border-white/40 bg-action text-white shadow-md transition hover:bg-action-hover hover:scale-105 sm:grid" aria-label="Chat with our team on WhatsApp" title="Chat on WhatsApp"><MessageCircle className="size-5" /></a>
    </>
  );
}
