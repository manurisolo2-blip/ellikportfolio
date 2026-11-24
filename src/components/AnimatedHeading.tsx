"use client";

import React, { useEffect, useId, useRef } from "react";
import {
  motion,
  useInView,
  useSpring,
  type Variants,
} from "framer-motion";
import { useHydratedReducedMotion } from "@/lib/fluidPhysics";

const HEADING_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const HAIRLINE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const headingContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const wordRevealVariants: Variants = {
  hidden: {
    y: "110%",
    rotateZ: 2,
  },
  visible: {
    y: "0%",
    rotateZ: 0,
    transition: {
      duration: 0.75,
      ease: HEADING_EASE,
    },
  },
};

const accentRevealVariants: Variants = {
  hidden: {
    y: "110%",
    rotateZ: 2,
    textShadow: "0 0 0px rgba(255, 255, 255, 0)",
  },
  visible: {
    y: "0%",
    rotateZ: 0,
    textShadow: [
      "0 0 26px rgba(255, 255, 255, 0.85)",
      "0 0 10px rgba(244, 241, 234, 0.35)",
      "0 0 0px rgba(255, 255, 255, 0)",
    ],
    transition: {
      y: { duration: 0.75, ease: HEADING_EASE },
      rotateZ: { duration: 0.75, ease: HEADING_EASE },
      textShadow: { duration: 1.35, times: [0, 0.45, 1], ease: "easeOut" },
    },
  },
};

const reducedWordVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

interface AnimatedHeadingProps {
  prefix: string;
  accent: string;
  toneVariant?: "silver" | "warm";
  className?: string;
}

/**
 * Titular editorial en Clash Display con contraste tonal (#FFFFFF / #71717A o #F4F1EA),
 * revelado por máscara palabra a palabra y halo astronómico de eclipse.
 */
