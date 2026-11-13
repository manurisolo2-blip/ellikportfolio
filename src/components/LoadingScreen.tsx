"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOTAL_DURATION_MS = 1800;
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function computeOrganicProgress(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 100;

  // Avance orgánico: sube fluido hasta ~82%, frena sutilmente cerca de 85% y remata rápido al 100%
  if (t < 0.52) {
    const k = t / 0.52;
    const eased = 1 - Math.pow(1 - k, 2.2);
    return eased * 82;
  }
  if (t < 0.84) {
    const k = (t - 0.52) / 0.32;
    return 82 + k * 6;
  }
  const k = (t - 0.84) / 0.16;
  const snap = k * k * (3 - 2 * k);
  return 88 + snap * 12;
}

function getTelemetryStatus(percent: number): string {
  if (percent <= 35) return "ALINEANDO ÓRBITA";
  if (percent <= 75) return "CARGANDO MISIONES";
  return "SISTEMA ELLIK LISTO";
}

export function LoadingScreen() {
  const [progress, setProgress] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = previousOverflow;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isVisible]);

  useEffect(() => {
    let rafId = 0;
    let holdTimer: ReturnType<typeof setTimeout> | null = null;
    let exitTimer: ReturnType<typeof setTimeout> | null = null;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const ratio = Math.min(1, elapsed / TOTAL_DURATION_MS);
      const nextProgress = Math.round(computeOrganicProgress(ratio));
      setProgress(nextProgress);

      if (ratio < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setProgress(100);
        holdTimer = setTimeout(() => {
          setIsFlashing(true);
          exitTimer = setTimeout(() => {
            setIsVisible(false);
          }, 160);
        }, 250);
      }
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      if (holdTimer) clearTimeout(holdTimer);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  const strokeDashoffset = CIRCUMFERENCE * (1 - progress / 100);
  const starScale = 0.86 + (progress / 100) * 0.22;
  const glowIntensity = (progress / 100) * 0.8;
  const formattedPercent = `${String(progress).padStart(2, "0")}%`;
  const statusLabel = getTelemetryStatus(progress);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="ellik-loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-live="polite"
          aria-label="Cargando sistema ELLIK"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] select-none"
        >
          {/* Destello estelar de 12px en esquina superior izquierda rotando lentamente */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            className="fixed top-6 left-6 lg:top-8 lg:left-10"
            aria-hidden="true"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6 0 C6.4 4.2 7.8 5.6 12 6 C7.8 6.4 6.4 7.8 6 12 C5.6 7.8 4.2 6.4 0 6 C4.2 5.6 5.6 4.2 6 0 Z"
                fill="#FFFFFF"
              />
            </svg>
          </motion.div>

          {/* Centro Absoluto: Estrella de Carga de Ellik */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={
                isFlashing
                  ? { scale: 1.4, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-24 w-24"
            >
              <svg
                width="96"
                height="96"
                viewBox="0 0 96 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Anillo orbital guía */}
                <circle
                  cx="48"
                  cy="48"
                  r={RADIUS}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />

                {/* Anillo orbital de progreso */}
                <circle
                  cx="48"
                  cy="48"
                  r={RADIUS}
                  stroke="#FFFFFF"
                  strokeWidth="1.25"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 48 48)"
                />

                {/* Estrella ELLIK de 4 puntas afiladas en el núcleo */}
                <g
                  style={{
                    transform: `scale(${starScale})`,
                    transformOrigin: "48px 48px",
                    filter: `drop-shadow(0 0 12px rgba(255, 255, 255, ${glowIntensity.toFixed(
                      2
                    )}))`,
                  }}
                >
                  <path
                    d="M48 22 C49.5 41 55 46.5 74 48 C55 49.5 49.5 55 48 74 C46.5 55 41 49.5 22 48 C41 46.5 46.5 41 48 22 Z"
                    fill="#FFFFFF"
                  />
                </g>
              </svg>
            </motion.div>

            {/* Telemetría debajo del SVG */}
            <div className="mt-6 flex flex-col items-center gap-1.5 text-center">
              <span className="font-mono text-[13px] italic tabular-nums text-[#FFFFFF]">
                {formattedPercent}
              </span>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#52525B]">
                {statusLabel}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
