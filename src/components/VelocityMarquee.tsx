"use client";

import React, { useEffect, useRef } from "react";
import {
  useAnimationFrame,
  useScroll,
  useSpring,
  useVelocity,
} from "framer-motion";
import { useLanguage, type Locale } from "@/context/LanguageContext";

const MARQUEE_ITEMS_BY_LOCALE: Record<Locale, readonly string[]> = {
  es: ["DISEÑO A MEDIDA", "ANIMACIÓN 3D", "CÓDIGO PROPIO", "PRODUCCIÓN"],
  en: ["CUSTOM DESIGN", "3D MOTION", "CLEAN CODE", "PRODUCTION"],
};

export function VelocityMarquee() {
  const { locale } = useLanguage();
  const marqueeItems = MARQUEE_ITEMS_BY_LOCALE[locale];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const offsetPctRef = useRef<number>(0);
  const directionRef = useRef<1 | -1>(-1);
  const prefersReducedMotionRef = useRef<boolean>(false);
  const isInViewRef = useRef<boolean>(true);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        isInViewRef.current = entries[0] ? entries[0].isIntersecting : true;
      },
      { threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, deltaMs) => {
    if (
      document.hidden ||
      prefersReducedMotionRef.current ||
      !isInViewRef.current
    )
      return;
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
      ref={containerRef}
      aria-label={locale === "es" ? "Capacidades de estudio" : "Studio capabilities"}
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
              <React.Fragment key={`${copyIdx}-${repeatIdx}`}>
                {marqueeItems.map((item, itemIdx) => (
                  <span
                    key={`${copyIdx}-${repeatIdx}-${itemIdx}`}
                    className="font-display text-4xl md:text-6xl font-medium uppercase tracking-[-0.02em] text-white/90 whitespace-nowrap pr-14 md:pr-20"
                  >
                    {item}
                  </span>
                ))}
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
