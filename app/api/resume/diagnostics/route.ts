import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { profile } from "../../../../lib/profile/resume";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || (process.env.SMTP_USER?.includes("@gmail.com") ? "smtp.gmail.com" : undefined);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.EMAIL_USERNAME;
  const rawPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || "";
  const pass = rawPass.trim().replace(/\s+/g, "");
  const to = process.env.RESUME_ALERT_TO || process.env.NOTIFICATION_EMAIL || process.env.ALERT_EMAIL || profile.email || user;
  const defaultPort = host === "smtp.gmail.com" ? 465 : 587;
  const port = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || defaultPort);

  const envCheck = {
    SMTP_HOST: host || "(not set)",
    SMTP_PORT: port,
    SMTP_USER: user ? `${user.slice(0, 3)}***@${user.split("@")[1] || ""}` : "(not set)",
    SMTP_PASSWORD_SET: Boolean(pass),
    SMTP_PASSWORD_LENGTH: pass ? pass.length : 0,
    RESUME_ALERT_TO: to || "(not set)",
  };

  if (!host || !user || !pass || !to) {
    return NextResponse.json({
      success: false,
      error: "Missing one or more required SMTP environment variables on Render.",
      envCheck,
    }, { status: 400 });
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
  });

  try {
    await transport.verify();
    const info = await transport.sendMail({
      from: `Portfolio Alerts <${user}>`,
      to,
      subject: "Test Résumé Alert from Diagnostics",
      text: [
        "Hello Kailash!",
        "",
        "If you are reading this email, your SMTP configuration on Render is working 100%!",
        `Sent from: ${user}`,
        `Sent to: ${to}`,
        `Time: ${new Date().toISOString()}`,
      ].join("\n"),
    });

    transport.close();
    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${to}!`,
      messageId: info.messageId,
      accepted: info.accepted,
      envCheck,
    });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; code?: string; response?: string };
    return NextResponse.json({
      success: false,
      error: errorObj?.message || String(err),
      code: errorObj?.code || null,
      smtpResponse: errorObj?.response || null,
      envCheck,
      hint: errorObj?.code === "EAUTH" 
        ? "Google rejected the password. Verify: 1) Did you use a 16-char App Password? 2) Does SMTP_USER match the exact account that generated the App Password?"
        : "Check host, port and network connection on Render.",
    }, { status: 500 });
  }
}
