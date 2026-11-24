import { Github, Linkedin, Mail, Terminal } from "lucide-react";
import Link from "next/link";
import { profile } from "../lib/resume";

export const navigation = [
  ["Studio", "home"], ["Work", "work"], ["Tools", "tools"], ["Profile", "about"], ["Experience", "experience"], ["Contact", "contact"],
] as const;

export default function Navigation({ builds = false }: { builds?: boolean }) {
  return (
    <header className="portfolio-masthead">
      <div>
        <Link className="masthead-home" href="/" aria-label="Portfolio home">
          <Terminal size={23} aria-hidden="true" />
        </Link>
        <div className="intro-social">
          <Link className="masthead-tools" href={builds ? "/" : "/builds"}>{builds ? "Portfolio" : "What I Build"}</Link>
          <a href={profile.github} aria-label="GitHub" title="GitHub"><Github size={20} /></a>
          <a href={profile.linkedin} aria-label="LinkedIn" title="LinkedIn"><Linkedin size={20} /></a>
          <a href={`mailto:${profile.email}`} aria-label="Email" title="Email"><Mail size={20} /></a>
        </div>
      </div>
    </header>
  );
}


