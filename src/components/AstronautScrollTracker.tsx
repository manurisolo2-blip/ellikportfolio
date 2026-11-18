"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
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

const SMOKE_PUFFS = [
  { id: "puff-1", delay: 0, dx: -5, r: 2.8, fill: "#F4F1EA" },
  { id: "puff-2", delay: 0.18, dx: 2, r: 2.4, fill: "#FDE68A" },
  { id: "puff-3", delay: 0.36, dx: -2, r: 2.1, fill: "#F4F1EA" },
] as const;

export function AstronautScrollTracker() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cableOutlineRef = useRef<SVGPathElement | null>(null);
  const cableCoreRef = useRef<SVGPathElement | null>(null);
  const trackHeightRef = useRef<number>(520);

  const [trackHeight, setTrackHeight] = useState<number>(520);
  const [motionState, setMotionState] = useState<ScrollMotionState>("idle");
  const [isFastScrolling, setIsFastScrolling] = useState<boolean>(false);
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);

  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);

  // Recorrido vertical con resorte suave
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const astroY = useTransform(smoothProgress, [0, 1], [
    0,
    Math.max(trackHeight - 64, 1),
  ]);

  // Flotación continua en gravedad cero sincronizada al subpíxel con la punta del cable
  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);

  // Inclinación del torso y micro-retraso independiente para el casco
  const rawBodyTilt = useMotionValue(0);
  const smoothBodyTilt = useSpring(rawBodyTilt, {
    stiffness: 150,
    damping: 18,
  });

  const rawHeadTilt = useMotionValue(0);
  const smoothHeadTilt = useSpring(rawHeadTilt, {
    stiffness: 95,
    damping: 13,
    mass: 0.85,
  });

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Medir altura real del carril para coordenadas exactas de la curva Bézier
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.clientHeight || 520;
      trackHeightRef.current = h;
      setTrackHeight(h);
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    window.addEventListener("resize", updateHeight, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Parpadeo aleatorio natural cada 3 a 5 segundos en reposo
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    let reopenTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        if (!document.hidden) {
          setIsBlinking(true);
          reopenTimeout = setTimeout(() => {
            setIsBlinking(false);
            scheduleBlink();
          }, 130);
        } else {
          scheduleBlink();
        }
      }, delay);
    };

    scheduleBlink();
    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (reopenTimeout) clearTimeout(reopenTimeout);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextPct = Math.round(clamp(latest, 0, 1) * 100);
    setScrollPct((prev) => (prev === nextPct ? prev : nextPct));
  });

  useMotionValueEvent(scrollVelocity, "change", (velocity) => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    const absVel = Math.abs(velocity);
    const fast = absVel > 0.08;
    setIsFastScrolling((prev) => (prev === fast ? prev : fast));

    if (velocity > 0.015) {
      const ratio = clamp((velocity - 0.015) / 0.42, 0, 1);
      rawBodyTilt.set(10 + ratio * 16); // Inclinación suave en picada
      rawHeadTilt.set(6 + ratio * 12); // Cabeza mira ligeramente hacia abajo con retardo
      setMotionState((prev) => (prev === "down" ? prev : "down"));
    } else if (velocity < -0.015) {
      const ratio = clamp((-velocity - 0.015) / 0.42, 0, 1);
      rawBodyTilt.set(-(12 + ratio * 10)); // Rebobinando hacia arriba
      rawHeadTilt.set(-(8 + ratio * 10));
      setMotionState((prev) => (prev === "up" ? prev : "up"));
    }

    idleTimerRef.current = setTimeout(() => {
      rawBodyTilt.set(0);
      rawHeadTilt.set(0);
      setIsFastScrolling(false);
      setMotionState("idle");
    }, 170);
  });

  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // Curva Bézier cuadrática viva (sin re-renders de React, 60fps directos sobre atributos SVG)
  useAnimationFrame((timeMs) => {
    if (document.hidden) return;
    const outlineEl = cableOutlineRef.current;
    const coreEl = cableCoreRef.current;
    if (!outlineEl || !coreEl) return;

    const t = timeMs * 0.001;
    const travel = Math.max(trackHeightRef.current - 64, 1);
    const currentY = clamp(smoothProgress.get(), 0, 1) * travel;
    const velocity = scrollVelocity.get();

    const anchorX = 34;
    const fx = Math.sin(t * 1.45) * 3; // x: [-3, 3, -3]
    const fy = Math.cos(t * 1.75) * 4; // y: [-4, 4, -4]
    floatX.set(fx);
    floatY.set(fy);

    // Punto conectado exactamente al acople izquierdo de la mochila (6 + 12*(56/68) ≈ 16)
    const endX = 16 + fx;
    const endY = Math.max(10, currentY + 28 + fy);

    // Punto de control elástico balanceándose con onda sinusoidal + velocidad del scroll
    const sineWave = Math.sin(t * 2.15) * 11 + Math.cos(t * 1.1) * 4;
    const velWhip = clamp(velocity * 46, -26, 26);
    const ctrlX = clamp(anchorX + sineWave + velWhip, 6, 74);
    const ctrlY = Math.max(20, endY * 0.52);

    const d = `M ${anchorX},0 Q ${ctrlX.toFixed(1)},${ctrlY.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
    outlineEl.setAttribute("d", d);
    coreEl.setAttribute("d", d);
  });

  const isDiving = motionState === "down";
  const isClimbing = motionState === "up";
  const isIdle = motionState === "idle";
  const isThrusting = isDiving || isClimbing;

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 md:left-3 top-24 bottom-20 w-20 z-40 hidden sm:block select-none"
    >
      {/* Cable umbilical curvo y elástico (Bézier cuadrática) */}
      <svg
        width="80"
        height={trackHeight}
        viewBox={`0 0 80 ${trackHeight}`}
        fill="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <circle
          cx="34"
          cy="1"
          r="2.4"
          fill="#F4F1EA"
          stroke="#18181B"
          strokeWidth="1.2"
        />
        <path
          ref={cableOutlineRef}
          d="M 34,0 Q 34,20 24,30"
          stroke="#050505"
          strokeWidth="3.4"
          strokeLinecap="round"
          opacity="0.65"
          fill="none"
        />
        <path
          ref={cableCoreRef}
          d="M 34,0 Q 34,20 24,30"
          stroke="#F4F1EA"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Posición global GPU (translateY por spring) */}
      <motion.div
        style={{ y: astroY }}
        className="pointer-events-none absolute left-[6px] top-0 will-change-transform"
      >
        {/* Flotación continua en gravedad cero (sincronizada al subpíxel con el cable) */}
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="relative will-change-transform"
        >
          <button
            type="button"
            data-cursor="action"
            aria-label={`Astronauta indicador de scroll: ${scrollPct}%`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            className="pointer-events-auto relative flex h-16 w-14 items-center justify-center bg-transparent p-0 focus:outline-none"
          >
            <motion.svg
              width="56"
              height="64"
              viewBox="0 0 68 78"
              fill="none"
              className="block overflow-visible"
              style={{
                rotate: smoothBodyTilt,
                transformOrigin: "34px 36px",
              }}
            >
              <defs>
                {/* Visor oscuro brillante con profundidad */}
                <radialGradient
                  id="ellik-astro-visor"
                  cx="35%"
                  cy="28%"
                  r="74%"
                >
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="56%" stopColor="#0F172A" />
                  <stop offset="100%" stopColor="#050505" />
                </radialGradient>

                {/* Destello cálido del propulsor */}
                <radialGradient
                  id="ellik-astro-thruster"
                  cx="50%"
                  cy="35%"
                  r="65%"
                >
                  <stop offset="0%" stopColor="#F4F1EA" stopOpacity="1" />
                  <stop offset="55%" stopColor="#FDE68A" stopOpacity="0.88" />
                  <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 1. MOCHILA PROPULSORA + DESTELLO + 3 BOLITAS DE HUMO DINÁMICAS */}
              <g>
                {/* Destello cálido y humito al scrollear */}
                <AnimatePresence>
                  {isThrusting && (
                    <motion.g
                      key="thruster-plume"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.ellipse
                        cx="16.5"
                        cy={isDiving ? "53.5" : "52.5"}
                        rx="4.6"
                        ry="6.8"
                        fill="url(#ellik-astro-thruster)"
                        animate={{
                          scaleY: [0.85, 1.3, 0.92, 1.25],
                          opacity: [0.75, 1, 0.8, 1],
                        }}
                        transition={{
                          duration: 0.32,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{ transformOrigin: "16.5px 50px" }}
                      />

                      {SMOKE_PUFFS.map((puff) => (
                        <motion.circle
                          key={puff.id}
                          cx={16.5 + puff.dx}
                          cy="52"
                          r={puff.r}
                          fill={puff.fill}
                          stroke="#18181B"
                          strokeWidth="0.9"
                          initial={{ opacity: 0.8, scale: 0.4, y: 0 }}
                          animate={{
                            opacity: [0.8, 0.45, 0],
                            scale: [0.4, 1.05, 1.5],
                            y: isDiving ? [0, -10, -20] : [0, 10, 20],
                            x: [0, puff.dx * 1.4, puff.dx * 2.4],
                          }}
                          transition={{
                            duration: 0.62,
                            delay: puff.delay,
                            repeat: Infinity,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* Cuerpo redondeado del jetpack con sombra de volumen */}
                <path
                  d="M 14.5 29.5 L 22.5 29.5 C 24 29.5, 25 30.8, 25 32.5 L 25 46.8 C 25 48.5, 23.6 49.8, 21.8 49.8 L 14.5 49.8 C 12.2 49.8, 10.6 48.1, 10.6 45.8 L 10.6 33.4 C 10.6 31.2, 12.3 29.5, 14.5 29.5 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Sombra lateral del jetpack */}
                <path
                  d="M 11.8 33.5 L 15.2 33.5 L 15.2 48.4 L 14.2 48.4 C 12.7 48.4, 11.8 47.2, 11.8 45.8 Z"
                  fill="#D4D0C8"
                />
                {/* Boquilla inferior + línea de costura */}
                <path
                  d="M 13.4 49.8 L 19.6 49.8 L 20.6 52.8 L 12.4 52.8 Z"
                  fill="#71717A"
                  stroke="#18181B"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <line
                  x1="13.5"
                  y1="35.5"
                  x2="19.2"
                  y2="35.5"
                  stroke="#71717A"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </g>

              {/* 2. PIERNA IZQUIERDA ARTICULADA (cadera: 28, 51) */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 22 }
                    : isClimbing
                      ? { rotate: -16 }
                      : { rotate: [-14, 14, -14] }
                }
                transition={
                  isIdle
                    ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.28, ease: "easeOut" }
                }
                style={{ transformOrigin: "28px 51px" }}
              >
                <path
                  d="M 23.6 50.5 L 22.8 62.6 C 21.8 64.2, 22.2 68.2, 25.4 69.2 C 28.8 70.3, 33.5 68.8, 33.4 65.8 C 33.3 63.6, 31.4 62.4, 30.8 61.6 L 32.5 50.5 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Sombra interior y suela de bota */}
                <path
                  d="M 23.8 62.6 C 26 64.2, 28.8 64.1, 30.8 62.3 L 31.8 65.4 C 31.4 67.4, 28.4 68.4, 25.8 67.7 C 23.8 67.1, 23.2 64.8, 23.8 62.6 Z"
                  fill="#D4D0C8"
                />
                <path
                  d="M 23.4 62.2 C 25.8 63.6, 28.6 63.4, 30.8 61.8"
                  stroke="#71717A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>

              {/* 3. PIERNA DERECHA ARTICULADA (cadera: 40, 51) */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 16 }
                    : isClimbing
                      ? { rotate: -22 }
                      : { rotate: [14, -14, 14] }
                }
                transition={
                  isIdle
                    ? { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.28, ease: "easeOut" }
                }
                style={{ transformOrigin: "40px 51px" }}
              >
                <path
                  d="M 35.6 50.5 L 37.8 61.8 C 37.2 63.4, 38.2 67.2, 41.6 68 C 45 68.8, 49.2 66.8, 48.8 63.8 C 48.5 61.5, 46.2 60.8, 44.8 60.2 L 43.8 50.5 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Sombra y puño de bota derecha */}
                <path
                  d="M 38.4 61.8 C 40.6 63.1, 43.2 62.5, 44.8 60.8 L 46.8 63.4 C 46.9 65.4, 44.4 66.8, 41.8 66.4 C 39.6 66, 38.4 63.8, 38.4 61.8 Z"
                  fill="#D4D0C8"
                />
                <path
                  d="M 38 61.5 C 40.5 62.6, 43.2 62, 44.8 60.3"
                  stroke="#71717A"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>

              {/* 4. BRAZO IZQUIERDO ARTICULADO (hombro: 23, 35) */}
              <motion.g
                animate={
                  isDiving
                    ? { rotate: 34 }
                    : isClimbing
                      ? { rotate: -24 }
                      : { rotate: [-12, 14, -12] }
                }
                transition={
                  isIdle
                    ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.25, ease: "easeOut" }
                }
                style={{ transformOrigin: "23px 35px" }}
              >
                <path
                  d="M 24.5 32.8 C 19.6 34.4, 15.6 38.4, 13.8 42 C 12.2 45.2, 14.5 48.6, 17.8 47.6 C 20.4 46.8, 21.4 44.2, 22 42.4 L 26.5 37.8 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Sombra suave del guante + costura de muñeca */}
                <path
                  d="M 14.8 41.8 C 16.8 43.2, 19.2 43.3, 21.2 42.2 L 20.2 44.8 C 18.6 46.8, 15.2 46.8, 14.6 44.4 Z"
                  fill="#D4D0C8"
                />
                <path
                  d="M 14.6 41.5 C 16.8 42.9, 19.2 43, 21.2 41.8"
                  stroke="#71717A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>

              {/* 5. TORSO COMPACTO CON VOLUMEN, CINTURÓN Y PANEL DE PECHO */}
              <g>
                <path
                  d="M 22.8 32.5 C 23.2 29.8, 44.8 29.8, 45.2 32.5 L 46 49.4 C 46 52.6, 39.2 54.4, 34 52.8 C 28.8 54.4, 22 52.6, 22 49.4 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Panel de sombreado lateral izquierdo para volumen */}
                <path
                  d="M 23.8 33.4 L 27.6 33.4 L 27.2 51.6 C 24.4 51.4, 23.1 50.2, 23.1 48.8 Z"
                  fill="#D4D0C8"
                />
                {/* Cinturón minimalista + hebilla */}
                <path
                  d="M 22.6 45.6 Q 34 47.4 45.4 45.6"
                  stroke="#71717A"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect
                  x="31.5"
                  y="44.4"
                  width="5"
                  height="3.4"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="1.3"
                />
                {/* Panel pectoral de soporte vital */}
                <path
                  d="M 29.5 34.8 L 38.5 34.8 C 39.6 34.8, 40.4 35.6, 40.4 36.7 L 40.4 41.2 C 40.4 42.3, 39.6 43.1, 38.5 43.1 L 29.5 43.1 C 28.4 43.1, 27.6 42.3, 27.6 41.2 L 27.6 36.7 C 27.6 35.6, 28.4 34.8, 29.5 34.8 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="1.7"
                />
                <circle cx="31.4" cy="39" r="1.35" fill="#71717A" />
                <line
                  x1="34.5"
                  y1="37.8"
                  x2="38"
                  y2="37.8"
                  stroke="#71717A"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
                <line
                  x1="34.5"
                  y1="40.3"
                  x2="37.4"
                  y2="40.3"
                  stroke="#71717A"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </g>

              {/* 6. BRAZO DERECHO ARTICULADO (hombro: 45, 35) — SALUDA EN HOVER */}
              <motion.g
                animate={
                  isHovered
                    ? { rotate: [0, -35, -10, -35, 0] }
                    : isDiving
                      ? { rotate: -36 }
                      : isClimbing
                        ? { rotate: 24 }
                        : { rotate: [14, -12, 14] }
                }
                transition={
                  isHovered
                    ? { duration: 0.72, repeat: Infinity, ease: "easeInOut" }
                    : isIdle
                      ? { duration: 3.8, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.25, ease: "easeOut" }
                }
                style={{ transformOrigin: "45px 35px" }}
              >
                <path
                  d="M 43.5 32.8 C 48.6 32.6, 53.2 34.6, 56 37.8 C 58.2 40.4, 56 44.4, 52.4 43.6 C 49.8 43, 48.4 41.2, 46.8 39.8 L 42 37.8 Z"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.1"
                  strokeLinejoin="round"
                />
                {/* Sombra del guante derecho + costura de puño */}
                <path
                  d="M 50.8 36.2 C 51.6 38.4, 51.2 40.8, 49.6 42.2 L 52.4 42.6 C 55.2 42.8, 56.6 40.2, 54.8 38.2 Z"
                  fill="#D4D0C8"
                />
                <path
                  d="M 50.5 35.8 C 51.4 38.2, 51 40.8, 49.2 42.2"
                  stroke="#71717A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </motion.g>

              {/* 7. CABEZA / CASCO ARTICULADO CON MICRO-RETRASO Y CARITA EXPRESIVA */}
              <motion.g
                style={{
                  rotate: smoothHeadTilt,
                  transformOrigin: "34px 29px",
                }}
              >
                {/* Aro del cuello */}
                <path
                  d="M 24.5 30.2 Q 34 32.6 43.5 30.2"
                  stroke="#71717A"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Orejeras de comunicación izquierda y derecha */}
                <path
                  d="M 19.6 14.6 C 17 15, 16.4 18.2, 17 21.2 C 17.6 24, 19.8 24.8, 21.8 23.8 Z"
                  fill="#D4D0C8"
                  stroke="#18181B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 48.4 14.6 C 51 15, 51.6 18.2, 51 21.2 C 50.4 24, 48.2 24.8, 46.2 23.8 Z"
                  fill="#D4D0C8"
                  stroke="#18181B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                {/* Esfera del casco redondeada */}
                <circle
                  cx="34"
                  cy="17.8"
                  r="14"
                  fill="#F4F1EA"
                  stroke="#18181B"
                  strokeWidth="2.2"
                />

                {/* Sombra curva sutil en la base inferior izquierda del casco */}
                <path
                  d="M 22.6 24.6 C 25.8 29.4, 33.4 31.2, 40.8 29.2 C 34.4 29.4, 27.6 27.6, 22.6 24.6 Z"
                  fill="#D4D0C8"
                />

                {/* Visor oscuro brillante con radialGradient */}
                <path
                  d="M 28.5 9.8 L 39.5 9.8 C 43.4 9.8, 46 12.6, 46 16.8 L 46 19.2 C 46 23.4, 43.2 26, 39.2 26 L 28.8 26 C 24.8 26, 22 23.4, 22 19.2 L 22 16.8 C 22 12.6, 24.6 9.8, 28.5 9.8 Z"
                  fill="url(#ellik-astro-visor)"
                  stroke="#18181B"
                  strokeWidth="2"
                />

                {/* Reflejo curvo blanco nítido en esquina superior izquierda del visor */}
                <path
                  d="M 25.2 14.6 Q 26.6 11.8 30.8 11.6"
                  stroke="#FFFFFF"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  opacity="0.9"
                  fill="none"
                />
                <circle
                  cx="24.8"
                  cy="17.1"
                  r="0.95"
                  fill="#FFFFFF"
                  opacity="0.82"
                />

                {/* CARITA MINIMALISTA DENTRO DEL VISOR */}
                {isHovered ? (
                  /* Expresión feliz ^ ^ al pasar el mouse */
                  <g>
                    <path
                      d="M 27.4 19.4 Q 29.8 16.2 32.2 19.4"
                      stroke="#F4F1EA"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 35.8 19.4 Q 38.2 16.2 40.6 19.4"
                      stroke="#F4F1EA"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 32.6 21.8 Q 34 23.2 35.4 21.8"
                      stroke="#F4F1EA"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      opacity="0.85"
                      fill="none"
                    />
                  </g>
                ) : (
                  /* Ojitos luminosos con parpadeo aleatorio y reacción a velocidad */
                  <motion.g
                    animate={{
                      scale: isFastScrolling ? 1.22 : 1,
                      y: isDiving ? 1.2 : isClimbing ? -1.2 : 0,
                    }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    style={{ transformOrigin: "34px 18.6px" }}
                  >
                    <motion.ellipse
                      cx="29.8"
                      cy="18.6"
                      rx="1.6"
                      ry="2.05"
                      fill="#F4F1EA"
                      animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                      transition={{ duration: 0.11, ease: "easeInOut" }}
                      style={{ transformOrigin: "29.8px 18.6px" }}
                    />
                    <motion.ellipse
                      cx="38.2"
                      cy="18.6"
                      rx="1.6"
                      ry="2.05"
                      fill="#F4F1EA"
                      animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                      transition={{ duration: 0.11, ease: "easeInOut" }}
                      style={{ transformOrigin: "38.2px 18.6px" }}
                    />
                    {isFastScrolling && (
                      <circle
                        cx="34"
                        cy="22.1"
                        r="1.15"
                        fill="#F4F1EA"
                        opacity="0.82"
                      />
                    )}
                  </motion.g>
                )}
              </motion.g>
            </motion.svg>

            {/* Globo minimalista con porcentaje al hacer hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -4, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -4, scale: 0.92 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="pointer-events-none absolute left-full ml-1.5 top-2 whitespace-nowrap border border-[#F4F1EA]/45 bg-[#050505] px-2 py-0.5 font-mono text-[10px] tracking-[0.12em] text-[#F4F1EA]"
                >
                  {scrollPct}%
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
