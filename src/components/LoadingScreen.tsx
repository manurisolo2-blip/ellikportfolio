"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useHydratedReducedMotion } from "@/lib/fluidPhysics";
import {
  ELLIK_LOGO_RIBBON_A,
  ELLIK_LOGO_RIBBON_B,
  ELLIK_LOGO_STROKE_WIDTH,
  ELLIK_LOGO_VIEWBOX,
} from "@/lib/ellikLogoGeometry";

const TOTAL_DURATION_MS = 1350;
const PROGRESS_RADIUS = 68;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export function LoadingScreen() {
  const { locale } = useLanguage();
  const reducedMotion = useHydratedReducedMotion();
  const [progress, setProgress] = useState<number>(0);
  const [shockwaveActive, setShockwaveActive] = useState<boolean>(false);
  const [curtainsOpen, setCurtainsOpen] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (!isDone) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isDone]);

  useEffect(() => {
    const prefersReduced =
      reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setProgress(100);
      setCurtainsOpen(true);
      const t = setTimeout(() => {
        setIsDone(true);
      }, 180);
      return () => clearTimeout(t);
    }

    let rafId = 0;
    let waveTimer: ReturnType<typeof setTimeout> | null = null;
    let curtainTimer: ReturnType<typeof setTimeout> | null = null;
    let doneTimer: ReturnType<typeof setTimeout> | null = null;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / TOTAL_DURATION_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pct = Math.min(100, Math.round(eased * 100));
      setProgress(pct);

      if (t < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setProgress(100);
        // Encastre en 100 -> onda expansiva ultrafina -> apertura de cortinas
        waveTimer = setTimeout(() => {
          setShockwaveActive(true);
          curtainTimer = setTimeout(() => {
            setCurtainsOpen(true);
            doneTimer = setTimeout(() => {
              setIsDone(true);
            }, 550);
          }, 180);
        }, 50);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (waveTimer) clearTimeout(waveTimer);
      if (curtainTimer) clearTimeout(curtainTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, [reducedMotion]);

  if (isDone) return null;

  const phaseTwoRatio =
    progress <= 50 ? 0 : Math.min(1, (progress - 50) / 50);
  const strokeDashoffset = PROGRESS_CIRCUMFERENCE * (1 - phaseTwoRatio);
  const formattedCount = String(progress).padStart(2, "0");

  return (
    <div
      aria-live="polite"
      aria-label={locale === "es" ? "Cargando sitio ELLIK" : "Loading ELLIK studio"}
      className="fixed inset-0 z-[100] select-none"
    >
      {/* Dos cortinas horizontales negras */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: curtainsOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-1/2 bg-[#050505]"
      />
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: curtainsOpen ? "100%" : "0%" }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        className="fixed bottom-0 left-0 right-0 h-1/2 bg-[#050505]"
      />

      {/* Escena central cinematográfica */}
      <motion.div
        animate={
          curtainsOpen
            ? { scale: 1.06, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6"
      >
        {/* Contenedor del emblema (120x120px) + onda expansiva */}
        <div className="relative flex h-[200px] w-[200px] items-center justify-center">
          {/* Halo radial suave */}
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: shockwaveActive ? 1.25 : 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-6"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%)",
            }}
          />

          {/* Onda expansiva circular ultrafina (1px) disparada al encastrar en 100 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={
              shockwaveActive
                ? { scale: 3.3, opacity: [0.95, 0.55, 0] }
                : { scale: 0.9, opacity: 0 }
            }
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="cursor-ring-circle pointer-events-none absolute h-[120px] w-[120px] border border-[rgba(255,255,255,0.25)]"
          />

          {/* Guías ultrafinas de alineación + anillo de progreso */}
          <svg
            viewBox="0 0 180 180"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            fill="none"
          >
            <motion.line
              x1="12"
              y1="90"
              x2="168"
              y2="90"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1="90"
              y1="12"
              x2="90"
              y2="168"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Anillo blanco de progreso (51% a 100%) */}
            <circle
              cx="90"
              cy="90"
              r={PROGRESS_RADIUS}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            <circle
              cx="90"
              cy="90"
              r={PROGRESS_RADIUS}
              stroke="var(--accent-signal)"
              strokeWidth="1.5"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
            />
          </svg>

          {/* Emblema oficial de ELLIK (120x120px) con trazado secuencial y encastre en 100 */}
          <motion.svg
            width="120"
            height="120"
            viewBox={ELLIK_LOGO_VIEWBOX}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ rotate: -120, scale: 0.84 }}
            animate={
              shockwaveActive
                ? { rotate: 0, scale: [1, 1.07, 1] }
                : { rotate: 0, scale: 1 }
            }
            transition={{
              rotate: { duration: 1.25, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            }}
            className="relative h-[120px] w-[120px] overflow-visible"
          >
            <motion.path
              d={ELLIK_LOGO_RIBBON_A}
              stroke="#FFFFFF"
              strokeWidth={ELLIK_LOGO_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d={ELLIK_LOGO_RIBBON_B}
              stroke="#F4F1EA"
              strokeWidth={ELLIK_LOGO_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
          </motion.svg>
        </div>

        {/* Contador limpio en Clash Display regular (44px, tabular-nums) */}
        <span className="mt-7 font-display text-[44px] font-normal leading-none tabular-nums text-[#FFFFFF]">
          {formattedCount}
        </span>
      </motion.div>
    </div>
  );
}