export function AnimatedHeading({
  prefix,
  accent,
  toneVariant = "silver",
  className = "",
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-12%" });
  const visibleRef = useRef<boolean>(false);
  const reducedMotion = useHydratedReducedMotion();
  const rawId = useId();
  const safeId = rawId.replace(/:/g, "");

  const eclipseX = useSpring(0, { stiffness: 110, damping: 24 });
  const eclipseY = useSpring(0, { stiffness: 110, damping: 24 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reducedMotion || !window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    const io = el
      ? new IntersectionObserver(
          (entries) => {
            visibleRef.current = entries[0]?.isIntersecting ?? false;
          },
          { rootMargin: "80px 0px", threshold: 0 }
        )
      : null;
    if (el && io) io.observe(el);

    const handlePointerMove = (e: PointerEvent) => {
      if (!visibleRef.current) return;
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      eclipseX.set((e.clientX / vw - 0.5) * 28);
      eclipseY.set((e.clientY / vh - 0.5) * 18);
    };

    const handleLeave = () => {
      eclipseX.set(0);
      eclipseY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handleLeave);
    return () => {
      io?.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleLeave);
    };
  }, [eclipseX, eclipseY, reducedMotion]);

  const prefixWords = prefix.trim().split(/\s+/);
  const accentWords = accent.trim().split(/\s+/);
  const accentColorClass =
    toneVariant === "warm" ? "text-[#F4F1EA]" : "text-[#71717A]";

  return (
    <motion.h2
      ref={ref}
      variants={headingContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`relative z-0 font-display font-medium ${className}`}
    >
      {/* Halo astronómico de eclipse detrás del titular principal */}
      <motion.span
        aria-hidden="true"
        style={reducedMotion ? undefined : { x: eclipseX, y: eclipseY }}
        className="pointer-events-none absolute -left-8 -top-12 sm:-left-14 sm:-top-16 -z-10 h-[220px] w-[220px] sm:h-[310px] sm:w-[310px] select-none will-change-transform"
      >
        <svg
          viewBox="0 0 360 360"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <radialGradient
              id={`eclipse-blue-${safeId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="32%" stopColor="rgba(22, 42, 78, 0.16)" />
              <stop offset="68%" stopColor="rgba(16, 30, 56, 0.06)" />
              <stop offset="100%" stopColor="rgba(5, 5, 5, 0)" />
            </radialGradient>

            <radialGradient
              id={`eclipse-warm-${safeId}`}
              cx="50%"
              cy="50%"
              r="50%"
            >
              <stop offset="32%" stopColor="rgba(5, 5, 5, 0)" />
              <stop offset="44%" stopColor="rgba(244, 241, 234, 0.14)" />
              <stop offset="62%" stopColor="rgba(244, 241, 234, 0.045)" />
              <stop offset="100%" stopColor="rgba(244, 241, 234, 0)" />
            </radialGradient>

            <linearGradient
              id={`eclipse-limb-${safeId}`}
              x1="120"
              y1="120"
              x2="240"
              y2="240"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="rgba(244, 241, 234, 0.24)" />
              <stop offset="55%" stopColor="rgba(244, 241, 234, 0.05)" />
              <stop offset="100%" stopColor="rgba(22, 42, 78, 0.1)" />
            </linearGradient>
          </defs>

          {/* Corona exterior azul profundo casi imperceptible */}
          <circle
            cx="180"
            cy="180"
            r="176"
            fill={`url(#eclipse-blue-${safeId})`}
          />

          {/* Corona luminosa cálida #F4F1EA */}
          <circle
            cx="180"
            cy="180"
            r="138"
            fill={`url(#eclipse-warm-${safeId})`}
          />

          {/* Núcleo oscuro profundo del eclipse */}
          <circle cx="180" cy="180" r="62" fill="#040406" />

          {/* Aro creciente ultrafino del limbo solar */}
          <circle
            cx="180"
            cy="180"
            r="62.5"
            stroke={`url(#eclipse-limb-${safeId})`}
            strokeWidth="0.9"
          />
        </svg>
      </motion.span>

      {prefixWords.map((word, index) => (
        <span
          key={`prefix-${index}`}
          className="relative z-10 inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.26em]"
        >
          <motion.span
            variants={reducedMotion ? reducedWordVariants : wordRevealVariants}
            className="inline-block origin-bottom-left text-white"
          >
            {word}
          </motion.span>
        </span>
      ))}
      {accentWords.map((word, index) => (
        <span
          key={`accent-${index}`}
          className={`relative z-10 inline-block overflow-hidden align-bottom pb-[0.08em] ${
            index < accentWords.length - 1 ? "mr-[0.26em]" : ""
          }`}
        >
          <motion.span
            variants={
              reducedMotion
                ? reducedWordVariants
                : toneVariant === "warm"
                ? accentRevealVariants
                : wordRevealVariants
            }
            className={`inline-block origin-bottom-left ${accentColorClass}`}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

interface HairlineRuleProps {
  orientation?: "horizontal" | "vertical";
  delay?: number;
  className?: string;
}

/**
 * Línea divisoria de 1px auto-dibujable al entrar en viewport.
 */
export function HairlineRule({
  orientation = "horizontal",
  delay = 0,
  className = "",
}: HairlineRuleProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-8%" });

  if (orientation === "vertical") {
    return (
      <motion.div
        ref={ref}
        aria-hidden="true"
        initial={{ scaleY: 0 }}
        animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
        transition={{ duration: 0.9, delay, ease: HAIRLINE_EASE }}
        style={{ transformOrigin: "top" }}
        className={`w-px h-full bg-[var(--border-hairline)] ${className}`}
      />
    );
  }

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
      transition={{ duration: 0.9, delay, ease: HAIRLINE_EASE }}
      style={{ transformOrigin: "left" }}
      className={`h-px w-full bg-[var(--border-hairline)] ${className}`}
    />
  );
}

export const orbitalGridStaggerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const orbitalCellVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 24,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: HEADING_EASE,
    },
  },
};

const ORBITAL_CORNER_BRACKETS = [
  "top-2.5 left-2.5 border-t border-l",
  "top-2.5 right-2.5 border-t border-r",
  "bottom-2.5 left-2.5 border-b border-l",
  "bottom-2.5 right-2.5 border-b border-r",
] as const;

interface SpotlightSurfaceProps {
  children: React.ReactNode;
  className?: string;
  staggerControlled?: boolean;
}

/**
 * Superficie oscura con entrada espacial escalonada, brillo radial al cursor,
 * escuadras astronómicas en las 4 esquinas y elevación sutil en hover.
 */
export function SpotlightSurface({
  children,
  className = "",
  staggerControlled = false,
}: SpotlightSurfaceProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(surfaceRef, { once: true, margin: "-10%" });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = surfaceRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <motion.article
      ref={surfaceRef}
      variants={orbitalCellVariants}
      {...(!staggerControlled
        ? {
            initial: "hidden",
            animate: isInView ? "visible" : "hidden",
          }
        : {})}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden bg-[var(--bg-elevated)] will-change-transform ${className}`}
    >
      {/* Brillo radial en el fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(450px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(255,255,255,0.07), transparent 40%)",
        }}
      />

      {/* Iluminación perimetral sobre los bordes de 1px */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          padding: "1px",
          background:
            "radial-gradient(450px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(255,255,255,0.38), transparent 42%)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* Retícula orbital en hover: 4 escuadras astronómicas de 8px */}
      {ORBITAL_CORNER_BRACKETS.map((cornerClass) => (
        <span
          key={cornerClass}
          aria-hidden="true"
          className={`pointer-events-none absolute z-20 h-2 w-2 border-[rgba(255,255,255,0.6)] opacity-0 scale-75 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:opacity-100 group-hover:scale-100 ${cornerClass}`}
        />
      ))}

      <div className="relative z-10 flex h-full flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[3px]">
        {children}
      </div>
    </motion.article>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string;
  dataCursor?: string;
}

/**
 * Botón con atracción magnética al cursor (< 60px, ±8px) y cortina blanca deslizante vertical.
 */
export function MagneticButton({
  children,
  onClick,
  type = "button",
  className = "",
  ariaLabel,
  dataCursor = "action",
}: MagneticButtonProps) {
  const rectRef = useRef<DOMRect | null>(null);
  const finePointerRef = useRef<boolean>(false);
  const reducedMotion = useHydratedReducedMotion();
  const springX = useSpring(0, { stiffness: 280, damping: 28, mass: 0.6 });
  const springY = useSpring(0, { stiffness: 280, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => {
      finePointerRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reducedMotion || !finePointerRef.current || e.pointerType !== "mouse") return;
    rectRef.current = e.currentTarget.getBoundingClientRect();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const rect = rectRef.current;
    if (reducedMotion || !finePointerRef.current || !rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const normX = Math.max(
      -1,
      Math.min(1, (e.clientX - centerX) / Math.max(rect.width / 2, 1))
    );
    const normY = Math.max(
      -1,
      Math.min(1, (e.clientY - centerY) / Math.max(rect.height / 2, 1))
    );
    springX.set(normX * 7);
    springY.set(normY * 7);
  };

  const resetMagnetic = () => {
    rectRef.current = null;
    springX.set(0);
    springY.set(0);
  };

  const hasExplicitPosition = /\b(fixed|absolute|sticky)\b/.test(className);

  return (
    <motion.button
      type={type}
      data-cursor={dataCursor}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMagnetic}
      onBlur={resetMagnetic}
      whileTap={reducedMotion ? undefined : { scale: 0.965 }}
      transition={{ scale: { type: "spring", bounce: 0, duration: 0.14 } }}
      style={reducedMotion ? undefined : { x: springX, y: springY }}
      className={`group ${hasExplicitPosition ? "" : "relative "}overflow-hidden ${className}`}
    >
      {/* Relleno blanco que entra deslizándose desde abajo hacia arriba */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[#FFFFFF] translate-y-[102%] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-[#050505] group-focus-visible:text-[#050505]">
        {children}
      </span>
    </motion.button>
  );
}
