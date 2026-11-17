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
    <div
      aria-hidden="true"
      className="pointer-events-none fixed right-6 lg:right-auto lg:left-8 top-24 bottom-24 z-40 w-[1px] select-none mix-blend-difference"
    >
      {/* Riel espacial base */}
      <div className="absolute inset-0 w-[1px] bg-white/10" />

      {/* Cable umbilical blanco desde el origen hasta la mochila del astronauta */}
      <motion.div
        style={{ height: cableHeight }}
        className="w-[1px] bg-[#F4F1EA] origin-top will-change-[height]"
      />

      {/* Punta exacta del cable: Mini Astronauta Line-Art */}
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
          className="relative flex min-h-[52px] min-w-[44px] items-center justify-center bg-transparent p-0 focus:outline-none"
        >
          <motion.svg
            width="42"
            height="52"
            viewBox="0 0 42 52"
            fill="none"
            className="overflow-visible block scale-[0.86] lg:scale-100"
            style={{ rotate: smoothTilt, transformOrigin: "21px 6px" }}
          >
            {/* Grupo de ingravidez en gravedad cero cuando frena el scroll */}
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
              style={{ transformOrigin: "21px 20px" }}
            >
              {/* Punto de acople y segmento curvo superior del cable umbilical */}
              <circle cx="21" cy="2.5" r="1.4" fill="#FFFFFF" />
              <path
                d="M 21 4 C 15.5 7, 10.5 13, 12 22.5"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Mochila propulsora (Jetpack) conectada al cable */}
              <path
                d="M 9.8 22.4 L 15.4 22.4 L 15.4 33.8 L 9.8 33.8 Z"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 10.4 33.8 L 14.8 33.8 L 15.4 36.2 L 9.8 36.2 Z"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Llamitas y chispas de propulsión solo al bajar (scroll DOWN) */}
              <motion.g
                animate={
                  isDiving
                    ? {
                        opacity: [0.45, 1, 0.55, 1],
                        scaleY: [0.8, 1.25, 0.9, 1.3],
                      }
                    : { opacity: 0, scaleY: 0.3 }
                }
                transition={
                  isDiving
                    ? { duration: 0.28, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.18 }
                }
                style={{ transformOrigin: "12.6px 36.5px" }}
              >
                <motion.path
                  d="M 10.9 36.8 Q 12.6 44.5 14.3 36.8"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <motion.path
                  d="M 9.2 38.4 L 7.4 42"
                  stroke="#FFFFFF"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 16 38.4 L 17.6 41.8"
                  stroke="#FFFFFF"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Pierna izquierda flotante */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 24 }
                    : isClimbing
                      ? { rotate: -14 }
                      : { rotate: [-6, 10, -6] }
                }
                transition={
                  isIdle
                    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.24, ease: "easeOut" }
                }
                style={{ transformOrigin: "19.2px 34px" }}
              >
                <path
                  d="M 19.2 34 L 17.6 42.5 L 15 43.8"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.g>

              {/* Pierna derecha flotante */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 28 }
                    : isClimbing
                      ? { rotate: -10 }
                      : { rotate: [8, -8, 8] }
                }
                transition={
                  isIdle
                    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.24, ease: "easeOut" }
                }
                style={{ transformOrigin: "24.2px 34px" }}
              >
                <path
                  d="M 24.2 34 L 26 42.5 L 28.8 43.6"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </motion.g>

              {/* Brazo izquierdo flotante */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 34 }
                    : isClimbing
                      ? { rotate: -22 }
                      : { rotate: [-5, 7, -5] }
                }
                transition={
                  isIdle
                    ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.22, ease: "easeOut" }
                }
                style={{ transformOrigin: "16.5px 24.5px" }}
              >
                <path
                  d="M 16.5 24.5 Q 11.4 27.6 10.6 31.2"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>

              {/* Torso compacto */}
              <path
                d="M 16.2 22.8 L 26.8 22.8 L 26 34 L 17 34 Z"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="22.8"
                cy="27"
                r="1.3"
                stroke="#FFFFFF"
                strokeWidth="1.3"
                fill="#050505"
              />
              <path
                d="M 19 30.8 L 24 30.8"
                stroke="#FFFFFF"
                strokeWidth="1.3"
                strokeLinecap="round"
              />

              {/* Casco redondeado sobredimensionado con visor oscuro y reflejo blanco */}
              <circle
                cx="22"
                cy="13.8"
                r="9.6"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="1.6"
              />
              <path
                d="M 19.6 9.4 L 26.4 9.4 C 28.7 9.4 30.2 11.1 30.2 13.6 C 30.2 16.1 28.7 17.8 26.4 17.8 L 19.6 17.8 C 17.3 17.8 15.8 16.1 15.8 13.6 C 15.8 11.1 17.3 9.4 19.6 9.4 Z"
                fill="#050505"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 18.8 11.6 Q 21.6 10.4 24.4 11.4"
                stroke="#FFFFFF"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />

              {/* Brazo derecho: saluda rápido al hacer hover */}
              <motion.g
                animate={
                  isHovered
                    ? { rotate: [-12, -74, -18, -74, -12] }
                    : isDiving
                      ? { rotate: 38 }
                      : isClimbing
                        ? { rotate: -26 }
                        : { rotate: [6, -6, 6] }
                }
                transition={
                  isHovered
                    ? { duration: 0.65, repeat: Infinity, ease: "easeInOut" }
                    : isIdle
                      ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.22, ease: "easeOut" }
                }
                style={{ transformOrigin: "26.6px 24.5px" }}
              >
                <path
                  d="M 26.6 24.5 Q 31.8 25.8 33.8 21.6"
                  stroke="#FFFFFF"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>
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
                className="pointer-events-none absolute right-full mr-2.5 lg:right-auto lg:left-full lg:ml-2.5 whitespace-nowrap border border-white/45 px-2 py-1 font-mono text-[10px] tracking-[0.14em] uppercase text-white"
              >
                ALT: {scrollPct}%
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  );
}
