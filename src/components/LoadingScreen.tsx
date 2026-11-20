"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const TOTAL_DURATION_MS = 2300;
const PROGRESS_RADIUS = 68;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RADIUS;

export function LoadingScreen() {
  const { locale } = useLanguage();
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
            }, 780);
          }, 300);
        }, 80);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (waveTimer) clearTimeout(waveTimer);
      if (curtainTimer) clearTimeout(curtainTimer);
      if (doneTimer) clearTimeout(doneTimer);
    };
  }, []);

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
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
        className="fixed top-0 left-0 right-0 h-1/2 bg-[#050505]"
      />
      <motion.div
        initial={{ y: "0%" }}
        animate={{ y: curtainsOpen ? "100%" : "0%" }}
        transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
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
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 90)"
            />
          </svg>

          {/* Emblema EllikEmblem 120x120px con 3 físicas independientes que encastran en 100 */}
          <motion.svg
            width="120"
            height="120"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={shockwaveActive ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-[120px] w-[120px] overflow-visible"
          >
            {/* 1. Anillo exterior excéntrico: giro lento horario hasta encastrar en 0° */}
            <motion.g
              initial={{ rotate: -270, opacity: 0.25 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 2.15, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "32px 32px" }}
            >
              <circle
                cx="33"
                cy="25"
                r="21"
                stroke="#FFFFFF"
                strokeWidth="1.75"
                strokeOpacity="0.46"
              />
            </motion.g>

            {/* 2. Anillo intermedio: giro antihorario hasta encastrar con los nodos en 0° */}
            <motion.g
              initial={{ rotate: 320, opacity: 0.3 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 2.15, ease: [0.2, 0.95, 0.32, 1] }}
              style={{ transformOrigin: "32px 32px" }}
            >
              <circle
                cx="30"
                cy="36"
                r="21"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeOpacity="0.95"
              />
              <motion.rect
                x="23.5"
                y="11.5"
                width="7.5"
                height="7.5"
                fill="#FFFFFF"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "27.25px 15.25px" }}
              />
              <motion.circle
                cx="44.8"
                cy="21.2"
                r="3.2"
                fill="#FFFFFF"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "44.8px 21.2px" }}
              />
            </motion.g>

            {/* 3. Anillo interno: pulso elástico hasta encastrar exactamente en escala 1 */}
            <motion.g
              initial={{ scale: 0.42, opacity: 0.25 }}
              animate={{
                scale: [0.42, 1.18, 0.86, 1.07, 1],
                opacity: [0.25, 0.85, 0.65, 0.95, 1],
              }}
              transition={{
                duration: 2.15,
                times: [0, 0.34, 0.58, 0.82, 1],
                ease: "easeOut",
              }}
              style={{ transformOrigin: "25.5px 38.5px" }}
            >
              <circle
                cx="25.5"
                cy="38.5"
                r="12.5"
                stroke="#FFFFFF"
                strokeWidth="1.75"
                strokeOpacity="0.62"
              />
            </motion.g>
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
