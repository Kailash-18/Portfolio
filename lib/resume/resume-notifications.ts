import nodemailer from "nodemailer";
import { claimResumeView, finishResumeView, resumeViewerName } from "./resume-access";
import { profile } from "../profile/resume";

export async function notifyResumeView(session?: string) {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_USERNAME;
  const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
  const pass = rawPass.trim().replace(/\s+/g, ""); // Strip whitespace in case of copied Google App Password
  const to = process.env.RESUME_ALERT_TO || process.env.NOTIFICATION_EMAIL || process.env.ALERT_EMAIL || profile.email || user;
  const defaultPort = host === "smtp.gmail.com" ? 465 : 587;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || defaultPort);

  if (!host || !user || !pass || !to) {
    const missing: string[] = [];
    if (!host) missing.push("SMTP_HOST (e.g. smtp.gmail.com)");
    if (!user) missing.push("SMTP_USER (e.g. your email)");
    if (!pass) missing.push("SMTP_PASSWORD (e.g. Google App Password)");
    if (!to) missing.push("RESUME_ALERT_TO (or profile.email)");
    console.warn(`[Resume Alert] Skipped notification: missing environment variables: ${missing.join(", ")}`);
    return;
  }

  const requestId = claimResumeView(session);
  if (!requestId) {
    // Already sent or in cooldown
    return;
  }

  const isSecure = port === 465;
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: { user, pass },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  let sent = false;
  try {
    const viewer = resumeViewerName(requestId) || "A visitor";
    const dateFormatted = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "full",
      timeStyle: "medium",
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const message = await transport.sendMail({
      from: `Portfolio Alerts <${user}>`,
      to,
      subject: `Someone opened your résumé (${viewer})`,
      text: [
        `Visitor: ${viewer}`,
        `Time: ${dateFormatted} IST`,
        `Request ID: ${requestId}`,
        "",
        "View the visitor details in your private résumé dashboard (/resume-admin).",
      ].join("\n"),
    });

    sent = (message.accepted && message.accepted.length > 0) || Boolean(message.messageId);
    if (sent) {
      console.log(`[Resume Alert] Successfully delivered résumé notification to ${to} (Message ID: ${message.messageId})`);
    } else {
      console.error("[Resume Alert] SMTP provider did not accept message:", message);
    }
  } catch (error) {
    console.error("[Resume Alert] Failed to send résumé view email via SMTP:", error);
  } finally {
    transport.close();
    finishResumeView(requestId, sent);
  }
}
