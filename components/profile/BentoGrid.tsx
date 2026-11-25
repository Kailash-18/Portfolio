"use client";

import { useEffect, useId, useState } from "react";
import { Activity, ArrowUpRight, CircuitBoard, GitFork, Github, Globe2, MapPin, Star } from "lucide-react";
import { useGitHub } from "../../lib/projects/github";
import { profile as resumeProfile } from "../../lib/profile/resume";
import "./bento.css";

const toolsets = {
  Cloud: [
    ["AWS", "Hosted a three-tier application with EC2, a load balancer and a private RDS database."],
    ["Terraform", "Codified AWS resources so infrastructure could be provisioned repeatedly."],
    ["VPC", "Separated public and private subnets and configured routes and security groups."],
    ["RDS", "Placed the database tier in private subnets with controlled application access."],
  ],
  Delivery: [
    ["Docker", "Containerized the application for the cloud-native deployment platform."],
    ["Jenkins", "Automated builds, tests, image creation and deployment."],
    ["Kubernetes", "Configured Deployments, Services, ConfigMaps, Secrets and Ingress."],
    ["Helm", "Packaged Kubernetes configuration for repeatable application releases."],
    ["Argo CD", "Synchronized cluster state with version-controlled deployment configuration."],
  ],
  Monitoring: [
    ["Prometheus", "Collected cluster metrics for the Kubernetes GitOps pipeline."],
    ["Grafana", "Built dashboards to visualize Kubernetes and infrastructure metrics."],
    ["Alertmanager", "Configured alert routing for the GitOps cluster."],
    ["Splunk", "Centralized logs for troubleshooting the cloud-native deployment platform."],
  ],
  Networking: [
    ["IP addressing", "Public and private IPv4 addressing, subnet boundaries, and network and broadcast addresses."],
    ["Routing", "IP forwarding between networks and how routers select a path."],
    ["OSI model", "Network layers and the roles of switches, routers, and transport protocols."],
    ["TCP & UDP", "Transport-layer protocols, port numbers, and common application protocols."],
  ],
  "Network tools": [
    ["OPNsense", "Firewall and routing platform."],
    ["Wireshark", "Packet capture, capture filters, and display filters."],
    ["Nmap", "Host discovery and service inventory on authorized networks."],
    ["Tenable Nessus", "Vulnerability assessment and reviewing scan findings."],
    ["PowerShell", "Windows networking utilities and inspecting network adapters."],
    ["Traceroute", "Inspecting the hops along a network path."],
  ],
  "Security tools": [
    ["Metasploit Framework", "Hands-on experience with Metasploit in penetration-testing practice."],
    ["Burp Suite", "Inspecting HTTP requests and responses in a local training environment."],
    ["OWASP Juice Shop", "Setting up a local web application security training environment."],
    ["Ettercap", "Studying local network traffic in an isolated virtual-machine lab."],
    ["VirtualBox", "Creating virtual machines for local security practice."],
  ],
} as const;

type Toolset = keyof typeof toolsets;
const categories = Object.keys(toolsets) as Toolset[];
const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "Asia/Kolkata",
});

