import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const hour = 60 * 60 * 1000;
const day = 24 * hour;
export const browserMaxAge = 8 * day / 1000;
export const ownerMaxAge = 8 * hour / 1000;
export const browserCookie = "portfolio_resume_request";
export const ownerCookie = "portfolio_resume_owner";
type Decision = "approve" | "deny" | "revoke";
type Status = "pending" | "approved" | "denied" | "revoked" | "expired";
export type RequestStatus = { status: Status | "none"; expiresAt?: number };
type RequestRecord = {
  id: string; name: string; email: string; status: Status; createdAt: number; expiresAt: number;
};
export type AdminRecord = RequestRecord;
let database: DatabaseSync | undefined;
let nextCleanup = 0;

function store() {
  if (!database) {
    const directory = process.env.RESUME_ACCESS_DATA_DIR || path.resolve(".resume-access");
    mkdirSync(directory, { recursive: true, mode: 0o700 });
    const filename = path.join(directory, "access.sqlite");
    const connection = new DatabaseSync(filename);
    connection.exec(`
      PRAGMA busy_timeout=5000;
      PRAGMA foreign_keys=ON;
      PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY, browserHash TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL,
        createdAt INTEGER NOT NULL, status TEXT NOT NULL, expiresAt INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS ownerCode (id INTEGER PRIMARY KEY CHECK(id = 1), hash TEXT NOT NULL, expiresAt INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS ownerSessions (hash TEXT PRIMARY KEY, expiresAt INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts (kind TEXT NOT NULL, createdAt INTEGER NOT NULL);
      CREATE INDEX IF NOT EXISTS recentAttempts ON attempts(kind, createdAt);
      CREATE TABLE IF NOT EXISTS resumeViewNotifications (
        requestId TEXT PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
        claimedAt INTEGER NOT NULL,
        published INTEGER NOT NULL DEFAULT 0
      );
    `);
    if (process.platform !== "win32") chmodSync(filename, 0o600);
    database = connection;
  }
  const now = Date.now();
  if (now >= nextCleanup) {
    database.prepare("DELETE FROM ownerCode WHERE expiresAt <= ?").run(now);
    database.prepare("DELETE FROM ownerSessions WHERE expiresAt <= ?").run(now);
    database.prepare("DELETE FROM attempts WHERE createdAt <= ?").run(now - day);
    database.prepare("DELETE FROM requests WHERE createdAt <= ?").run(now - browserMaxAge * 1000);
    nextCleanup = now + 60_000;
  }
  return database;
}

function token() { return randomBytes(32).toString("base64url"); }
function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function validToken(value?: string): value is string { return !!value && /^[\w-]{43}$/.test(value); }

