"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

type ScrollMotionState = "idle" | "down" | "up";

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function AstronautScrollTracker() {
  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 22,
    restDelta: 0.001,
  });
  const cableHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const rawTilt = useMotionValue(-4);
  const smoothTilt = useSpring(rawTilt, {
    stiffness: 190,
    damping: 20,
  });

  const [motionState, setMotionState] = useState<ScrollMotionState>("idle");
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextPct = Math.round(clamp(latest, 0, 1) * 100);
    setScrollPct((prev) => (prev === nextPct ? prev : nextPct));
  });

  useMotionValueEvent(scrollVelocity, "change", (velocity) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (velocity > 0.015) {
      const speedFactor = clamp((velocity - 0.015) / 0.45, 0, 1);
      rawTilt.set(15 + speedFactor * 17); // +15deg a +32deg en picada
      setMotionState((prev) => (prev === "down" ? prev : "down"));
    } else if (velocity < -0.015) {
      rawTilt.set(-20); // Mirando hacia arriba al rebobinar el cable
      setMotionState((prev) => (prev === "up" ? prev : "up"));
    }

    idleTimerRef.current = setTimeout(() => {
      rawTilt.set(-4);
      setMotionState("idle");
    }, 150);
  });

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  const isDiving = motionState === "down";
  const isClimbing = motionState === "up";
  const isIdle = motionState === "idle";

  return (
    <>
      {/* Riel espacial y cable umbilical adaptativo al contraste del fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-6 lg:right-auto lg:left-8 top-24 bottom-24 z-40 w-[1px] select-none mix-blend-difference"
      >
        <div className="absolute inset-0 w-[1px] bg-white/15" />
        <motion.div
          style={{ height: cableHeight }}
          className="w-[1px] bg-[#F4F1EA] origin-top will-change-[height]"
        />
      </div>

      {/* Contenedor anclado exactamente a la punta del cable umbilical */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed right-6 lg:right-auto lg:left-8 top-24 bottom-24 z-40 w-[1px] select-none"
      >
        <motion.div
          style={{ top: cableHeight }}
          className="pointer-events-auto absolute left-1/2 -translate-x-1/2 -translate-y-1 flex items-center justify-center will-change-[top]"
        >
          <button
            type="button"
            data-cursor="action"
            aria-label={`Altitud de desplazamiento: ${scrollPct}%`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onClick={() => setIsHovered((prev) => !prev)}
            className="relative flex min-h-[58px] min-w-[48px] items-center justify-center bg-transparent p-0 focus:outline-none"
          >
            <motion.svg
              width="48"
              height="58"
              viewBox="0 0 64 76"
              fill="none"
              className="overflow-visible block scale-[0.82] lg:scale-100"
              style={{ rotate: smoothTilt, transformOrigin: "32px 4px" }}
            >
              {/* Movimiento continuo de ingravidez en gravedad cero al detener el scroll */}
              <motion.g
                animate={
                  isIdle
                    ? { y: [0, -5, 0], rotate: [-4, 4, -4] }
                    : { y: 0, rotate: 0 }
                }
                transition={
                  isIdle
                    ? {
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : { duration: 0.22, ease: "easeOut" }
                }
                style={{ transformOrigin: "33px 34px" }}
              >
                {/* Cable umbilical ondulado estilo dibujo conectando la punta superior con la mochila */}
                <path
                  d="M 32 2 C 25 10, 7 15, 11 32 C 13 41, 14 48, 20 43.5"
                  stroke="#050505"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 32 2 C 25 10, 7 15, 11 32 C 13 41, 14 48, 20 43.5"
                  stroke="#F4F1EA"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="2.2"
                  r="2.1"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="1.3"
                />

                {/* Llamitas y chispas dibujadas al bajar rápido (scroll DOWN) */}
                <motion.g
                  animate={
                    isDiving
                      ? {
                          opacity: [0.5, 1, 0.6, 1],
                          scaleY: [0.82, 1.24, 0.9, 1.28],
                        }
                      : { opacity: 0, scaleY: 0.3 }
                  }
                  transition={
                    isDiving
                      ? { duration: 0.28, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.18 }
                  }
                  style={{ transformOrigin: "20px 44px" }}
                >
                  <path
                    d="M 18 44 Q 19 54 22.5 44.5"
                    stroke="#050505"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 18 44 Q 19 54 22.5 44.5"
                    stroke="#F4F1EA"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 15.5 46 L 13 50.5"
                    stroke="#050505"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 15.5 46 L 13 50.5"
                    stroke="#F4F1EA"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 24 46.5 L 25.5 51"
                    stroke="#050505"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 24 46.5 L 25.5 51"
                    stroke="#F4F1EA"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </motion.g>

                {/* Mochila propulsora detrás del hombro con sombreado a lápiz */}
                <path
                  d="M 18.5 27.5 L 26 25.2 C 27.8 24.7, 29.2 26, 28.7 27.8 L 25.2 42.2 C 24.7 43.9, 22.8 44.6, 21 43.8 L 16.2 41.8 C 14.5 41.1, 13.8 39.2, 14.4 37.3 L 17 29.2 C 17.4 28.2, 17.9 27.7, 18.5 27.5 Z"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M 16.5 34.5 L 19.2 33.4 M 15.8 37.4 L 19 36.1 M 16.2 40.1 L 20.5 38.4"
                  stroke="#050505"
                  strokeWidth="1.15"
                  strokeLinecap="round"
                />

                {/* Pierna izquierda + bota redondeada */}
                <motion.g
                  animate={
                    isDiving
                      ? { rotate: 20 }
                      : isClimbing
                        ? { rotate: -14 }
                        : { rotate: [-5, 7, -5] }
                  }
                  transition={
                    isIdle
                      ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.24, ease: "easeOut" }
                  }
                  style={{ transformOrigin: "29px 46px" }}
                >
                  <path
                    d="M 26 44.5 L 28.6 58.2 C 27.4 59.5, 27.4 63.8, 30.2 65.5 C 33.5 67.4, 39.2 66.5, 39.8 63.4 C 40.3 60.8, 37.5 59.2, 35.8 58 L 35.2 45.5 Z"
                    fill="#F4F1EA"
                    stroke="#050505"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Línea de puño de bota */}
                  <path
                    d="M 28.8 58 C 31.2 59.6, 33.8 59.4, 35.8 57.8"
                    stroke="#050505"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.g>

                {/* Pierna derecha + bota inclinada */}
                <motion.g
                  animate={
                    isDiving
                      ? { rotate: 24 }
                      : isClimbing
                        ? { rotate: -10 }
                        : { rotate: [7, -6, 7] }
                  }
                  transition={
                    isIdle
                      ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.24, ease: "easeOut" }
                  }
                  style={{ transformOrigin: "38px 43px" }}
                >
                  <path
                    d="M 34.5 44 L 41.2 54.4 C 40.5 56.2, 41.5 59.8, 44.6 60.8 C 48.2 62, 53 60, 52.8 57 C 52.6 54.4, 49.4 53.6, 47.4 53 L 43 41.5 Z"
                    fill="#F4F1EA"
                    stroke="#050505"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Línea de puño de bota */}
                  <path
                    d="M 41.2 54.3 C 43.4 55.2, 45.8 54.4, 47.2 52.6"
                    stroke="#050505"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.g>

                {/* Brazo izquierdo redondeado con guante grueso */}
                <motion.g
                  animate={
                    isDiving
                      ? { rotate: 28 }
                      : isClimbing
                        ? { rotate: -20 }
                        : { rotate: [-4, 6, -4] }
                  }
                  transition={
                    isIdle
                      ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.22, ease: "easeOut" }
                  }
                  style={{ transformOrigin: "24px 31px" }}
                >
                  <path
                    d="M 24.5 29.2 C 20 32.5, 16.4 37, 14.5 40.6 C 12.6 43.8, 14.2 47.6, 17.6 47 C 20.5 46.4, 21.8 43.2, 21.8 41 L 27.5 34 Z"
                    fill="#F4F1EA"
                    stroke="#050505"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Puño del guante izquierdo */}
                  <path
                    d="M 15.2 40 C 17 41.8, 19.4 42, 21.4 40.8"
                    stroke="#050505"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    fill="none"
                  />
                </motion.g>

                {/* Torso abombado del traje espacial */}
                <path
                  d="M 23.2 28.4 C 24 26.8, 39.5 25.5, 42.2 27.8 L 43.8 42.8 C 43.8 45.8, 36.2 47.2, 34 45.4 C 31.8 47.4, 25.8 47.2, 25.4 44.2 Z"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Pliegue entre piernas + sombreado sutil a lápiz */}
                <path
                  d="M 32.2 46.2 C 33.8 44.2, 35.8 44.2, 37.2 46.2"
                  stroke="#050505"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 26.2 37.5 L 28.4 36.4 M 26.5 40 L 29 38.8 M 26.8 42.5 L 29.4 41.3"
                  stroke="#050505"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />

                {/* Panel rectangular redondeado en el pecho */}
                <path
                  d="M 29.6 32.8 L 38 31.5 C 39.2 31.3, 40.2 32.1, 40.4 33.3 L 41 37.4 C 41.2 38.6, 40.4 39.6, 39.2 39.8 L 30.8 41.1 C 29.6 41.3, 28.6 40.5, 28.4 39.3 L 27.8 35.2 C 27.6 34, 28.4 33, 29.6 32.8 Z"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Brazo derecho + guante redondeado (saluda rápido al hacer hover) */}
                <motion.g
                  animate={
                    isHovered
                      ? { rotate: [0, -54, -14, -56, 0] }
                      : isDiving
                        ? { rotate: 32 }
                        : isClimbing
                          ? { rotate: -22 }
                          : { rotate: [5, -6, 5] }
                  }
                  transition={
                    isHovered
                      ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" }
                      : isIdle
                        ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                        : { duration: 0.22, ease: "easeOut" }
                  }
                  style={{ transformOrigin: "40.5px 30.5px" }}
                >
                  <path
                    d="M 40.5 27.5 C 45.2 27.8, 49.5 29.5, 52.8 31.8 C 55.6 33.8, 54.4 38, 50.6 37.5 C 47.5 37.2, 46.2 35.5, 44.5 34.4 L 39.5 34 Z"
                    fill="#F4F1EA"
                    stroke="#050505"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Puño del guante derecho */}
                  <path
                    d="M 48.2 29.4 C 48.9 31.6, 48.4 34.2, 46.8 35.8"
                    stroke="#050505"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Sombrado axila derecha */}
                  <path
                    d="M 41.2 33.4 L 44.2 32.4 M 43 34.8 L 45.8 33.8"
                    stroke="#050505"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                </motion.g>

                {/* Casco sobredimensionado con orejeras laterales y visor oscuro sólido */}
                {/* Orejera derecha asomando por el borde */}
                <path
                  d="M 43.2 13.8 C 46 13.4, 47.4 15.8, 46.8 18.8 C 46.3 21.4, 44.4 22.4, 42.5 21.4 Z"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Esfera del casco */}
                <circle
                  cx="32.4"
                  cy="17.8"
                  r="12.2"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.5"
                />

                {/* Sombrado sutil bajo el mentón del casco */}
                <path
                  d="M 24.2 26.8 L 26.8 25.2 M 26.5 28.4 L 29.2 26.8 M 29.2 29.4 L 31.8 28"
                  stroke="#050505"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                />

                {/* Visor grande oscuro estilo trazo de carbón */}
                <path
                  d="M 30.8 11.4 C 35.2 10.6, 40.6 11.4, 42 15.6 C 43.4 19.6, 41.2 24.4, 36 25.4 C 31.2 26.3, 25.8 24.2, 24.8 19.8 C 23.8 15.4, 26.5 12.2, 30.8 11.4 Z"
                  fill="#0D0D10"
                  stroke="#050505"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Textura sutil de rayado en el visor */}
                <path
                  d="M 27.6 15.8 L 32 13.2 M 26.8 19.4 L 36.4 13.8 M 28.4 22.2 L 39.8 15.6 M 32.5 23.4 L 40.5 18.8"
                  stroke="#1E1E24"
                  strokeWidth="1"
                  strokeLinecap="round"
                />

                {/* Orejera izquierda protagonista montada sobre el borde del casco */}
                <path
                  d="M 20.6 15.8 C 18.2 16.4, 17.6 19.6, 18.6 22.6 C 19.5 25.4, 22.2 26.4, 24.2 25 C 25.8 23.8, 25.6 20.2, 24.4 17.6 C 23.4 15.6, 22 15.4, 20.6 15.8 Z"
                  fill="#F4F1EA"
                  stroke="#050505"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            </motion.svg>

            {/* Etiqueta técnica dibujada al pasar el mouse */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="pointer-events-none absolute right-full mr-2.5 lg:right-auto lg:left-full lg:ml-2.5 whitespace-nowrap border border-[#F4F1EA]/40 bg-[#050505] px-2 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-[#F4F1EA]"
                >
                  ALT: {scrollPct}%
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </div>
    </>
  );
}
