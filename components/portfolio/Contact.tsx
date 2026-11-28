"use client";

import { useState } from "react";
import { Check, Copy, Mail, PencilLine } from "lucide-react";
import { profile } from "../../lib/profile/resume";

export async function copyEmail() {
  await navigator.clipboard.writeText(profile.email);
}

export default function Contact() {
  const [copied, setCopied] = useState("");
  const [drafted, setDrafted] = useState(false);
  return <><section id="contact" className="contact-section panel-section"><div>
    <span className="contact-icon"><Mail/></span><h2>Get in touch<span>.</span></h2>
    <p>Have a multi-cloud infrastructure project or a DevOps opportunity in mind? Send me a message.</p>
    <div className="contact-address"><a href={`mailto:${profile.email}`}>{profile.email}</a><button aria-label="Copy email address" title="Copy email" onClick={async () => { try { await copyEmail(); setCopied("Email copied."); } catch { setCopied("Select the email address to copy it."); } }}>{copied === "Email copied." ? <Check size={16}/> : <Copy size={16}/>}</button></div><span role="status">{copied}</span>
  </div><form onChange={() => setDrafted(false)} onSubmit={e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const message = String(data.get("message")).trim();
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Portfolio enquiry from " + name)}&body=${encodeURIComponent(message + "\n\n" + name + "\n" + email)}`;
    setDrafted(true);
  }}>
    <div className="contact-fields"><label>Your name<input name="name" autoComplete="name" required maxLength={100}/></label><label>Your email<input name="email" autoComplete="email" type="email" required maxLength={240}/></label></div>
    <label>Message<textarea name="message" rows={4} required maxLength={3000}/></label><div className="contact-submit"><button className="button primary" type="submit"><PencilLine size={16}/>Create email draft</button><small role="status">{drafted ? "Send the draft from your email app." : "Opens your email app."}</small></div>
  </form></section><footer><span>© {new Date().getFullYear()} Kailash Ambadipudi</span><a href="#home">Back to top</a></footer></>;
}
