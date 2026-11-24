"use client";

import { useState } from "react";
import { Activity, Braces, Network, ShieldCheck } from "lucide-react";
import "./walkthrough.css";

const skills = [
  {
    name: "Firewall policy",
    icon: ShieldCheck,
    title: "Read traffic through the firewall",
    description: "My OPNsense training covered the role of firewall policy in a virtual network. I look at network boundaries, where traffic enters, and which rules govern its path.",
    tools: "OPNsense · VirtualBox",
    signal: "Policy",
  },
  {
    name: "Packet analysis",
    icon: Activity,
    title: "Use packet evidence to explain what happened",
    description: "I use Wireshark capture filters to control what gets collected and display filters to narrow what I see afterward. I look at addresses, ports, and protocol fields to connect the capture to the network behavior I’m studying.",
    tools: "Wireshark · Ettercap",
    signal: "Packets",
  },
  {
    name: "Exposure review",
    icon: Network,
    title: "Separate service discovery from findings",
    description: "In authorized training environments, I used Nmap to build a view of reachable hosts and services. Nessus added assessment findings to review against that inventory.",
    tools: "Nmap · Tenable Nessus",
    signal: "Services",
  },
  {
    name: "Web security",
    icon: Braces,
    title: "Inspect the boundary between browser and server",
    description: "In OWASP Juice Shop, I used Burp Suite to examine HTTP requests and responses. I focused on the difference between what the browser checks and what the server actually validates.",
    tools: "Burp Suite · OWASP Juice Shop",
    signal: "HTTP",
  },
];

export default function SecurityShowcase() {
  const [active, setActive] = useState(0);
  const skill = skills[active];

  return (
    <section id="security" className="architecture-section security-section" aria-labelledby="security-title">
      <header className="walkthrough-heading">
        <h2 id="security-title">Security skills</h2>
        <p>What I look for when examining firewall behavior, packets, exposed services, and HTTP traffic.</p>
      </header>
      <div className="walkthrough-panel security-panel">
        <div className="walkthrough-stages" role="group" aria-label="Security skills">
          {skills.map(({ name, icon: Icon }, index) => (
            <button key={name} type="button" aria-pressed={index === active} aria-controls="security-skill" onClick={() => setActive(index)}>
              <Icon aria-hidden="true" size={18} />
              {name}
            </button>
          ))}
        </div>
        <div className="security-room">
          <div className="walkthrough-copy security-copy" key={skill.name} id="security-skill" aria-live="polite">
            <p className="walkthrough-tools">{skill.tools}</p>
            <h3>{skill.title}</h3>
            <p>{skill.description}</p>
          </div>
          <div className="security-scene" aria-hidden="true">
            <div className="security-glow" />
            <div className="security-model">
              {skills.map(({ icon: Icon, signal }, index) => (
                <div className="security-layer" key={signal} data-active={index === active}>
                  <Icon size={38} strokeWidth={1.35} />
                  <span>{signal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
