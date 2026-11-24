// Run after "npm run build". The temporary server and database are isolated from real requests.
import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const temp = await mkdtemp(path.join(tmpdir(), "resume-access-check-"));
const probe = createServer().listen(0, "127.0.0.1");
await once(probe, "listening");
const port = probe.address().port;
await new Promise(resolve => probe.close(resolve));
const origin = "http://127.0.0.1:" + port;
const env = { ...process.env, RESUME_ACCESS_ORIGIN: origin, RESUME_ACCESS_DATA_DIR: temp };
const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], { cwd: root, env, stdio: "inherit", windowsHide: true });
const closed = once(next, "close");
const visitor = {}, owner = {}, other = {};

async function request(jar, route, expected, body, requestOrigin = origin) {
  const response = await fetch(origin + route, {
    method: body ? "POST" : "GET", signal: AbortSignal.timeout(15000),
    headers: { Cookie: Object.values(jar).join("; "), Origin: requestOrigin, "Content-Type": "application/json" },
    ...(body && { body: JSON.stringify(body) }),
  });
  assert.equal(response.status, expected, route + " returned an unexpected status code");
  for (const field of response.headers.getSetCookie()) {
    assert.match(field, /httponly/i); assert.match(field, /samesite=strict/i);
    const raw = field.split(";")[0];
    jar[raw.split("=")[0]] = raw;
  }
  return response;
}
const submit = (jar, name) => request(jar, "/api/resume", 201, { name, email: "example@example.com" });
const action = (jar, status, body) => request(jar, "/api/resume/owner", status, body);
const documentRoute = "/api/resume/file";
try {
  let ready = false;
  for (let tries = 0; tries < 100 && next.exitCode === null; tries++) {
    try { ready = (await fetch(origin + "/api/resume")).ok; } catch { /* Server is starting. */ }
    if (ready) break;
    await delay(200);
  }
  assert.ok(ready, "Build the current application before running this check.");
  await request(visitor, "/resume", 200);
  await request(owner, "/resume-admin", 200);
  await request(visitor, "/Kailash-Ambadipudi-Resume.pdf", 404);
  await request(visitor, "/private/Kailash-Ambadipudi-Resume.pdf", 404);
  await request(visitor, documentRoute, 403);
  await request(visitor, "/api/resume/owner", 401);
  for (const email of ["visitor", "visitor..test@example.com", "visitor@-example.com", "visitor@example..com"]) {
    await request(visitor, "/api/resume", 400, { name: "Visitor", email });
    await request(visitor, documentRoute, 403);
  }
  await request(visitor, "/api/resume", 403, { name: "Visitor", email: "example@example.com" }, "https://other.example");
  assert.equal((await (await submit(visitor, "Visitor")).json()).status, "approved");
  await request(visitor, "/api/resume", 200, { name: "Visitor", email: "example@example.com" });
  await request(visitor, documentRoute, 200);
  const stdout = execFileSync(process.execPath, ["scripts/owner-access.mjs"], { cwd: root, env, encoding: "utf8" });
  const code = stdout.trim().split(/\s+/).at(-1);
  await action(owner, 401, { action: "login", code: "invalid" });
  const data = await (await action(owner, 200, { action: "login", code })).json();
  assert.equal(data.requests.length, 1);
  const id = data.requests[0].id;
  await action(other, 401, { action: "login", code });
  await action(other, 401, { action: "approve", id });
  
  assert.equal((await (await request(visitor, "/api/resume", 200)).json()).status, "approved");
  const pdf = await request(visitor, documentRoute, 200);
  assert.equal(pdf.headers.get("content-type"), "application/pdf");
  assert.match(pdf.headers.get("cache-control"), /no-store/);
  assert.deepEqual(Buffer.from(await pdf.arrayBuffer()), await readFile(path.join(root, "private/Kailash-Ambadipudi-Resume.pdf")));
  await request(other, documentRoute, 403);
  await action(owner, 200, { action: "revoke", id });
  await request(visitor, documentRoute, 403);
  await submit(other, "Other visitor");
  const records = await (await request(owner, "/api/resume/owner", 200)).json();
  await action(owner, 200, { action: "revoke", id: records.requests.find(row => row.name === "Other visitor").id });
  await request(other, documentRoute, 403);
  await action(owner, 200, { action: "logout" });
  await request(owner, "/api/resume/owner", 401);
  console.log("Passed the visitor and owner HTTP checks, including private PDF access, immediate access and revocation.");
} finally {
  if (next.exitCode === null) next.kill();
  await closed;
  // temp is the freshly created mkdtemp directory under the operating system's temporary directory.
  assert.equal(path.dirname(temp), path.resolve(tmpdir()));
  await rm(temp, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
}
