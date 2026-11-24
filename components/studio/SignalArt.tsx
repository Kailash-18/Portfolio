"use client";

import { useEffect, useId, useState } from "react";
import { Activity, Pause, Play } from "lucide-react";
import "./signal.css";

type SignalProps = {
  mode: string;
  direction: number;
  progress: number;
  impulse: number;
  fieldPoint: { x: number; y: number };
  repelling: boolean;
};

export default function SignalArt({ mode, direction, progress, impulse, fieldPoint, repelling }: SignalProps) {
  const id = useId().replace(/:/g, "");
  const [paused,setPaused] = useState(true);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPaused(motion.matches);
    sync(); motion.addEventListener("change",sync);
    return () => motion.removeEventListener("change",sync);
  },[]);
  const offset = mode === "field" ? (fieldPoint.y - .5) * (repelling ? -130 : 130) : mode === "route" ? (direction-1)*28 : progress*22;
  return <figure className="signal-art infra-stage" tabIndex={0} aria-label="Interactive signal field">
    <div className="signal-tools"><span><Activity size={15}/>Release topology</span><button aria-label={paused ? "Play animation" : "Pause animation"} onClick={()=>setPaused(!paused)}>{paused?<Play size={15}/>:<Pause size={15}/>}</button></div>
    <svg className={paused?"topology paused":"topology"} viewBox="0 0 600 270" role="img" aria-label="A commit branches into build and test jobs, then converges for release">
      <defs><linearGradient id={id}><stop stopColor="#6da9ff"/><stop offset="1" stopColor="#b49aff"/></linearGradient></defs>
      {[0,1,2,3,4].map(i=><g key={i} fill="none" stroke={"url(#"+id+")"}><path opacity=".32" d={`M54 ${132+i*3} H130 C179 ${132+i*3} 175 ${65+i*4} 223 ${65+i*4} H356 C410 ${65+i*4} 397 ${132+i*3} 450 ${132+i*3} H549`}/><path opacity=".52" d={`M54 ${132+i*3} H130 C179 ${132+i*3} 175 ${207-i*4} 223 ${207-i*4} H356 C410 ${207-i*4} 397 ${132+i*3} 450 ${132+i*3} H549`}/></g>)}
      <path className="trace-run" d="M54 138H130C179 138 175 73 223 73H356C410 73 397 138 450 138H549" fill="none" stroke="#dfdaff" strokeWidth="3" strokeDasharray="11 560" pathLength="570" style={{animationDuration:(4-progress*2)+"s"}}/>
      {[[54,138,"Commit"],[284,73,"Build"],[284,198,"Test"],[549,138,"Release"]].map(([x,y,name])=><g key={name} transform={`translate(${x},${y})`}><circle r="13" fill="#192640" stroke="#8b9ccc"/><circle r="4" fill="#d0ccff"/><text y="-25" textAnchor="middle" fill="#d0d7ee" fontSize="14">{name}</text></g>)}
      <circle key={impulse} cx={300+offset} cy={137} r={mode==="inspect"?0:5} fill="#af97ff"/>
    </svg>
  </figure>;
}
