import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { InvalidJsonError, PayloadTooLargeError, readJson } from "@/app/api/_utils";

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().trim().min(1).max(6000),
  })).min(1).max(12),
});
const replySchema = z.object({ reply: z.string().trim().min(1).max(6000) });
const headers = { "Cache-Control": "no-store" };
const failure = (error: string, status: number) => NextResponse.json({ error }, { status, headers });

export async function POST(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return failure("Request not allowed.", 403);
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return failure("Request not allowed.", 403);

  let payload;
  try {
    payload = chatSchema.safeParse(await readJson(request, 80_000));
  } catch (error) {
    if (error instanceof PayloadTooLargeError) return failure("Your conversation is too long. Please start again.", 413);
    if (error instanceof InvalidJsonError) return failure("Invalid message format.", 400);
    return failure("Unable to read your message.", 400);
  }
  if (!payload.success || payload.data.messages.at(-1)?.role !== "user" || payload.data.messages.some((message) => message.role === "user" && message.content.length > 2000)) {
    return failure("Please enter a message of up to 2,000 characters.", 400);
  }

  // Provider adapter: POST { messages: [{ role, content }] }; expect { reply: string }.
  // Keep credentials here on the server, never in NEXT_PUBLIC_* variables.
  const endpoint = process.env.CHATBOT_API_URL;
  if (!endpoint) return failure("Live chat is coming soon. Please use WhatsApp or request a bulk quote and our team will help you.", 503);

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CHATBOT_API_KEY ? { Authorization: `Bearer ${process.env.CHATBOT_API_KEY}` } : {}),
      },
      body: JSON.stringify(payload.data),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!upstream.ok) return failure("Our assistant is unavailable right now. Please try again or contact our team.", 502);
    const result = replySchema.safeParse(await upstream.json());
    if (!result.success) return failure("Our assistant couldn't reply. Please try again.", 502);
    return NextResponse.json(result.data, { headers });
  } catch {
    return failure("Our assistant couldn't connect. Please try again or contact us on WhatsApp.", 502);
  }
}
