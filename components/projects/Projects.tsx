"use client";

import { useMemo, useState } from "react";
import { useGitHub } from "../../lib/projects/github";
import { getProjects, type Project } from "../../lib/projects/projects";
import ProjectCard, { ProjectDialog } from "./ProjectCard";
import "./projects.css";

export default function Projects() {
  const { repos } = useGitHub();
  const projects = useMemo(() => getProjects(repos), [repos]);
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const categories = ["All", ...Array.from(new Set(projects.map(project => project.category)))];
  const active = categories.includes(category) ? category : "All";
  const visible = projects.filter(project => active === "All" || project.category === active);
  const collapsed = active === "All" && !expanded;
  const displayed = collapsed ? visible.slice(0, 3) : visible;
  return <section id="work" className="work-section"><header className="gallery-header"><h2>Projects</h2><div className="gallery-filters" role="group" aria-label="Project categories">{categories.map(item=><button key={item} aria-pressed={active===item} onClick={()=>setCategory(item)}>{item}</button>)}</div></header>
    <div className="project-gallery" id="project-gallery">{displayed.map(project=><ProjectCard key={project.id} project={project} onOpen={()=>setSelected(project)}/>)}</div>
    {active === "All" && visible.length > 3 && <button className="work-more" aria-controls="project-gallery" aria-expanded={expanded} onClick={event => {
      if (expanded && event.currentTarget.getBoundingClientRect().top > window.innerHeight / 2) {
        document.getElementById("work")?.scrollIntoView({ block: "start" });
      }
      setExpanded(!expanded);
    }}>{expanded ? "Show featured projects" : `See more projects (${visible.length - 3})`}</button>}
    {selected && <ProjectDialog project={selected} onClose={()=>setSelected(null)}/>}
  </section>;
}
