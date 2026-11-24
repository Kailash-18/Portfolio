import { fileURLToPath } from "node:url";
import { issueOwnerCode } from "../lib/resume/resume-access.ts";

process.chdir(fileURLToPath(new URL("../", import.meta.url)));
const origin = process.env.RESUME_ACCESS_ORIGIN || "http://localhost:3000";
console.log("Open", new URL("/resume-admin", origin).href);
console.log("Single-use owner code (expires in 10 minutes):", issueOwnerCode());
