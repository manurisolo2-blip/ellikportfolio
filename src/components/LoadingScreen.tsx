"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TOTAL_DURATION_MS = 2300;
const PROGRESS_RADIUS = 56;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export function LoadingScreen() {
  const [progress, setProgress] = useState<number>(0);
  const [starFlashing, setStarFlashing] = useState<boolean>(false);
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
    let rafId = 0;
    let flashTimer: ReturnType<typeof setTimeout> | null = null;
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
        flashTimer = setTimeout(() => {
          setStarFlashing(true);
          curtainTimer = setTimeout(() => {
            setCurtainsOpen(true);
            doneTimer = setTimeout(() => {
              setIsDone(true);
            }, 780);
          }, 160);
        }, 120);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (flashTimer) clearTimeout(flashTimer);
      if (curtainTimer) clearTimeout(curtainTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, []);

  if (isDone) return null;

  // Fase 2 (51% a 100%): progreso circular sincronizado con el contador
  const phaseTwoRatio =
    progress <= 50 ? 0 : Math.min(1, (progress - 50) / 50);
  const strokeDashoffset = PROGRESS_CIRCUMFERENCE * (1 - phaseTwoRatio);
  const formattedCount = String(progress).padStart(2, "0");

  return (
    <div
      aria-live="polite"
      aria-label="Cargando sitio ELLIK"
      className="fixed inset-0 z-[100] select-none"
    >
      {/* Fase 3: Apertura de Obturador (dos paneles horizontales) */}
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: curtainsOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-1/2 bg-[#050505]"
      />
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: curtainsOpen ? "100%" : "0%" }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        className="fixed bottom-0 left-0 right-0 h-1/2 bg-[#050505]"
      />

      {/* Contenido cinético central */}
      <motion.div
        animate={
          starFlashing
            ? { scale: 1.4, opacity: 0 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6"
      >
        <div className="relative flex h-44 w-44 items-center justify-center">
          {/* Halo radial suave */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-6"
            style={{
              background:
                "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%)",
            }}
          />

          <svg
            viewBox="0 0 180 180"
            className="h-full w-full overflow-visible"
            fill="none"
          >
            {/* Cruz de alineación central ultrafina */}
            <motion.line
              x1="14"
              y1="90"
              x2="166"
              y2="90"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.line
              x1="90"
              y1="14"
              x2="90"
              y2="166"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Fase 1: Dos anillos orbitales finos trazados con pathLength girando en sentidos opuestos */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "90px 90px" }}
            >
              <motion.circle
                cx="90"
                cy="90"
                r="76"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.g>

            <motion.g
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "90px 90px" }}
            >
              <motion.circle
                cx="90"
                cy="90"
                r="66"
                stroke="rgba(255, 255, 255, 0.14)"
                strokeWidth="1"
                strokeDasharray="20 8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.05, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.g>

            {/* Fase 2: Anillo circular blanco de progreso (51% a 100%) */}
            <circle
              cx="90"
              cy="90"
              r={PROGRESS_RADIUS}
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
            />

            {/* Isotipo orbital ELLIK en el núcleo expandiéndose desde escala 0 */}
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "90px 90px" }}
            >
              <g transform="translate(58 58)">
                <circle
                  cx="33"
                  cy="25"
                  r="21"
                  stroke="#FFFFFF"
                  strokeWidth="1.75"
                  strokeOpacity="0.42"
                />
                <circle
                  cx="30"
                  cy="36"
                  r="21"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeOpacity="0.95"
                />
                <circle
                  cx="25.5"
                  cy="38.5"
                  r="12.5"
                  stroke="#FFFFFF"
                  strokeWidth="1.75"
                  strokeOpacity="0.58"
                />
                <rect
                  x="23.5"
                  y="11.5"
                  width="7.5"
                  height="7.5"
                  fill="#FFFFFF"
                />
                <circle cx="44.8" cy="21.2" r="3.2" fill="#FFFFFF" />
              </g>
            </motion.g>
          </svg>
        </div>

        {/* Contador grande limpio en Space Grotesk light (44px, tabular-nums), sin % ni texto técnico */}
        <span className="mt-8 font-display text-[44px] font-light leading-none tabular-nums text-[#FFFFFF]">
          {formattedCount}
        </span>
      </motion.div>
    </div>
  );
}
