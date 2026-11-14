"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useSpring,
  type Variants,
} from "framer-motion";

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

interface AnimatedHeadingProps {
  prefix: string;
  accent: string;
  className?: string;
}

/**
 * Titular con revelado por máscara palabra a palabra y destello sutil en el acento serif.
 */
export function AnimatedHeading({
  prefix,
  accent,
  className = "",
}: AnimatedHeadingProps) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-12%" });

  const prefixWords = prefix.trim().split(/\s+/);
  const accentWords = accent.trim().split(/\s+/);

  return (
    <motion.h2
      ref={ref}
      variants={headingContainerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {prefixWords.map((word, index) => (
        <span
          key={`prefix-${index}-${word}`}
          className="inline-block overflow-hidden align-bottom pb-[0.08em] mr-[0.26em]"
        >
          <motion.span
            variants={wordRevealVariants}
            className="inline-block origin-bottom-left"
          >
            {word}
          </motion.span>
        </span>
      ))}
      {accentWords.map((word, index) => (
        <span
          key={`accent-${index}-${word}`}
          className={`inline-block overflow-hidden align-bottom pb-[0.12em] pr-[0.12em] ${
            index < accentWords.length - 1 ? "mr-[0.2em]" : ""
          }`}
        >
          <motion.span
            variants={accentRevealVariants}
            className="serif-accent inline-block origin-bottom-left"
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

interface SpotlightSurfaceProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Superficie oscura con brillo radial de seguimiento de cursor que ilumina fondo y bordes de 1px.
 */
export function SpotlightSurface({
  children,
  className = "",
  delay = 0,
}: SpotlightSurfaceProps) {
  const surfaceRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(surfaceRef, { once: true, margin: "-8%" });

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
      initial={{ opacity: 0, y: 22 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
      transition={{ duration: 0.55, delay, ease: HAIRLINE_EASE }}
      onMouseMove={handleMouseMove}
      className={`group relative overflow-hidden bg-[var(--bg-elevated)] ${className}`}
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

      <div className="relative z-10 flex h-full flex-col justify-between">
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const springX = useSpring(0, { stiffness: 220, damping: 18 });
  const springY = useSpring(0, { stiffness: 220, damping: 18 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const handlePointerMove = (e: PointerEvent) => {
      const el = buttonRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const clampedX = Math.max(rect.left, Math.min(e.clientX, rect.right));
      const clampedY = Math.max(rect.top, Math.min(e.clientY, rect.bottom));
      const edgeDistance = Math.hypot(
        e.clientX - clampedX,
        e.clientY - clampedY
      );

      if (edgeDistance < 60) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normX = Math.max(
          -1,
          Math.min(1, (e.clientX - centerX) / (rect.width / 2 + 60))
        );
        const normY = Math.max(
          -1,
          Math.min(1, (e.clientY - centerY) / (rect.height / 2 + 60))
        );
        const pullFactor = 0.5 + 0.5 * (1 - edgeDistance / 60);
        springX.set(normX * 8 * pullFactor);
        springY.set(normY * 8 * pullFactor);
      } else {
        springX.set(0);
        springY.set(0);
      }
    };

    const handleWindowLeave = () => {
      springX.set(0);
      springY.set(0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handleWindowLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handleWindowLeave);
    };
  }, [springX, springY]);

  const hasExplicitPosition = /\b(fixed|absolute|sticky)\b/.test(className);

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      data-cursor={dataCursor}
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ x: springX, y: springY }}
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
