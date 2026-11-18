"use client";

import React, { useEffect, useRef } from "react";
import {
  useAnimationFrame,
  useScroll,
  useSpring,
  useVelocity,
} from "framer-motion";

const MARQUEE_PHRASE =
  "DISEÑO A MEDIDA  ✦  ANIMACIÓN 3D  ✦  CÓDIGO PROPIO  ✦  PRODUCCIÓN  ✦";

export function VelocityMarquee() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetPctRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(-1);
  const prefersReducedMotionRef = useRef<boolean>(false);

  const { scrollY } = useScroll();
  const rawVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(rawVelocity, {
    stiffness: 160,
    damping: 26,
    mass: 0.4,
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      prefersReducedMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useAnimationFrame((_, deltaMs) => {
    if (document.hidden || prefersReducedMotionRef.current) return;
    const trackEl = trackRef.current;
    if (!trackEl) return;

    const dt = Math.min(deltaMs, 50) / 1000;
    const vel = smoothVelocity.get();

    if (vel > 20) {
      directionRef.current = -1;
    } else if (vel < -20) {
      directionRef.current = 1;
    }

    const boost = Math.min(Math.abs(vel) * 0.018, 28);
    const step = dt * (3.2 + boost) * directionRef.current;

    let nextPct = offsetPctRef.current + step;
    while (nextPct <= -50) nextPct += 50;
    while (nextPct > 0) nextPct -= 50;
    offsetPctRef.current = nextPct;

    trackEl.style.transform = `translate3d(${nextPct.toFixed(3)}%, 0, 0)`;
  });

  return (
    <div
      aria-label="Capacidades de estudio"
      className="relative w-full border-y border-white/15 py-5 overflow-hidden bg-[#050505] select-none"
    >
      <div
        ref={trackRef}
        className="flex w-max items-center will-change-transform"
      >
        {[0, 1].map((copyIdx) => (
          <div
            key={copyIdx}
            aria-hidden={copyIdx === 1}
            className="flex shrink-0 items-center"
          >
            {[0, 1, 2].map((repeatIdx) => (
              <span
                key={`${copyIdx}-${repeatIdx}`}
                className="font-display text-4xl md:text-6xl font-medium uppercase tracking-[-0.02em] text-white/90 whitespace-nowrap pr-10"
              >
                {MARQUEE_PHRASE}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
