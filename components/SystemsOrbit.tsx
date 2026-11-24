"use client";

import { useEffect, useRef } from "react";

const count = 6;
const turn = Math.PI * 2;
const labels = ["AWS", "Jenkins", "OPNsense", "Argo CD", "PolyGen", "OmniSight"];

export default function SystemsOrbit({ selected, paused, colors }: {
  selected: number;
  paused: boolean;
  colors: readonly string[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const clock = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastTime = 0;
    let inView = true;
    let width = 0;
    let height = 0;

    function render(now: number) {
      if (!context || !canvas) return;
      frame = 0;
      const animate = !paused && !motion.matches && inView && !document.hidden;
      if (animate && lastTime) clock.current += Math.min(now - lastTime, 32) / 1000;
      lastTime = now;
      const time = clock.current;
      const radius = Math.min(width, height) * .41;
      const markers: { x: number; y: number; color: string; label: string; highlight: boolean }[] = [];
      context.clearRect(0, 0, width, height);
      context.save();
      context.translate(width / 2, height / 2);

      function project(angle: number, orbit: number) {
        const plane = orbit * Math.PI / count + .46;
        const r = radius * (.88 + (orbit % 3) * .08);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r * .48;
        const z = Math.sin(angle) * r * .76;
        const rotation = plane + time * .052;
        const depth = 1 + .23 * z / radius;
        return [(x * Math.cos(rotation) - y * Math.sin(rotation)) * depth,
          (x * Math.sin(rotation) + y * Math.cos(rotation)) * depth];
      }

      for (let orbit = 0; orbit < count; orbit++) {
        const color = colors[orbit];
        const highlight = selected === orbit;
        context.beginPath();
        for (let segment = 0; segment <= 100; segment++) {
          const [x, y] = project(segment / 100 * turn, orbit);
          if (segment === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.lineWidth = highlight ? 1.65 : 1;
        context.strokeStyle = color + (highlight ? "a0" : selected < 0 ? "66" : "30");
        context.stroke();

        const position = time * (.32 + orbit * .065) * (orbit % 2 ? -1 : 1) + orbit * .94;
        for (let trail = 14; trail >= 1; trail--) {
          const [x, y] = project(position - trail * (orbit % 2 ? -.021 : .021), orbit);
          context.beginPath();
          context.arc(x, y, (highlight ? 4 : 2.8) * (1 - trail / 17), 0, turn);
          context.fillStyle = color;
          context.globalAlpha = (1 - trail / 15) * (highlight ? .85 : .5);
          context.fill();
        }
        context.globalAlpha = 1;
        const [x, y] = project(position, orbit);
        context.beginPath();
        context.arc(x, y, highlight ? 5.5 : 3.6, 0, turn);
        context.shadowBlur = highlight ? 18 : 11;
        context.shadowColor = color;
        context.fillStyle = color;
        context.fill();
        context.shadowBlur = 0;
        if (highlight) markers.push({ x, y, color, label: labels[orbit], highlight });
      }

      // Keep the labels upright even as each marker moves through its tilted orbit.
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = '600 11px "JetBrains Mono Variable", monospace';
      for (const { x, y, color, label, highlight } of markers) {
        const badgeWidth = context.measureText(label).width + 16;
        const badgeX = Math.max(-width / 2 + badgeWidth / 2 + 4, Math.min(width / 2 - badgeWidth / 2 - 4, x));
        const badgeY = y < 0 ? y - 20 : y + 20;
        context.beginPath();
        context.roundRect(badgeX - badgeWidth / 2, badgeY - 10, badgeWidth, 20, 4);
        context.fillStyle = "#131b32f2";
        context.fill();
        context.strokeStyle = color + (highlight ? "e0" : "80");
        context.stroke();
        context.fillStyle = color;
        context.fillText(label, badgeX, badgeY);
      }
      context.restore();
      if (!canvas.hasAttribute("data-drawn")) canvas.setAttribute("data-drawn", "");
      if (animate) frame = requestAnimationFrame(render);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      if (inView && !document.hidden && width > 0 && height > 0) frame = requestAnimationFrame(render);
    }

    const resize = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 4);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      refresh();
    });
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      refresh();
    });
    resize.observe(canvas);
    visibility.observe(canvas);
    motion.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility.disconnect();
      motion.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [colors, paused, selected]);

  return <>
    <canvas className="systems-orbit-canvas" ref={ref} aria-hidden="true" />
    <div className="systems-orbit-fallback" aria-hidden="true">
      {labels.map((label, index) => (
        <div key={label} style={{ "--orbit-angle": `${index * 30}deg`, "--orbit-color": colors[index] } as React.CSSProperties}>
          <i />
        </div>
      ))}
    </div>
  </>;
}
