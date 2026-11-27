import { NextRequest } from "next/server";
import { browserCookie, browserMaxAge, requesterStatus, submitRequest } from "../../../lib/resume/resume-access";
import { json, readForm, sessionCookie } from "../../../lib/resume/resume-http";
import { notifyResumeView } from "../../../lib/resume/resume-notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return json(requesterStatus(request.cookies.get(browserCookie)?.value));
}

export async function POST(request: NextRequest) {
  const form = await readForm(request);
  if (form instanceof Response) return form;
  const name = typeof form.name === "string" ? form.name.trim() : "";
  if (!name || name.length > 100 || /[\x00-\x1f\x7f]/.test(name)) {
    return json({ error: "Enter your name." }, 400);
  }
  const result = submitRequest(name, request.cookies.get(browserCookie)?.value);
  if (result.error) return json({ error: "Too many requests. Please try again in an hour." }, 429);
  if (result.current) {
    const sessionToken = request.cookies.get(browserCookie)?.value;
    if (sessionToken) void notifyResumeView(sessionToken);
    return json(result.current);
  }
  const response = json(requesterStatus(result.value), 201);
  response.cookies.set(browserCookie, result.value, sessionCookie(request, browserMaxAge));
  void notifyResumeView(result.value);
  return response;
}
