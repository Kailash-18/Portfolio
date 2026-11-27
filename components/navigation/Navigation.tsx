"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "../../lib/profile/resume";

export const navigation = [
  ["Studio", "home"], ["Work", "work"], ["Tools", "tools"], ["Profile", "about"], ["Experience", "experience"], ["Contact", "contact"],
] as const;

export default function Navigation({ builds = false }: { builds?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 48);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <header className="portfolio-masthead" data-scrolled={scrolled}>
      <div>
        <a className="masthead-home" href="#top" aria-label="Back to top" onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
        }}>
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="5" y="9" width="38" height="30" rx="5" />
            <path d="m12 19 5 5-5 5m12 5h10" />
            <path d="M24 19v10m8-10-8 6m3-2 5 6" opacity=".18" strokeWidth="1.5" />
          </svg>
        </a>
        <div className="intro-social">
          <Link className="masthead-tools" href={builds ? "/" : "/builds"}>{builds ? "Portfolio" : "What I Build"}</Link>
          <a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><Github size={20} /></a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><Linkedin size={20} /></a>
          <a href={`mailto:${profile.email}`} aria-label="Email" title="Email"><Mail size={20} /></a>
        </div>
      </div>
    </header>
  );
}


