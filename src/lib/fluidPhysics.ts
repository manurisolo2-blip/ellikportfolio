"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Apple Designing Fluid Interfaces (WWDC 2018) mathematical primitives & spring defaults.
 */

export const APPLE_SPRING_DEFAULT = {
  type: "spring",
  bounce: 0,
  duration: 0.35,
} as const;

export const APPLE_SPRING_MOMENTUM = {
  type: "spring",
  bounce: 0.16,
  duration: 0.38,
} as const;

export const APPLE_SPRING_SNAPPY = {
  type: "spring",
  bounce: 0,
  duration: 0.24,
} as const;

/**
 * Exponential-decay momentum projection (WWDC 2018 Designing Fluid Interfaces).
 * Projects how far an object continues after pointer release given velocity in px/s.
 */
export function projectMomentum(
  velocity: number,
  decelerationRate = 0.992
): number {
  if (!Number.isFinite(velocity) || decelerationRate >= 1 || decelerationRate <= 0) {
    return 0;
  }
  return (velocity / 1000) * (decelerationRate / (1 - decelerationRate));
}

/**
 * Progressive soft boundary resistance (rubber-banding).
 * Never stops abruptly at an edge; damping increases smoothly with overshoot.
 */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55
): number {
  const dim = Math.max(Math.abs(dimension), 1);
  return (
    (overshoot * dim * constant) / (dim + constant * Math.abs(overshoot))
  );
}

/**
 * Subtle tactile feedback for meaningful gesture commits/snaps on supported mobile browsers.
 */
export function triggerHaptic(durationMs = 8): void {
  try {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      navigator.vibrate(durationMs);
    }
  } catch {
    // Ignore on browsers/platforms blocking vibration
  }
}

/**
 * Hydration-safe reduced-motion hook for Next.js SSR.
 * Returns false on SSR and first hydration pass, then tracks OS prefers-reduced-motion.
 */
export function useHydratedReducedMotion(): boolean {
  const fmReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && Boolean(fmReduced);
}
