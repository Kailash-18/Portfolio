"use client";
import { useEffect, useRef } from "react";
import Hero from "./Hero";
import Projects from "../projects/Projects";
import BentoGrid from "../profile/BentoGrid";
import CodeResume from "../profile/CodeResume";
import Contact from "./Contact";
import SecurityShowcase from "../security/SecurityShowcase";
import Tools from "../profile/Tools";
import Navigation from "../navigation/Navigation";
import CommandPalette from "../navigation/CommandPalette";
import {GitHubProvider} from "../../lib/projects/github";
export default function PortfolioPage(){
 const content = useRef<HTMLDivElement>(null);

 useEffect(() => {
   if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
   const sections = content.current?.querySelectorAll(":scope > section");
   if (!sections) return;
   const observer = new IntersectionObserver(entries => {
     for (const entry of entries) {
       if (!entry.isIntersecting) continue;
       entry.target.classList.add("section-arrive");
       observer.unobserve(entry.target);
     }
   }, { rootMargin: "0px 0px -36px" });
   sections.forEach(section => {
     if (section.getBoundingClientRect().top > window.innerHeight) observer.observe(section);
   });
   return () => observer.disconnect();
 }, []);

 return <GitHubProvider><Navigation/><main><Hero/><div ref={content} className="content-stack single-flow"><Projects/><SecurityShowcase/><Tools/><BentoGrid/><CodeResume/><Contact/></div></main><CommandPalette/></GitHubProvider>;
}