function transaction<T>(operation: (db: DatabaseSync) => T) {
  const db = store();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = operation(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function consumeAttempt(db: DatabaseSync, kind: string, interval: number, limit: number) {
  const now = Date.now();
  const row = db.prepare("SELECT COUNT(*) AS count FROM attempts WHERE kind = ? AND createdAt > ?").get(kind, now - interval);
  if (Number(row?.count) >= limit) return false;
  db.prepare("INSERT INTO attempts(kind, createdAt) VALUES (?, ?)").run(kind, now);
  return true;
}

// Called exclusively by the local owner CLI. A fresh code replaces the previous unused code.
export function issueOwnerCode() {
  const code = token();
  store().prepare("INSERT OR REPLACE INTO ownerCode VALUES (1, ?, ?)").run(digest(code), Date.now() + 10 * 60_000);
  return code;
}

export function redeemOwnerCode(code: string) {
  return transaction(db => {
    if (!consumeAttempt(db, "login", 60_000, 20)) return { error: "limited" } as const;
    const row = db.prepare("SELECT hash FROM ownerCode WHERE id = 1 AND expiresAt > ?").get(Date.now());
    const expectedHash = typeof row?.hash === "string" ? row.hash : "0".repeat(64);
    const matches = timingSafeEqual(Buffer.from(digest(code), "hex"), Buffer.from(expectedHash, "hex"));
    if (!row || !matches) return { error: "invalid" } as const;
    db.exec("DELETE FROM ownerCode");
    const session = token();
    db.prepare("INSERT INTO ownerSessions VALUES (?, ?)").run(digest(session), Date.now() + ownerMaxAge * 1000);
    return { session } as const;
  });
}

export function isOwner(value?: string) {
  return validToken(value) && !!store().prepare("SELECT 1 FROM ownerSessions WHERE hash = ? AND expiresAt > ?").get(digest(value), Date.now());
}
export function endOwnerSession(value: string) {
  store().prepare("DELETE FROM ownerSessions WHERE hash = ?").run(digest(value));
}

function currentStatus(record: { status: Status; expiresAt: number }): RequestStatus {
  return { status: record.expiresAt <= Date.now() ? "expired" : record.status, expiresAt: record.expiresAt };
}

export function requesterStatus(value?: string): RequestStatus {
  if (!validToken(value)) return { status: "none" };
  const row = store().prepare("SELECT status, expiresAt FROM requests WHERE browserHash = ?").get(digest(value));
  if (!row) return { status: "none" };
  return currentStatus({ status: row.status as Status, expiresAt: Number(row.expiresAt) });
}

export function claimResumeView(value?: string) {
  if (!validToken(value)) return;
  const now = Date.now();
  const claim = store().prepare(`
    INSERT INTO resumeViewNotifications(requestId, claimedAt)
    SELECT id, ? FROM requests WHERE browserHash = ? AND status = 'approved' AND expiresAt > ?
    ON CONFLICT(requestId) DO UPDATE SET claimedAt = excluded.claimedAt
    WHERE published = 0 AND claimedAt < ?
    RETURNING requestId
  `).get(now, digest(value), now, now - 60_000);
  return typeof claim?.requestId === "string" ? claim.requestId : undefined;
}

export function finishResumeView(requestId: string, published: boolean) {
  store().prepare("UPDATE resumeViewNotifications SET published = ?, claimedAt = ? WHERE requestId = ?")
    .run(Number(published), published ? Date.now() : 0, requestId);
}

export function submitRequest(name: string, previous?: string) {
  return transaction(db => {
    const current = requesterStatus(previous);
    if (current.status === "approved" && previous && db.prepare("SELECT 1 FROM requests WHERE browserHash=? AND name=?").get(digest(previous), name)) return { current } as const;
    if (!consumeAttempt(db, "request", hour, 40)) return { error: "limited" } as const;
    const value = token();
    const now = Date.now();
    db.prepare("INSERT INTO requests VALUES (?, ?, ?, ?, ?, 'approved', ?)").run(
      randomBytes(16).toString("hex"), digest(value), name, "", now, now + day,
    );
    return { value } as const;
  });
}

export function listRequests(): AdminRecord[] {
  const rows = store().prepare("SELECT id, name, email, createdAt, status, expiresAt FROM requests ORDER BY createdAt DESC").all();
  return rows.map(row => {
    const record = row as unknown as RequestRecord;
    return { ...record, status: currentStatus(record).status as Status };
  });
}

export function decide(id: string, decision: Decision) {
  const now = Date.now();
  const expected = decision === "revoke" ? "approved" : "pending";
  const next = { revoke: "revoked", approve: "approved", deny: "denied" }[decision];
  const result = store().prepare(`
    UPDATE requests SET status = ?, expiresAt = CASE WHEN ? = 'approved' THEN ? ELSE expiresAt END
    WHERE id = ? AND status = ? AND expiresAt > ?
  `).run(next, next, now + day, id, expected, now);
  return result.changes === 1;
}

export function resumeViewerName(requestId: string) { const row = store().prepare("SELECT name FROM requests WHERE id = ?").get(requestId); return typeof row?.name === "string" ? row.name : undefined; }
