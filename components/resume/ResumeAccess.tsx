"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, Check, Clock3, FileText, KeyRound, LockKeyhole, RefreshCw } from "lucide-react";
import type { AdminRecord, RequestStatus } from "../../lib/resume/resume-access";
import "./resume-access.css";

async function read<T>(endpoint: string, body?: object): Promise<T> {
  const response = await fetch(endpoint, {
    method: body ? "POST" : "GET", cache: "no-store", credentials: "same-origin",
    ...(body && { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok && !(response.status === 401 && data.signedIn === false)) throw new Error(data.error || "The server could not complete this request.");
  return data;
}

function failure(error: unknown) { return error instanceof Error ? error.message : "Please try again."; }
function date(stamp: number) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(stamp);
}

function AccessPage({ children, owner = false }: { children: ReactNode; owner?: boolean }) {
  return <main className={"access-page" + (owner ? " access-owner" : "")}>
    <a className="access-back" href="/"><ArrowLeft size={16}/>Back to portfolio</a>
    <div className="access-paper">
      <div className="access-doc"><FileText size={28} strokeWidth={1.4}/><span>Kailash Ambadipudi</span></div>
      {children}
    </div>
  </main>;
}

export function ResumeRequest() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void read<RequestStatus>("/api/resume").then((status) => {
      if (status?.status === "approved") {
        window.location.replace("/api/resume/file");
      }
    }).catch(() => {});
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      await read<RequestStatus>("/api/resume",{name:fields.get("name")});
      window.location.replace("/api/resume/file");
    } catch(e) {setError(failure(e));setBusy(false);}
  }
  return <AccessPage><h1>View my résumé<span>.</span></h1><p>Enter your name to open my résumé. I receive a private notification when it is viewed.</p>
    <form onSubmit={submit}><label>Your name<input name="name" autoComplete="name" maxLength={100} required/></label>
    <button disabled={busy} className="access-primary"><FileText size={16}/>{busy?"Opening…":"View résumé"}</button></form>
    {error && <p role="alert" className="access-error">{error}</p>}</AccessPage>;
}

type OwnerData = { signedIn: boolean; requests?: AdminRecord[] };
export function ResumeOwner() {
  const [state, setState] = useState<OwnerData | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    try { setState(await read<OwnerData>("/api/resume/owner")); setError(""); }
    catch (e) { setError(failure(e)); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!state?.signedIn || busy) return;
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
    return () => window.clearInterval(timer);
  }, [state?.signedIn, busy, refresh]);

  async function act(body: object, confirmation = "") {
    setBusy(true); setError(""); setMessage("");
    try { setState(await read<OwnerData>("/api/resume/owner", body)); setMessage(confirmation); }
    catch (e) { setError(failure(e)); }
    finally { setBusy(false); }
  }
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void act({ action: "login", code: new FormData(event.currentTarget).get("code") });
  }
  return <AccessPage owner>
    <h1>Résumé requests<span>.</span></h1>
    {!state && <p role="status">Checking your session…</p>}
    {state && !state.signedIn && <><p>Run <code>node scripts/owner-access.mjs</code> on the portfolio server to get a single-use sign-in code.</p>
      <form onSubmit={login}><label>Owner code<input type="password" name="code" autoComplete="one-time-code" required /></label>
        <button className="access-primary" disabled={busy}><KeyRound size={16}/>Sign in</button></form></>}
    {state?.signedIn && <>
      <p>Review résumé visits by name. The PDF opens as soon as a visitor submits the form.</p>
      <div className="access-actions"><button className="access-secondary" onClick={refresh} disabled={busy}><RefreshCw size={15}/>Refresh list</button><button className="access-secondary" disabled={busy} onClick={() => act({ action: "logout" })}>Sign out</button></div>
      {!state.requests?.length && <p className="access-empty">No requests yet.</p>}
      <ul className="access-list">{state.requests?.map(row => <li key={row.id}>
        <h2>{row.name}</h2>
        <div className="access-metadata"><span>{row.status}</span><small>Requested {date(row.createdAt)}</small></div>
        {(row.status === "pending" || row.status === "approved") && <div className="access-actions">
          {(row.status === "pending" ? ["approve", "deny"] : ["revoke"]).map(action => <button className={action === "approve" ? "access-primary" : "access-secondary"} disabled={busy} key={action}
            onClick={() => act({ action, id: row.id }, row.name + (action === "approve" ? " now has access." : action === "deny" ? "’s request was declined." : "’s access was revoked."))}>
            {action === "approve" ? "Approve for 24 hours" : action === "deny" ? "Decline" : "Revoke access"}</button>)}
        </div>}
      </li>)}</ul>
    </>}
    {message && <p role="status">{message}</p>}{error && <div><p role="alert" className="access-error">{error}</p><button className="access-secondary" onClick={refresh}>Refresh</button></div>}
  </AccessPage>;
}
