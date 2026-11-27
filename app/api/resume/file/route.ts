import path from "node:path";
import { readFile } from "node:fs/promises";
import { NextRequest } from "next/server";
import { after } from "next/server";
import { notifyResumeView } from "../../../../lib/resume/resume-notifications";
import { requesterStatus, browserCookie } from "../../../../lib/resume/resume-access";
import { privateHeaders, json } from "../../../../lib/resume/resume-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(browserCookie)?.value;
  if (requesterStatus(session).status !== "approved") {
    return json({ error: "Enter your name at /resume to view the PDF." }, 403);
  }
  let pdf: Buffer;
  try {
    pdf = await readFile(path.join(process.cwd(), "private", "Kailash-Ambadipudi-Resume.pdf"));
  } catch {
    return json({ error: "The résumé is not configured on this server." }, 503);
  }
  if (request.method === "GET") after(() => notifyResumeView(session));
  return new Response(new Uint8Array(pdf), { headers: {
    ...privateHeaders, "Content-Type": "application/pdf",
    "Content-Disposition": 'inline; filename="Kailash-Ambadipudi-Resume.pdf"',
    "Content-Length": String(pdf.length),
    "Content-Security-Policy": "frame-ancestors 'self'",
  } });
}
