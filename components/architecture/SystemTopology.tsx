"use client";

import { useId, useState } from "react";
import { Box, GitBranch, Package, Workflow, Layers3, type LucideIcon } from "lucide-react";
import "./system-scenes.css";

const modes = {
  delivery: ["Release path", "Runtime signals"],
  gitops: ["Cluster monitoring", "Reconciliation"],
  assets: ["Geometry", "Finish & export"],
  qa: ["Capture", "Review a fix"],
  security: ["Firewall policy", "HTTP inspection", "Packet analysis", "Exposure review"],
} as const;

const captions = {
  delivery: ["Jenkins builds and tests the commit. A successful build supplies the container image for the Kubernetes rollout.", "Running pods expose metrics for Prometheus and Grafana. Splunk collects application logs."],
  gitops: ["Prometheus collects cluster metrics for Grafana dashboards and sends firing alerts to Alertmanager.", "Argo CD renders the Helm chart from Git, compares desired and live state, and applies changes through the Kubernetes API."],
  assets: ["A text prompt reaches FastAPI. The pipeline generates geometry and reduces the mesh before material processing.", "UV coordinates place the PBR textures on the mesh. The WebGL viewer supports inspection before GLB or OBJ export."],
  qa: ["Playwright captures desktop and mobile screenshots alongside DOM snapshots for visual analysis.", "A proposed CSS change runs in isolation. Before-and-after evidence goes to a human reviewer."],
  security: ["Allowed-flow path under a stateful pass rule. A matching PF state carries the forwarding decision. On a miss, rule evaluation determines disposition and a stateful pass creates the entry for subsequent packets.", "Burp splits the browser-to-origin exchange into two transport sessions. Correlate the HTTP method, request target, and timestamp across the proxy boundary before attributing the origin response.", "In Wireshark, capture filters limit what enters the trace. Display filters narrow the recorded packets by address or protocol while preserving the original capture.", "Nmap provides the service inventory. I compare Nessus findings with the corresponding host and service before deciding what needs review."],
};

function Trace({ d }: { d: string }) {
  return <g fill="none"><path className="scene-track" d={d}/><path className="scene-signal" d={d} pathLength="100"/></g>;
}

