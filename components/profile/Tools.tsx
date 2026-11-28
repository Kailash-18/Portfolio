"use client";

import type { PointerEvent } from "react";
import { AppWindow, Cloud, Network } from "lucide-react";
import "./tools.css";

const spotlights = [
  {
    title: "Network visibility & assessment",
    icon: Network,
    tools: ["OPNsense", "Wireshark", "Nmap", "Nessus", "Metasploit", "Ettercap"],
    description: "I compare OPNsense firewall rules with Wireshark captures, then check Nessus findings against the services Nmap identifies. My penetration-testing experience also includes Metasploit Framework.",
  },
  {
    title: "HTTP analysis & web security",
    icon: AppWindow,
    tools: ["Burp Suite", "OWASP Juice Shop", "VirtualBox"],
    description: "In OWASP Juice Shop, I used Burp Suite to inspect requests and responses at the HTTP layer. I focused on where browser-side checks end and server-side validation begins, and how response status and body changes reflect the application’s handling of input.",
  },
  {
    title: "Multi-cloud and delivery",
    icon: Cloud,
    tools: ["Terraform", "AWS", "Azure", "GCP", "Kubernetes", "Argo CD"],
    description: "I use Terraform to define multi-cloud infrastructure across AWS, Azure, and GCP, and Jenkins to build and test container releases. My GitOps project uses Argo CD to keep Kubernetes workloads in sync with Git.",
  },
];

function tiltToolCard(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse" || !matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
  const stage = event.currentTarget;
  const bounds = stage.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width;
  const y = (event.clientY - bounds.top) / bounds.height;
  stage.style.setProperty("--tool-tilt-x", `${(0.5 - y) * 12}deg`);
  stage.style.setProperty("--tool-tilt-y", `${(x - 0.5) * 12}deg`);
  stage.style.setProperty("--tool-light-x", `${x * 100}%`);
  stage.style.setProperty("--tool-light-y", `${y * 100}%`);
}

export default function Tools() {
  return (
    <section id="tools" className="tool-section" aria-labelledby="tools-title">
      <h2 id="tools-title">Hands-on experience</h2>
      <div className="tool-grid">
        {spotlights.map(({ title, icon: Icon, description, tools }) => (
          <div key={title} className="tool-stage" onPointerMove={tiltToolCard} onPointerLeave={event => {
            event.currentTarget.style.removeProperty("--tool-tilt-x");
            event.currentTarget.style.removeProperty("--tool-tilt-y");
            event.currentTarget.style.removeProperty("--tool-light-x");
            event.currentTarget.style.removeProperty("--tool-light-y");
          }}>
            <article className="tool-card">
              <span className="tool-icon"><Icon size={22} aria-hidden="true" /></span>
              <h3>{title}</h3>
              <p>{description}</p>
              <ul aria-label="Tools used">{tools.map(tool => <li key={tool}>{tool}</li>)}</ul>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}


