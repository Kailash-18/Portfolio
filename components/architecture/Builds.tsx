"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUpRight, Box, Cloud, GitBranch, Layers3, Pause, Play, ScanEye, ShieldCheck, Workflow } from "lucide-react";
import Navigation from "../navigation/Navigation";
import SystemsOrbit from "./SystemsOrbit";
import SystemTopology from "./SystemTopology";
import CloudTopology from "./CloudTopology";
import "../portfolio/cover.css";
import "../profile/tools.css";
import "./builds.css";

const systems = [
  {
    id: "cloud", name: "Cloud infrastructure", short: "AWS infrastructure", icon: Cloud, color: "#63cdff",
    description: "Route web traffic to independently scaling application tiers and keep the database private.",
    decision: "The replica depends on the primary instance identifier, so Terraform provisions the primary and secondary regions in order.",
  },
  {
    id: "delivery", name: "CI/CD", short: "CI/CD pipeline", icon: Workflow, color: "#82a8ff",
    description: "Turn a code change into a tested container image and a Kubernetes release.",
    decision: "Prometheus, Grafana, and Splunk provide signals for troubleshooting when a rollout fails.",
  },
  {
    id: "security", name: "Security practice", short: "Security practice", icon: ShieldCheck, color: "#78e6bb",
    description: "My penetration-testing experience includes hands-on work with Metasploit Framework. This architecture follows traffic through a segmented VirtualBox network, from the firewall state table to the application proxy.",
    decision: "Correlate the transport five-tuple, direction, capture interface, and observation window. NAT can rewrite a tuple, and a proxy opens a second connection. Both boundaries matter when attributing traffic to a session.",
  },
  {
    id: "gitops", name: "GitOps", short: "GitOps cluster", icon: GitBranch, color: "#b593ff",
    description: "Keep Kubernetes workloads aligned with versioned deployment configuration.",
    decision: "Namespaces and RBAC define access boundaries. Prometheus, Grafana, and Alertmanager cover metrics and alerting.",
  },
  {
    id: "assets", name: "3D asset pipeline", short: "3D asset pipeline", icon: Box, color: "#f69cdb",
    description: "Generate an asset from a prompt, prepare it for use, and inspect it in a browser.",
    decision: "Geometry, optimization, and material processing are separate stages in PolyGen, so an asset can be inspected before export.",
  },
  {
    id: "qa", name: "Visual QA", short: "Visual QA", icon: ScanEye, color: "#65e5ed",
    description: "Collect visual and DOM evidence from a page and surface layout issues for review.",
    decision: "OmniSight checks desktop and mobile renderings because a selector alone cannot show that a control is clipped or obscured.",
  },
] as const;

const orbitColors = systems.map(system => system.color);



function ArchitectureChapter({ system, next }: {
  system: (typeof systems)[number];
  next?: (typeof systems)[number];
}) {
  const { id, name, icon: Icon, color, description, decision } = system;

  return (
    <section className="architecture-chapter" id={`build-${id}`} aria-labelledby={`heading-${id}`} style={{ "--chapter-accent": color } as React.CSSProperties}>
      <div className="chapter-copy">
        <div className="chapter-emblem"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></div>
        <h2 id={`heading-${id}`}>{name}</h2>
        <p>{description}</p>
        <aside className="chapter-decision">
          <h3>Design decision</h3>
          <p>{decision}</p>
        </aside>
        <a className="chapter-next" href={next ? `#build-${next.id}` : "#systems-heading"}>
          {next ? `Next: ${next.name}` : "Back to the architecture map"} <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      {id === "cloud" ? <CloudTopology /> : <SystemTopology system={id} name={name} />}
    </section>
  );
}

export default function Builds() {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <>
      <Navigation builds />
      <main className="content-stack builds-page" data-motion-paused={paused}>
        <div className="builds-opening">
          <header className="builds-copy">
            <Link className="builds-back" href="/"><ArrowLeft size={17} aria-hidden="true" /> Back to portfolio</Link>
            <h1>What I <em>Build.</em></h1>
            <p>Explore how I provision cloud infrastructure, ship software, and inspect the systems behind it.</p>
            <a className="builds-tour-link" href="#build-cloud">Start the architecture tour <ArrowDown size={17} aria-hidden="true" /></a>
          </header>
        <section className="builds-workspace" aria-labelledby="systems-heading">
          <div className="builds-workspace-head">
            <h2 id="systems-heading">Systems orbit</h2>
          <button className="map-motion" type="button" disabled={!ready} aria-pressed={paused} onClick={() => setPaused(!paused)}>
            {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            {paused ? "Play motion" : "Pause motion"}
          </button>
          </div>
          <div className="systems-viewport" data-paused={paused}>
            <div className="systems-orbit-render">
              <SystemsOrbit colors={orbitColors} selected={-1} paused={paused} />
              <div className="systems-core" aria-hidden="true"><Layers3 size={42} strokeWidth={1.45} /></div>
            </div>
            <div className="systems-legend" aria-hidden="true">
              {systems.map(({ id, short, color }) => <span key={id}><i style={{ backgroundColor: color }} />{short}</span>)}
            </div>
          </div>

        </section>
        </div>
        <div className="architecture-tour">
          {systems.map((system, index) => <ArchitectureChapter key={system.id} system={system} next={systems[index + 1]} />)}
        </div>
      </main>
    </>
  );
}

