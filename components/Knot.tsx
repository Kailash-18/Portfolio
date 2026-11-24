"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

// Sample a 2:3 torus knot and wrap each sample in a tubular cross-section.
function buildKnot() {
  const tau = Math.PI * 2;
  function point(t:number) {
    const r=1.55+.62*Math.cos(3*t);
    return [r*Math.cos(2*t),r*Math.sin(2*t),.83*Math.sin(3*t)];
  }
  return Array.from({length:144},(_,i)=>{
    const t=tau*i/144, p=point(t), next=point(t+.001);
    const tangent=next.map((v,k)=>v-p[k]);
    const len=Math.hypot(...tangent);
    const [x,y,z]=tangent.map(v=>v/len);
    const xy=Math.hypot(x,y);
    return Array.from({length:18},(_,j)=>{
      const u=tau*j/18, c=.31*Math.cos(u),s=.31*Math.sin(u);
      return [p[0]-c*y/xy-s*z*x/xy,p[1]+c*x/xy-s*z*y/xy,p[2]+s*xy];
    });
  });
}
export default function Knot(){
  const canvas=useRef<HTMLCanvasElement>(null);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{const media=matchMedia("(prefers-reduced-motion: reduce)");const sync=()=>setPlaying(!media.matches);sync();media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync)},[]);
  const angle=useRef(.3);
  useEffect(()=>{
    const el=canvas.current;if(!el)return;
    const ctx=el.getContext("2d");if(!ctx)return;
    const mesh=buildKnot();let frame=0,last=0,visible=true;
    function draw(now:number){
      if(!el||!ctx)return;
      if(playing&&last)angle.current+=Math.min(now-last,100)*.00022;
      last=now;
      const w=el.width,h=el.height, a=angle.current;
      const projected=mesh.map(ring=>ring.map(([x,y,z])=>{
        const u=x*Math.cos(a)-z*Math.sin(a),v=x*Math.sin(a)+z*Math.cos(a);
        const depth=v*.78+y*.62,scale=Math.min(w,h)*1.25/(6-depth*.28);
        return [w*.5+u*scale,h*.5+(y*.78-v*.62)*scale,depth];
      }));
      const faces=projected.flatMap((ring,i)=>ring.map((p,j)=>{
        const next=projected[(i+1)%mesh.length],k=(j+1)%ring.length;
        return {points:[p,next[j],next[k],ring[k]],z:(p[2]+next[k][2])/2,i,j};
      })).sort((a,b)=>a.z-b.z);
      ctx.clearRect(0,0,w,h);
      for(const {points,z,i,j} of faces){
        const hue=231+18*Math.sin(i/144*6.28+a),light=43+9*z+19*Math.cos(j/18*6.28+.6);
        ctx.beginPath();points.forEach(([x,y],k)=>k?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
        ctx.fillStyle=`hsl(${hue} 78% ${light}%)`;ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.8;ctx.stroke();
      }
      if(playing&&visible&&!document.hidden)frame=requestAnimationFrame(draw);
    }
    function refresh(){cancelAnimationFrame(frame);last=0;if(visible&&!document.hidden)frame=requestAnimationFrame(draw)}
    const size=new ResizeObserver(()=>{const d=Math.min(devicePixelRatio,1.6);el.width=Math.round(el.clientWidth*d);el.height=Math.round(el.clientHeight*d);refresh()});size.observe(el);
    const io=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;refresh()});io.observe(el);
    document.addEventListener("visibilitychange",refresh);refresh();
    return()=>{cancelAnimationFrame(frame);io.disconnect();size.disconnect();document.removeEventListener("visibilitychange",refresh)};
  },[playing]);
  return <figure className="knot"><canvas ref={canvas} aria-label="Rotating indigo and violet torus knot" role="img"/><button aria-label={playing?"Pause sculpture":"Play sculpture"} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={15}/>:<Play size={15}/>}</button></figure>;
}