function SkillPanel() {
  const [category, setCategory] = useState<Toolset>("Cloud");
  const [selected, setSelected] = useState(0);
  const detailId = useId();
  return (
    <article className="bento-card bento-skills">
      <h3 className="bento-label"><CircuitBoard aria-hidden size={16} />Tech stack</h3>
      <div className="bento-categories" role="group" aria-label="Skill category">
        {categories.map((name) => (
          <button key={name} type="button" aria-pressed={name === category} onClick={() => {
            setCategory(name);
            setSelected(0);
          }}>{name}</button>
        ))}
      </div>
      <div className="bento-skill-groups">
        {categories.map((group) => (
          <div className="bento-pills" key={group} role="group" aria-label={group + " skills"}
            inert={category !== group} aria-hidden={category !== group}>
            {toolsets[group].map(([name, note], index) => (
              <button key={name} type="button" title={note} aria-pressed={selected === index}
                aria-describedby={selected === index && group === category ? detailId : undefined}
                onFocus={() => setSelected(index)} onMouseEnter={() => setSelected(index)}
                onClick={() => setSelected(index)}>{name}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="bento-skill-notes">
        {categories.flatMap((group) => toolsets[group].map(([name, note], index) => {
          const active = category === group && selected === index;
          return <p className="bento-skill-note" key={name} id={active ? detailId : undefined}
            aria-hidden={!active}><strong>{name}</strong> · {note}</p>;
        }))}
      </div>
    </article>
  );
}

function LocationDial({ time }: { time: string }) {
  const [hours, minutes] = time.split(":").map(Number);
  const hourAngle = (hours % 12) * 30 + minutes / 2;
  const minuteAngle = minutes * 6;
  return <svg className="bento-time-dial" viewBox="0 0 220 220" aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="110" cy="110" r="92" /><circle cx="110" cy="110" r="76" strokeDasharray="1 9" />
      <path d="M110 12v22m98 76h-22m-76 98v-22m-98-76h22" />
      {time && <><path d="M110 110V65" strokeWidth="2.5" transform={`rotate(${hourAngle} 110 110)`}/>
        <path d="M110 110V43" strokeWidth="1.5" transform={`rotate(${minuteAngle} 110 110)`}/></>}
    </g><circle cx="110" cy="110" r="4" fill="currentColor" />
  </svg>;
}

function LocationPanel({ location }: { location?: string | null }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(clockFormat.format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <article className="bento-card bento-location">
      <LocationDial time={time} />
      <h3 className="bento-label"><Globe2 aria-hidden size={16} />Location &amp; status</h3>
      <div className="bento-location-body">
        <p><MapPin aria-hidden size={16} /><span>{location || "IIIT Bhagalpur, India"}</span></p>
        <div className="bento-clock"><time aria-label={"Indian Standard Time " + time}>{time || "––:––:––"}</time><span>IST</span></div>
      </div>
      <p className="bento-status"><i aria-hidden />Available for opportunities</p>
    </article>
  );
}

function longDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default function BentoGrid() {
  const { profile, repos, totalStars, languages, activity, source, activityAvailable } = useGitHub();
  const [failedAvatar, setFailedAvatar] = useState("");
  const languageTotal = languages.reduce((total, language) => total + language.count, 0);
  const eventTotal = activity.reduce((total, day) => total + day.count, 0);
  const location = "location" in profile && typeof profile.location === "string" ? profile.location : null;
  const avatar = profile.avatar_url;
  return (
    <section id="about" className="bento-section" aria-labelledby="about-heading">
      <h2 id="about-heading">Engineering profile</h2>
      <div className="bento-layout">
        <article className="bento-card bento-bio" onClick={event => {
          if ((event.target as Element).closest("a, button")) return;
          window.open(profile.html_url || resumeProfile.github, "_blank", "noopener,noreferrer");
        }}>
          <div className="bento-person">
            <div className="bento-avatar">
              <span aria-hidden>KA</span>
              {avatar && avatar !== failedAvatar && <img src={avatar} width={54} height={54} loading="lazy" alt=""
                onError={() => setFailedAvatar(avatar)} />}
            </div>
            <div>
              <h3>{resumeProfile.name}</h3>
              <a href={profile.html_url || resumeProfile.github} target="_blank" rel="noreferrer">
                <Github aria-hidden size={13} />@{profile.login || "Kailash-18"}<ArrowUpRight aria-hidden size={12} />
              </a>
            </div>
          </div>
          <p className="bento-bio-text">Electronics engineering student at IIIT Bhagalpur, focused on cloud infrastructure, platform delivery, and practical security.</p>
          <p className="bento-bio-note">I provision repeatable systems with Terraform, ship workloads through Kubernetes, and investigate network and web traffic in controlled labs.</p>
        </article>
        <article className="bento-card bento-github">
          <div className="bento-pulse-header">
            <h3 className="bento-label"><Activity aria-hidden size={16} />Repository activity</h3>
            <span className="bento-data-source">{source === "live" ? "Live" : source === "snapshot" ? "Snapshot" : "Résumé data"}</span>
          </div>
          <dl className="bento-metrics">
            <div><dt><GitFork size={13} aria-hidden />Public repositories</dt><dd>{profile.public_repos ?? "—"}</dd></div>
            <div><dt><Star size={13} aria-hidden />Repository stars</dt><dd>{totalStars ?? "—"}</dd></div>
          </dl>
          <div className="repo-feed">{repos.slice(0,3).map(repo => <a key={repo.name} href={repo.html_url} target="_blank" rel="noreferrer"><strong>{repo.name}</strong><span>{repo.language || "Repository"} · {new Date(repo.pushed_at).toISOString().slice(0,10)}</span></a>)}</div>
          {languageTotal > 0 && (
            <div className="bento-languages" aria-label="Repository primary languages">
              <div className="bento-language-bar" aria-hidden>{languages.map(({ name, count, color }) =>
                <i key={name} style={{ flexGrow: count, backgroundColor: color }} />)}</div>
              <ul>{languages.map(({ name, color, count }) => (
                <li key={name} title={count + (count === 1 ? " repository" : " repositories")}><i style={{ backgroundColor: color }} />{name} <span>{count}</span></li>
              ))}</ul>
            </div>
          )}
        </article>
        <LocationPanel location={location} />
        <SkillPanel />
      </div>
    </section>
  );
}
