"use client";

import { useEffect } from "react";

export default function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let frame = 0;
    let settle = 0;

    function clearBlur() {
      velocity = 0;
      root.style.removeProperty("--scroll-motion-blur");
    }

    function update(now: number) {
      frame = 0;
      const y = window.scrollY;
      const elapsed = Math.min(48, Math.max(16, now - lastTime));
      const pixelsPerMillisecond = Math.abs(y - lastY) / elapsed;
      lastY = y;
      lastTime = now;
      // Damp individual scroll events so the blur follows the gesture rather than flickering.
      velocity += (Math.min(pixelsPerMillisecond, 4) - velocity) * .5;
      root.style.setProperty("--scroll-motion-blur", `${Math.min(2.25, velocity * .85).toFixed(2)}px`);
      window.clearTimeout(settle);
      settle = window.setTimeout(clearBlur, 100);
    }

    function onScroll() {
      if (!reduce.matches && !frame) frame = window.requestAnimationFrame(update);
    }

    function reset() {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      frame = 0;
      lastY = window.scrollY;
      lastTime = performance.now();
      clearBlur();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    reduce.addEventListener("change", reset);
    return () => {
      window.removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", reset);
      reset();
    };
  }, []);

  return null;
}
