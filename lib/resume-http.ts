import { NextRequest, NextResponse } from "next/server";

export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, noarchive",
  "Referrer-Policy": "no-referrer",
  Vary: "Cookie",
};

export function json(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: privateHeaders });
}

function originFor(request: NextRequest) {
  if (process.env.RESUME_ACCESS_ORIGIN) return new URL(process.env.RESUME_ACCESS_ORIGIN).origin;
  const host = request.headers.get("host");
  return host ? request.nextUrl.protocol + "//" + host : request.nextUrl.origin;
}

export function sessionCookie(request: NextRequest, maxAge: number) {
  return { httpOnly: true, sameSite: "strict" as const, secure: originFor(request).startsWith("https://"), path: "/api/resume", maxAge };
}

export async function readForm(request: NextRequest): Promise<Record<string, unknown> | Response> {
  if (request.headers.get("origin") !== originFor(request)) return json({ error: "Use the form on this website." }, 403);
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") return json({ error: "Submit JSON form data." }, 415);
  const reader = request.body?.getReader();
  if (!reader) return json({ error: "The form is empty." }, 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4096) {
        await reader.cancel();
        return json({ error: "The form is too large." }, 413);
      }
      chunks.push(value);
    }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Invalid form");
    return data as Record<string, unknown>;
  } catch {
    return json({ error: "Check the form and try again." }, 400);
  } finally {
    reader.releaseLock();
  }
}
