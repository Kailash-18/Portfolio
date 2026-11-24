import nodemailer from "nodemailer";
import { claimResumeView, finishResumeView } from "./resume-access";
import { profile } from "../profile/resume";

export async function notifyResumeView(session?: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, RESUME_ALERT_TO } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return;
  const requestId = claimResumeView(session);
  if (!requestId) return;

  const port = Number(SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });
  let sent = false;
  try {
    const message = await transport.sendMail({
      from: SMTP_USER,
      to: RESUME_ALERT_TO || profile.email,
      subject: "Someone opened your résumé",
      text: [
        "A visitor opened the résumé PDF through your portfolio.",
        `Time: ${new Date().toISOString()}`,
        `Request ID: ${requestId}`,
        "View the visitor details in your private résumé dashboard (/resume-admin).",
      ].join("\n"),
    });
    sent = message.accepted.length > 0;
    if (!sent) console.error("The SMTP provider did not accept the résumé notification.");
  } catch {
    console.error("Unable to send the résumé view email.");
  } finally {
    transport.close();
    finishResumeView(requestId, sent);
  }
}
