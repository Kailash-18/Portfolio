import { NextRequest } from "next/server";
import { browserCookie, browserMaxAge, requesterStatus, submitRequest } from "../../../lib/resume-access";
import { json, readForm, sessionCookie } from "../../../lib/resume-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return json(requesterStatus(request.cookies.get(browserCookie)?.value));
}

function validEmail(email: string) {
  const parts = email.split("@");
  if (parts.length !== 2 || email.length > 254) return false;
  const [local, domain] = parts;
  const atom = /^[a-z0-9!#$%&'*+/=?^_\`{|}~-]+$/i;
  return local.length <= 64 && local.split(".").every(part => atom.test(part))
    && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(domain);
}

export async function POST(request: NextRequest) {
  const form = await readForm(request);
  if (form instanceof Response) return form;
  const name = typeof form.name === "string" ? form.name.trim() : "";
  const email = typeof form.email === "string" ? form.email.trim() : "";
  if (!name || name.length > 100 || /[\x00-\x1f\x7f]/.test(name) || !validEmail(email)) {
    return json({ error: "Enter your name and a valid email address." }, 400);
  }
  const result = submitRequest(name, email, request.cookies.get(browserCookie)?.value);
  if (result.error) return json({ error: "Too many requests. Please try again in an hour." }, 429);
  if (result.current) return json(result.current);
  const response = json(requesterStatus(result.value), 201);
  response.cookies.set(browserCookie, result.value, sessionCookie(request, browserMaxAge));
  return response;
}
