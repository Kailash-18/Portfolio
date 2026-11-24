"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, FileText, Layers3, Radio, X } from "lucide-react";
import Link from "next/link";
import { profile } from "../lib/resume";
import Playground from "./Playground";
import "./cover.css";

const focusAreas = [
  ["Network security", "OPNsense · Wireshark", "Firewall policy and packet-level traffic analysis"],
  ["Web security", "Burp Suite · OWASP Juice Shop", "HTTP inspection and input validation in training environments"],
  ["Cloud & delivery", "Terraform · Kubernetes", "Repeatable AWS infrastructure and application releases"],
];

export default function Hero() {
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    const launch = () => setInteractive(true);
    window.addEventListener("launch-game", launch);
    const mode = new URLSearchParams(location.search).get("studio");
    if (mode) window.dispatchEvent(new CustomEvent("launch-game", { detail: mode }));
    return () => window.removeEventListener("launch-game", launch);
  }, []);

  return (
    <section id="home" className="intro" aria-labelledby="cover-title">
      <div className="intro-grid">
        <div className="intro-copy">
          <p className="intro-role">Security, cloud infrastructure &amp; DevOps</p>
          <h1 id="cover-title">Kailash <span>Ambadipudi</span></h1>
          <p className="intro-description">I study electronics and communication engineering at IIIT Bhagalpur. My work spans network traffic analysis, web application security training, and AWS infrastructure and Kubernetes delivery.</p>
          <div className="intro-actions">
            <a className="intro-primary" href="#work">Explore work <ArrowDown size={16} aria-hidden /></a>
            <a className="intro-secondary" href={profile.resume}><FileText size={16} aria-hidden /> View résumé</a>
            <Link className="intro-secondary" href="/builds"><Layers3 size={16} aria-hidden /> What I Build</Link>
          </div>
        </div>
        <aside className="engineering-index" aria-label="Engineering focus">
          <span className="intro-depth-layer" aria-hidden="true" />
          <div className="index-title"><Layers3 size={17} aria-hidden /> What I work on</div>
          <dl>
            {focusAreas.map(([label, tools, description]) => (
              <div key={label}>
                <dt>{label}<small>{tools}</small></dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
          <a href="#about">Engineering profile <ArrowUpRight size={15} aria-hidden /></a>
        </aside>
        <div className="intro-utility">
          <button aria-expanded={interactive} aria-controls="studio-panel" onClick={() => setInteractive(!interactive)}>
            {interactive ? <X size={15} /> : <Radio size={15} />}{interactive ? "Close studio" : "Interactive studio"}
          </button>
        </div>
        <div hidden={!interactive} id="studio-panel" className="intro-studio"><Playground /></div>
      </div>
    </section>
  );
}
