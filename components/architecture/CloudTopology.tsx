"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Cloud, Database, Network, Server, Users } from "lucide-react";
import "./cloud-topology.css";

const regions = [
  { x: 25, label: "us-east-1 · Primary", database: "Multi-AZ MySQL RDS" },
  { x: 413, label: "us-west-2 · Secondary", database: "MySQL read replica" },
] as const;

const trafficPaths = [
  "M376 43 V58",
  "M376 95 V117 H183 V163",
  "M376 95 V117 H571 V163",
  "M183 163 V442",
  "M571 163 V442",
];
const replicationPath = "M281 437 H474";

function CloudNode({ x, y, title, icon: Icon, width = 192 }: {
  x: number;
  y: number;
  title: string;
  icon: typeof Cloud;
  width?: number;
}) {
  return (
    <g className="topology-node" transform={`translate(${x} ${y})`}>
      <rect x={-width / 2} y="-17" width={width} height="34" rx="7" />
      <Icon x={-width / 2 + 9} y="-9" width="18" height="18" strokeWidth={1.55} />
      <text x={-width / 2 + 36} y="5">{title}</text>
    </g>
  );
}

export default function CloudTopology() {
  const id = useId();
  const [mode, setMode] = useState<"traffic" | "replication">("traffic");
  return (
    <figure className="cloud-topology" data-mode={mode}>
      <div className="topology-controls" role="group" aria-label="Cloud architecture signal">
        <button type="button" aria-pressed={mode === "traffic"} onClick={() => setMode("traffic")}>Request path</button>
        <button type="button" aria-pressed={mode === "replication"} onClick={() => setMode("replication")}>Database replication</button>
      </div>
      <div className="topology-scroll" tabIndex={0} role="region" aria-label="AWS topology diagram">
        <svg viewBox="0 0 752 477" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Multi-region AWS three-tier deployment</title>
          <desc id={`${id}-desc`}>CloudFront sends requests to frontend load balancers in both regions. Frontend and backend Auto Scaling groups run in private subnets. A private MySQL database in the primary region replicates to the secondary region.</desc>
          {regions.map(({ x, label }) => (
            <g key={label}>
              <rect className="topology-region" x={x} y="133" width="316" height="330" rx="13" />
              <text className="topology-region-label" x={x + 14} y="153">{label}</text>
              <rect className="topology-private" x={x + 13} y="206" width="290" height="246" rx="8" />
              <text className="topology-subnet-label" x={x + 22} y="224">Private subnets</text>
            </g>
          ))}
          {trafficPaths.map((path, index) => (
            <g key={path} className="topology-traffic">
              <path className="topology-route" d={path} />
              <path className="topology-pulse" d={path} pathLength="100" style={{ animationDelay: `${index * -.46}s` }} />
            </g>
          ))}
          <g className="topology-replication">
            <path className="topology-route" d={replicationPath} />
            <path className="topology-pulse" d={replicationPath} pathLength="100" />
            <text x="376" y="420" textAnchor="middle">Replication</text>
            <path d="m465 431 9 6-9 6" className="topology-route" />
          </g>
          <CloudNode x={376} y={26} title="Internet traffic" icon={Users} width={156} />
          <CloudNode x={376} y={77} title="CloudFront edge" icon={Cloud} width={170} />
          {regions.map(({ x, label, database }) => (
            <g key={label}>
              <CloudNode x={x + 158} y={179} title="Public frontend ALB" icon={Network} />
              <CloudNode x={x + 158} y={250} title="Frontend Auto Scaling" icon={Server} />
              <CloudNode x={x + 158} y={309} title="Backend API ALB" icon={Network} />
              <CloudNode x={x + 158} y={373} title="Backend Auto Scaling" icon={Server} />
              <CloudNode x={x + 158} y={435} title={database} icon={Database} />
            </g>
          ))}
        </svg>
      </div>
      <figcaption>
        <span aria-live="polite">{mode === "traffic" ? "CloudFront → frontend tier → API tier → database." : "Changes replicate from the primary RDS instance to the secondary read replica."}</span>
        <a href="https://github.com/Kailash-18/AWS_Three_Tyre" target="_blank" rel="noreferrer">Architecture source <ArrowUpRight size={14} aria-hidden="true" /></a>
      </figcaption>
    </figure>
  );
}
