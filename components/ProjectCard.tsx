"use client";

import { useEffect, useRef, type PointerEvent } from "react";
import { Server, Database, Activity, Box, Boxes, Braces, Check, Cloud, Eye, FileCode2, GitBranch, GitCommitHorizontal, Github, Globe, Grip, Hand, Layers3, Maximize2, Orbit, Radio, Scan, ShipWheel, Star, Terminal, Workflow, X } from "lucide-react";
import type { Project } from "../lib/projects";

function ProjectVisual({ project }: { project: Project }) {
  const art = {
    cloud: <><path d="M56 105h44l28-32h52m-80 32 28 32h52"/><Cloud x="19" y="82" width="46" height="46"/><Server x="183" y="48" width="48" height="48"/><Database x="183" y="114" width="48" height="48"/></>,
    pipeline: <><path d="M53 103h160"/>{[Braces,Box,Check].map((Icon,i)=><g key={i} transform={`translate(${24+i*88} 76)`}><rect width="55" height="55" rx="13"/><Icon x="13" y="13" width="29" height="29"/></g>)}</>,
    gitops: <><path d="M78 67q58-44 112 5m-4 67q-58 43-111-4"/><GitBranch x="30" y="79" width="49" height="49"/><ShipWheel x="166" y="67" width="73" height="73"/><path d="m180 54 12 19-22-1m-82 63-17-3 4 17"/></>,
    mesh: <g><path d="m134 26 76 53-10 72-72 32-67-45 2-66zM134 26l-22 67 98-14-60 53-22 51-16-90-49-21m-2 66 51-45 38 39 50 19M134 26l16 106"/></g>,
    scan: <><rect x="35" y="52" width="194" height="114" rx="9"/><path d="M35 77h194m-173-12h6m8 0h6m8 0h6m-30 34h41m-41 14h31"/><Scan x="127" y="84" width="68" height="68"/><Eye x="146" y="103" width="30" height="30"/></>,
    repo: <FileCode2 x="91" y="60" width="82" height="82"/>
  };
  return <div className={"case-art art-"+project.visual} aria-hidden="true"><svg viewBox="0 0 265 206" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">{art[project.visual]}</svg></div>;
}

const architectureStages: Record<Project["visual"], string[]> = {
  cloud: ["CloudFront", "Load-balanced frontend and API", "Private MySQL RDS", "Cross-region read replica"],
  pipeline: ["Source", "Jenkins build and test", "Docker image", "Kubernetes rollout or rollback"],
  gitops: ["Git repository", "Argo CD reconciliation", "Helm workloads on Kubernetes", "Prometheus and Grafana"],
  mesh: ["Text prompt", "3D generation", "Mesh and material processing", "WebGL preview and export"],
  scan: ["Web page", "Browser capture", "Visual inspection", "Findings"],
  repo: [],
};

function tiltCard(event: PointerEvent<HTMLDivElement>) {
  if (event.pointerType !== "mouse" || !matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
  const surface = event.currentTarget;
  const bounds = surface.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  surface.style.setProperty("--tilt-x", `${-y * 14}deg`);
  surface.style.setProperty("--tilt-y", `${x * 14}deg`);
  surface.style.setProperty("--spot-x", `${(x + .5) * 100}%`);
  surface.style.setProperty("--spot-y", `${(y + .5) * 100}%`);
}

export default function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return <div className="project-stage" onPointerMove={tiltCard} onPointerLeave={event => {
    for (const property of ["--tilt-x", "--tilt-y", "--spot-x", "--spot-y"]) event.currentTarget.style.removeProperty(property);
  }}><article className="project-card">
    <ProjectVisual project={project}/>
    <div className="pc-copy">
      <div className="pc-type"><span/>{project.category}</div>
      <h3><button type="button" onClick={onOpen} aria-label={"Read case study for " + project.title}>{project.title}<Maximize2 size={16} aria-hidden="true"/></button></h3>
      <p>{project.summary}</p>
      <div className="pc-bottom">
        <div className="pc-stack">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
        {project.repo && <a className="pc-source" href={project.repo.html_url} target="_blank" rel="noopener noreferrer"
          aria-label={"View " + project.title + " on GitHub"} title="View repository"><Github size={17}/></a>}
      </div>
    </div>
  </article></div>;
}

export function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; if (trigger instanceof HTMLElement) trigger.focus({ preventScroll: true }); };
  }, []);
  const demo = project.repo?.homepage;
  return <dialog ref={ref} className="project-dialog" aria-labelledby="case-title"
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="pd-shell">
      <div className="pd-header"><span>{project.category} / Case study</span><button type="button" onClick={onClose} aria-label="Close case study" autoFocus><X size={28} aria-hidden="true"/></button></div>
      <div className="pd-content">
        <h2 id="case-title">{project.title}</h2><p className="pd-summary">{project.summary}</p>
        <div className="pc-stack">{project.stack.map(tag => <span key={tag}>{tag}</span>)}</div>
        <section className="case-architecture"><h3><Workflow size={19}/>Architecture</h3>
          <ProjectVisual project={project}/>
          {architectureStages[project.visual].length > 0 && <ol className="architecture-flow" aria-label="Architecture flow">{architectureStages[project.visual].map(stage => <li key={stage}>{stage}</li>)}</ol>}
          <p>{project.architecture || "This repository does not have a portfolio architecture write-up yet. Visit the repository for source and documentation."}</p>
        </section>
        {[{ title: "Engineering challenge", copy: project.challenge, icon: Terminal }, { title: "Outcome", copy: project.result, icon: Orbit }].filter(section => section.copy).map(({ title, copy, icon: Icon }) =>
          <section key={title}><h3><Icon size={17}/>{title}</h3><p>{copy}</p></section>)}
        {project.repo && <div className="pd-repo"><div><Star size={15}/>{project.repo.stargazers_count} {project.repo.stargazers_count === 1 ? "star" : "stars"}</div><div><GitCommitHorizontal size={16}/>Updated {new Date(project.repo.pushed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</div></div>}
        {project.repo && <div className="pd-links"><a href={project.repo.html_url} target="_blank" rel="noopener noreferrer"><Github size={16}/>Repository</a>
          {demo && /^https?:\/\//i.test(demo) && <a href={demo} target="_blank" rel="noopener noreferrer"><Globe size={16}/>Live demo</a>}</div>}
      </div>
    </div>
  </dialog>;
}
