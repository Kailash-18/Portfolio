import nodemailer from "nodemailer";
import { profile } from "../lib/profile/resume.ts";

const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_USERNAME;
const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
const pass = rawPass.trim().replace(/\s+/g, "");
const to = process.env.RESUME_ALERT_TO || process.env.NOTIFICATION_EMAIL || process.env.ALERT_EMAIL || profile.email || user;
const defaultPort = host === "smtp.gmail.com" ? 465 : 587;
const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || defaultPort);

console.log("=== SMTP Configuration Diagnostic ===");
console.log("Host:    ", host || "(not configured)");
console.log("Port:    ", port, `(${port === 465 ? "Direct SSL/TLS" : "STARTTLS"})`);
console.log("User:    ", user || "(not configured)");
console.log("Password:", pass ? `[configured, ${pass.length} characters]` : "(not configured)");
console.log("Alert To:", to || "(not configured)");
console.log("======================================");

if (!host || !user || !pass || !to) {
  console.error("\n[Error] Missing required SMTP configuration.");
  console.error("Please ensure the following environment variables are set in your environment / Render dashboard:");
  if (!host) console.error(" - SMTP_HOST (e.g. smtp.gmail.com)");
  if (!user) console.error(" - SMTP_USER (e.g. your Gmail address)");
  if (!pass) console.error(" - SMTP_PASSWORD (e.g. 16-character Google App Password from https://myaccount.google.com/apppasswords)");
  if (!to) console.error(" - RESUME_ALERT_TO (your destination email)");
  process.exit(1);
}

const isSecure = port === 465;
const transport = nodemailer.createTransport({
  host,
  port,
  secure: isSecure,
  requireTLS: !isSecure,
  auth: { user, pass },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 12000,
});

try {
  console.log("\n1. Testing SMTP connection and authentication...");
  await transport.verify();
  console.log("✓ Connection and credentials verified successfully!");

  console.log(`\n2. Sending test notification email to ${to}...`);
  const info = await transport.sendMail({
    from: `Portfolio Alerts <${user}>`,
    to,
    subject: "Test Notification: Portfolio Résumé Alert",
    text: [
      "Hello Kailash!",
      "",
      "This is a confirmation test email from your Portfolio website.",
      "Your SMTP environment variables are configured correctly, and résumé view alerts are now active.",
      "",
      `Sent at: ${new Date().toISOString()}`,
    ].join("\n"),
  });

  console.log("✓ Notification email sent successfully!");
  console.log("Message ID:", info.messageId);
  console.log("Accepted:", info.accepted);
} catch (error) {
  console.error("\n[SMTP Error]", error);
  if (host === "smtp.gmail.com") {
    console.error("\n[Gmail Troubleshooting Tips]:");
    console.error("1. Did you use an App Password? Standard Google account passwords will be rejected with 535 Bad Credentials.");
    console.error("2. Generate a 16-letter App Password at: https://myaccount.google.com/apppasswords");
    console.error("3. On Render, set SMTP_PORT=465 (direct SSL is recommended for Gmail on cloud hosts).");
  }
  process.exit(1);
} finally {
  transport.close();
}
