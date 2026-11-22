"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ELLIK_LOGO_PATHS,
  ELLIK_LOGO_STROKE_WIDTH,
  ELLIK_LOGO_VIEWBOX,
} from "@/lib/ellikLogoGeometry";

interface EllikEmblemProps {
  size?: number;
  className?: string;
}

/** Emblema oficial de ELLIK en geometría canónica de doble lazo. */
export function EllikEmblem({ size, className = "h-7 w-7" }: EllikEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={ELLIK_LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {ELLIK_LOGO_PATHS.map((d, index) => (
        <path
          key={index}
          d={d}
          stroke="currentColor"
          strokeWidth={ELLIK_LOGO_STROKE_WIDTH}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/** Alias de compatibilidad para usos existentes del isotipo. */
export const EllikMark = EllikEmblem;

interface EllikSolarGyroscopeProps {
  className?: string;
}

/**
 * Presentación tridimensional sutil del emblema oficial de ELLIK en paleta monocroma y starlight.
 */
export function EllikSolarGyroscope({
  className = "",
}: EllikSolarGyroscopeProps) {
  return (
    <div
      aria-hidden="true"
      style={{ perspective: "900px", transformStyle: "preserve-3d" }}
      className={`relative flex items-center justify-center select-none ${className}`}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d" }}
        animate={{
          rotateX: [-9, 9, -9],
          rotateY: [-13, 13, -13],
          rotateZ: [0, 360],
          scale: [0.97, 1.03, 0.97],
          opacity: [0.9, 1, 0.9],
          color: ["#FFFFFF", "#F4F1EA", "#FFFFFF"],
        }}
        transition={{
          rotateX: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 12, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { duration: 36, repeat: Infinity, ease: "linear" },
          scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          color: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
        className="flex h-full w-full items-center justify-center text-[#FFFFFF] will-change-transform"
      >
        <EllikEmblem className="h-full w-full text-current" />
      </motion.div>
    </div>
  );
}

interface EllikLogoProps {
  className?: string;
}

export function EllikLogo({ className = "" }: EllikLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <EllikEmblem className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 text-current" />
      <span className="font-display text-sm font-semibold tracking-[0.22em] text-current">
        ELLIK
      </span>
    </span>
  );
}