function Label({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
  return <text className="scene-label" x={x} y={y} textAnchor="middle">{children}</text>;
}

const gates: [string, LucideIcon][] = [["Commit",GitBranch],["Build & test",Workflow],["Image",Package],["Rollout",Layers3],["Pods",Box]];
function Delivery({ alternate }: { alternate: boolean }) {
  return <>
    <text x="32" y="44" className="scene-kicker">JENKINS / RELEASE PIPELINE</text>
    <Trace d="M65 116 H532"/>
    {gates.map(([name,Icon],i) => <g key={name} transform={`translate(${65+i*116} 116)`}>
      <circle r="24" className="scene-solid"/><Icon x="-11" y="-11" width="22" height="22"/><Label x={0} y={49}>{name}</Label>
    </g>)}
    <g opacity={alternate ? 1 : .48}>
      <Trace d="M553 126 Q578 126 578 158 V203 Q578 219 556 219 H72"/>
      <text x="32" y="257">Prometheus → Grafana</text><text x="410" y="257">Application logs → Splunk</text>
      <path className="scene-waveform" d="M32 286 h30 l6 -6 7 10 7 -24 9 34 8 -18 9 4 h32 l8 -9 9 15 9 -24 9 19 h42"/>
      {[0,1,2].map(i=><path key={i} className="scene-track" d={`M410 ${276+i*8} h${130-i*24}`}/>)}
    </g>
  </>;
}

function GitOps({ alternate }: { alternate: boolean }) {
  if (!alternate) return <>
    <text x="32" y="44" className="scene-kicker">KUBERNETES / OBSERVABILITY</text>
    <Trace d="M120 169 H299 Q351 169 401 99 H472 M299 169 Q351 169 401 241 H472"/>
    {[[99,169,"Cluster"],[300,169,"Prometheus"],[492,99,"Grafana"],[492,241,"Alertmanager"]].map(([x,y,label])=><g key={label}><circle cx={x} cy={y} r="22" className="scene-solid"/><circle cx={x} cy={y} r="7" fill="currentColor"/><Label x={Number(x)} y={Number(y)+48}>{label}</Label></g>)}
  </>;
  return <>
    <text x="32" y="44" className="scene-kicker">ARGO CD / CONTROL LOOP</text>
    <ellipse cx="300" cy="173" rx="164" ry="91" className="scene-guide"/>
    <Trace d="M136 173 A164 91 0 1 1 464 173 A164 91 0 1 1 136 173"/>
    <circle cx="300" cy="173" r="50" className="scene-solid"/><Label x={300} y={178}>Argo CD</Label>
    <Label x={300} y={66}>Apply desired state →</Label><Label x={300} y={293}>← Observe live state</Label>
    <circle cx="136" cy="173" r="9" fill="currentColor"/><circle cx="464" cy="173" r="9" fill="currentColor"/>
    <Label x={72} y={166}>Git + Helm</Label><Label x={529} y={166}>Kubernetes</Label><Label x={529} y={188}>API</Label>
  </>;
}

const vertices=[[0,-87],[63,-48],[78,28],[15,83],[-60,53],[-75,-25],[-12,-19],[28,15]];
const faces=[[0,1,6],[1,7,6],[1,2,7],[2,3,7],[3,4,7],[4,6,7],[4,5,6],[5,0,6]];
function Assets({ alternate }: { alternate: boolean }) {
  return <>
    <text x="32" y="44" className="scene-kicker">POLYGEN / ASSET PROCESSING</text>
    {[168,438].map((x,i)=><g key={x} transform={`translate(${x} 162)`}>
      <ellipse cy="93" rx="90" ry="12" fill="#080a1999"/>
      <g className="mesh-float">{faces.map((face,j)=><polygon key={j} points={face.map(k=>vertices[k].join(",")).join(" ")} stroke={i ? "#dacbff" : "#b19cff"} strokeWidth={i ? .7 : 1.6} fill={i || alternate ? `hsl(${255+j*3} 45% ${23+j*5}%)` : "#211e38"}/>)}</g>
    </g>)}
    <Trace d="M273 160 H332 l-8 -6 M332 160 l-8 6"/>
    <Label x={168} y={284}>{alternate ? "UV + PBR materials" : "Generated geometry"}</Label>
    <Label x={438} y={284}>{alternate ? "WebGL → GLB / OBJ" : "Optimized mesh"}</Label>
  </>;
}

function QA({ alternate }: { alternate: boolean }) {
  const screens = alternate ? ["Before","After retest"] : ["Desktop capture","Mobile capture"];
  return <>
    <text x="32" y="44" className="scene-kicker">OMNISIGHT / VISUAL EVIDENCE</text>
    {screens.map((title,i)=>{
      const width = i && !alternate ? 124 : 224;
      const x = i ? 439-width/2 : 46;
      return <g key={i} transform={`translate(${x} 75)`}>
        <rect width={width} height="160" rx="11" className="scene-solid"/>
        <path className="scene-track" d={`M0 23 H${width}`}/>
        {[12,21,30].map(v=><circle key={v} cx={v} cy="12" r="2" fill="currentColor"/>)}
        <rect x="14" y="38" width={width-28} height="43" rx="3" fill="#304366"/>
        <path className="scene-track" d={`M15 98 h${width*.6} M15 110 h${width*.42}`}/>
        <rect x="15" y="127" width={width*.5} height="16" rx="4" fill={alternate && i ? "#98d8c4" : "#92a8de"}/>
        {alternate ? <rect x="9" y="120" width={width*.5+12} height="31" rx="4" fill="none" stroke={i ? "#98d8c4" : "#f29baf"} strokeDasharray="4 3"/> : <path className="scan-line" d={`M7 38 H${width-7}`}/>}
        <Label x={width/2} y={187}>{title}</Label>
      </g>;
    })}
    <Label x={300} y={302}>{alternate ? "Evidence diff → human review" : "Screenshots + DOM snapshots → visual analysis"}</Label>
  </>;
}

function Security({ alternate }: { alternate: boolean }) {
  if (!alternate) return <>
    <text x="32" y="40" className="scene-kicker">OPNSENSE / STATEFUL FORWARDING</text>
    <rect x="139" y="62" width="310" height="210" rx="12" className="scene-guide"/>
    <text x="157" y="85" className="scene-kicker">PF FILTER BOUNDARY</text>
    <Trace d="M48 135 H535"/>
    <Trace d="M217 156 V212 H328 M402 190 V135"/>
    <rect x="151" y="112" width="136" height="44" rx="8" className="scene-solid"/>
    <Label x={219} y={139}>State lookup</Label>
    <rect x="307" y="190" width="125" height="44" rx="8" className="scene-solid"/>
    <Label x={369} y={217}>Rule evaluation</Label>
    <Label x={70} y={119}>Ingress</Label><Label x={526} y={119}>Egress</Label>
    <Label x={343} y={119}>State hit</Label><Label x={260} y={200}>Miss</Label>
    <Label x={370} y={253}>Pass + keep state</Label>
    <text x="34" y="305">Evidence: ingress capture / PF state entry / egress capture</text>
  </>;
  return <>
    <text x="32" y="44" className="scene-kicker">VIRTUALBOX / ISOLATED NETWORK</text>
    <path d="M310 66 H573 V259 H310 Z" className="scene-guide"/>
    <text x="332" y="94" className="scene-kicker">LOCAL SUBNET</text>
    <Trace d="M100 167 H493"/>
    <rect x="43" y="136" width="69" height="44" rx="5" className="scene-solid"/>
    <path className="scene-track" d="M77 181 V189 M57 189 H97"/><Label x={79} y={217}>Browser</Label>
    <path d="M257 132 l34 -14 34 14 v30 q0 36 -34 49 -34 -13 -34 -49z" className="scene-solid"/>
    <Label x={291} y={165}>HTTP</Label><Label x={286} y={238}>Burp proxy</Label>
    <circle cx="493" cy="167" r="22" className="scene-solid"/><circle cx="493" cy="167" r="7" fill="currentColor"/>
    <Label x={493} y={216}>Juice Shop</Label>
    <Label x={175} y={148}>Client session</Label><Label x={400} y={148}>Origin session</Label>
  </>;
}

function SecurityEvidence({ exposure }: { exposure: boolean }) {
  if (exposure) return <>
    <text x="32" y="44" className="scene-kicker">EXPOSURE REVIEW / EVIDENCE SOURCES</text>
    <Trace d="M190 105 H245 Q274 105 300 160 H385 M190 223 H245 Q274 223 300 160"/>
    <rect x="28" y="72" width="165" height="66" rx="9" className="scene-solid"/>
    <Label x={110} y={100}>Nmap</Label><Label x={110} y={122}>Service inventory</Label>
    <rect x="28" y="190" width="165" height="66" rx="9" className="scene-solid"/>
    <Label x={110} y={218}>Nessus</Label><Label x={110} y={240}>Assessment findings</Label>
    <rect x="380" y="128" width="188" height="66" rx="9" className="scene-solid"/>
    <Label x={474} y={155}>Host + service</Label><Label x={474} y={177}>Review the finding</Label>
  </>;
  return <>
    <text x="32" y="44" className="scene-kicker">WIRESHARK / PACKET EVIDENCE</text>
    <Label x={99} y={99}>Interface traffic</Label><Label x={300} y={99}>Capture filter</Label><Label x={492} y={99}>Saved trace</Label>
    <Trace d="M70 154 H500 V234 H341"/>
    {[72,98,124].map(x => <rect key={x} x={x} y="144" width="17" height="20" rx="3" className="scene-solid"/>)}
    <path d="M267 126 H333 L307 159 V174 H294 V159 Z" className="scene-solid"/>
    <rect x="465" y="134" width="59" height="40" rx="5" className="scene-solid"/>
    <path d="M476 146 h34 M476 155 h24 M476 163 h29" className="scene-track"/>
    <rect x="156" y="211" width="185" height="46" rx="7" className="scene-solid"/>
    <Label x={249} y={239}>Filtered packet view</Label><Label x={419} y={264}>Display filter</Label>
  </>;
}
const scenes = { delivery: Delivery, gitops: GitOps, assets: Assets, qa: QA, security: Security };
export default function SystemTopology({ system, name }: { system: keyof typeof scenes; name: string }) {
  const [selected,setSelected] = useState(0);
  const id = useId();
  const Scene = scenes[system];
  return <figure className={`cloud-topology system-topology scene-${system}`}>
    <div className="topology-controls" role="group" aria-label={name+" paths"}>
      {modes[system].map((label,i)=><button key={label} type="button" aria-pressed={selected===i} onClick={()=>setSelected(i)}>{label}</button>)}
    </div>
    <div className="topology-scroll" role="region" tabIndex={0} aria-label={name+" diagram"}>
      <svg viewBox="0 0 600 322" role="img" aria-label={name+" — "+modes[system][selected]} aria-describedby={id}>{system === "security" && selected >= 2 ? <SecurityEvidence exposure={selected === 3}/> : <Scene alternate={selected === 1}/>}</svg>
    </div>
    <figcaption id={id} aria-live="polite">{captions[system][selected]}</figcaption>
  </figure>;
}

