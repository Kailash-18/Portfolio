import { NextRequest } from "next/server";
import { decide, endOwnerSession, isOwner, listRequests, ownerCookie, ownerMaxAge, redeemOwnerCode } from "../../../../lib/resume/resume-access";
import { json, readForm, sessionCookie } from "../../../../lib/resume/resume-http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!isOwner(request.cookies.get(ownerCookie)?.value)) return json({ signedIn: false }, 401);
  return json({ signedIn: true, requests: listRequests() });
}

export async function POST(request: NextRequest) {
  const data = await readForm(request);
  if (data instanceof Response) return data;
  if (data.action === "login") {
    if (typeof data.code !== "string") return json({ error: "Enter the single-use code." }, 400);
    const result = redeemOwnerCode(data.code.trim());
    if (result.error === "limited") return json({ error: "Please wait a minute before trying again." }, 429);
    if (!result.session) return json({ error: "That code is invalid or expired." }, 401);
    const response = json({ signedIn: true, requests: listRequests() });
    response.cookies.set(ownerCookie, result.session, sessionCookie(request, ownerMaxAge));
    return response;
  }
  const token = request.cookies.get(ownerCookie)?.value;
  if (!token || !isOwner(token)) return json({ error: "Sign in to review requests." }, 401);
  if (data.action === "logout") {
    endOwnerSession(token);
    const response = json({ signedIn: false });
    response.cookies.set(ownerCookie, "", sessionCookie(request, 0));
    return response;
  }
  const action = data.action;
  if ((action !== "approve" && action !== "deny" && action !== "revoke") || typeof data.id !== "string" || !/^[a-f0-9]{32}$/.test(data.id)) return json({ error: "Choose a request and an action." }, 400);
  if (!decide(data.id, action)) return json({ error: "This request has changed. Refresh the list to see its current status." }, 409);
  return json({ signedIn: true, requests: listRequests() });
}
