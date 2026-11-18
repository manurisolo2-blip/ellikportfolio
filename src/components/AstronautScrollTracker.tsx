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

type VisorMood = "normal" | "fast" | "happy";

interface GasParticleState {
  active: boolean;
  life: number;
  maxLife: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const GAS_PARTICLE_COUNT = 4;
const CLICK_SPARK_ANGLES = [0, 60, 120, 180, 240, 300];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function AstronautScrollTracker() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cableOutlineRef = useRef<SVGPathElement | null>(null);
  const cableCoreRef = useRef<SVGPathElement | null>(null);

  // Esqueleto articulado por segmentos (<g> jerárquicos a 60fps sin re-renders)
  const rigRootRef = useRef<SVGGElement | null>(null);
  const torsoRef = useRef<SVGGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const leftUpperArmRef = useRef<SVGGElement | null>(null);
  const leftForearmRef = useRef<SVGGElement | null>(null);
  const rightUpperArmRef = useRef<SVGGElement | null>(null);
  const rightForearmRef = useRef<SVGGElement | null>(null);
  const leftThighRef = useRef<SVGGElement | null>(null);
  const leftShinRef = useRef<SVGGElement | null>(null);
  const rightThighRef = useRef<SVGGElement | null>(null);
  const rightShinRef = useRef<SVGGElement | null>(null);
  const visorLookRef = useRef<SVGGElement | null>(null);

  const flameOuterRef = useRef<SVGPathElement | null>(null);
  const flameInnerRef = useRef<SVGPathElement | null>(null);
  const particleRefs = useRef<Array<SVGCircleElement | null>>([]);
  const sparkRefs = useRef<Array<SVGLineElement | null>>([]);

  // Estado cinemático mutable para loop 60fps
  const trackHeightRef = useRef<number>(520);
  const smoothBodyTiltRef = useRef<number>(0);
  const smoothHeadTiltRef = useRef<number>(0);
  const flipAngleRef = useRef<number>(0);
  const flipVelocityRef = useRef<number>(0);
  const flipActiveRef = useRef<boolean>(false);
  const sparkBurstTimeRef = useRef<number>(-10);
  const hoveredRef = useRef<boolean>(false);

  const particlesRef = useRef<GasParticleState[]>(
    Array.from({ length: GAS_PARTICLE_COUNT }, () => ({
      active: false,
      life: 0,
      maxLife: 0.65,
      x: 18,
      y: 66,
      vx: 0,
      vy: 0,
    }))
  );
  const particleSpawnAccRef = useRef<number>(0);

  const [trackHeight, setTrackHeight] = useState<number>(520);
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [visorMood, setVisorMood] = useState<VisorMood>("normal");

  const { scrollYProgress } = useScroll();
  const scrollVelocity = useVelocity(scrollYProgress);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 20,
    mass: 0.6,
    restDelta: 0.0005,
  });

  const astroY = useTransform(smoothProgress, [0, 1], [
    0,
    Math.max(trackHeight - 96, 1),
  ]);

  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);

  const moodTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hoveredRef.current = isHovered;
    if (isHovered || flipActiveRef.current) {
      setVisorMood("happy");
    } else if (Math.abs(scrollVelocity.get()) > 0.22) {
      setVisorMood("fast");
    } else {
      setVisorMood("normal");
    }
  }, [isHovered, scrollVelocity]);

  // Altura del carril para spline cúbico exacto
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

  // Parpadeo natural cada 3 a 5 segundos
  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | null = null;
    let reopenTimeout: ReturnType<typeof setTimeout> | null = null;

    const scheduleBlink = () => {
      const delay = 3000 + Math.random() * 2000;
      blinkTimeout = setTimeout(() => {
        if (!document.hidden && !hoveredRef.current && !flipActiveRef.current) {
          setIsBlinking(true);
          reopenTimeout = setTimeout(() => {
            setIsBlinking(false);
            scheduleBlink();
          }, 125);
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

  useMotionValueEvent(scrollVelocity, "change", (vel) => {
    if (moodTimerRef.current) {
      clearTimeout(moodTimerRef.current);
      moodTimerRef.current = null;
    }

    if (hoveredRef.current || flipActiveRef.current) {
      setVisorMood("happy");
    } else if (Math.abs(vel) > 0.22) {
      setVisorMood("fast");
    } else {
      setVisorMood("normal");
    }

    moodTimerRef.current = setTimeout(() => {
      if (!hoveredRef.current && !flipActiveRef.current) {
        setVisorMood("normal");
      }
    }, 180);
  });

  useEffect(() => {
    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, []);

  const handleAstronautClick = () => {
    // Mortal completo hacia atrás (-360deg) con resorte elástico + 6 chispas estelares
    flipAngleRef.current = 0;
    flipVelocityRef.current = -1080;
    flipActiveRef.current = true;
    sparkBurstTimeRef.current = performance.now() * 0.001;
    setVisorMood("happy");
  };

  useAnimationFrame((timeMs, deltaMs) => {
    if (document.hidden) return;
    const dt = Math.min(deltaMs, 50) / 1000;
    const t = timeMs * 0.001;

    const travel = Math.max(trackHeightRef.current - 96, 1);
    const currentAstroY = clamp(smoothProgress.get(), 0, 1) * travel;
    const rawVel = scrollVelocity.get();
    const absVel = Math.abs(rawVel);
    const velNorm = clamp(rawVel * 2.2, -1, 1);

    // Flotación continua en gravedad cero
    const fx = Math.sin(t * 1.45) * 3.2;
    const fy = Math.cos(t * 1.75) * 4.2;
    floatX.set(fx);
    floatY.set(fy);

    // 1. Cable umbilical con spline cúbico elástico conectado a la mochila
    const outlineEl = cableOutlineRef.current;
    const coreEl = cableCoreRef.current;
    if (outlineEl && coreEl) {
      const anchorX = 42;
      const svgScaleX = 76 / 88;
      const svgScaleY = 96 / 112;
      const endX = 8 + 18 * svgScaleX + fx;
      const endY = Math.max(12, currentAstroY + 49 * svgScaleY + fy);

      const wave1 = Math.sin(t * 2.1) * 14 + Math.cos(t * 1.15) * 5;
      const wave2 = Math.cos(t * 1.85 - 0.9) * 12;
      const velWhip = clamp(rawVel * 55, -34, 34);

      const c1x = clamp(anchorX + wave1 * 0.75 - velWhip * 0.5, 6, 88);
      const c1y = Math.max(12, endY * 0.34);
      const c2x = clamp(anchorX + wave2 + velWhip, 6, 88);
      const c2y = Math.max(24, endY * 0.72);

      const d = `M ${anchorX},0 C ${c1x.toFixed(1)},${c1y.toFixed(
        1
      )} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(
        1
      )}`;
      outlineEl.setAttribute("d", d);
      coreEl.setAttribute("d", d);
    }

    // 2. Resorte elástico para el mortal trasero (360deg) y rotación general
    if (flipActiveRef.current) {
      const targetFlip = -360;
      const springForce = (targetFlip - flipAngleRef.current) * 68;
      flipVelocityRef.current += springForce * dt;
      flipVelocityRef.current *= Math.exp(-8.2 * dt);
      flipAngleRef.current += flipVelocityRef.current * dt;

      if (
        Math.abs(targetFlip - flipAngleRef.current) < 1.2 &&
        Math.abs(flipVelocityRef.current) < 10
      ) {
        flipAngleRef.current = 0;
        flipVelocityRef.current = 0;
        flipActiveRef.current = false;
        if (!hoveredRef.current && absVel <= 0.22) {
          setVisorMood("normal");
        }
      }
    }

    const targetBodyTilt =
      absVel > 0.018 ? clamp(rawVel * 48, -22, 24) : Math.sin(t * 0.95) * 3.5;
    smoothBodyTiltRef.current +=
      (targetBodyTilt - smoothBodyTiltRef.current) * (1 - Math.exp(-10 * dt));

    const targetHeadTilt =
      absVel > 0.018
        ? clamp(rawVel * 28, -14, 16)
        : Math.sin(t * 0.95 - 0.65) * 4.5;
    smoothHeadTiltRef.current +=
      (targetHeadTilt - smoothHeadTiltRef.current) * (1 - Math.exp(-6.5 * dt));

    const totalRootRot = smoothBodyTiltRef.current + flipAngleRef.current;
    if (rigRootRef.current) {
      rigRootRef.current.setAttribute(
        "transform",
        `rotate(${totalRootRot.toFixed(2)} 44 54)`
      );
    }

    if (torsoRef.current) {
      const torsoBreath = Math.sin(t * 1.6) * 0.8;
      torsoRef.current.setAttribute(
        "transform",
        `translate(0 ${torsoBreath.toFixed(2)})`
      );
    }

    if (headRef.current) {
      headRef.current.setAttribute(
        "transform",
        `rotate(${smoothHeadTiltRef.current.toFixed(2)} 44 37)`
      );
    }

    if (visorLookRef.current) {
      const lookY = clamp(rawVel * 4.5, -2.2, 2.2);
      visorLookRef.current.setAttribute(
        "transform",
        `translate(0 ${lookY.toFixed(2)})`
      );
    }

    // 3. Cinemática articulada de brazos y piernas (desfase phase - 0.85 en antebrazos/pantorrillas)
    const armPhase = t * 2.1;
    const legPhase = t * 2.45;
    const speedStrength = clamp(absVel / 0.35, 0, 1);

    let lShoulderDeg: number;
    let lElbowDeg: number;
    let rShoulderDeg: number;
    let rElbowDeg: number;

    if (flipActiveRef.current) {
      // Abrir ambos brazos durante la voltereta
      lShoulderDeg = 64;
      lElbowDeg = 18;
      rShoulderDeg = -68;
      rElbowDeg = -18;
    } else if (hoveredRef.current) {
      lShoulderDeg = -10 + Math.sin(armPhase) * 10;
      lElbowDeg = 10 + Math.sin(armPhase - 0.85) * 14;
      // Brazo derecho saludando de forma natural
      rShoulderDeg = -66 + Math.sin(t * 5.2) * 8;
      rElbowDeg = -22 + Math.sin(t * 10.4 - 0.85) * 28;
    } else if (absVel > 0.025) {
      // Brazos se levantan por inercia y resistencia al scrollear rápido
      const inertia = rawVel > 0 ? 1 : -1;
      lShoulderDeg =
        inertia * (16 + speedStrength * 28) + Math.sin(armPhase) * 8;
      lElbowDeg =
        inertia * (10 + speedStrength * 16) + Math.sin(armPhase - 0.85) * 14;
      rShoulderDeg =
        -inertia * (16 + speedStrength * 28) + Math.cos(armPhase) * 8;
      rElbowDeg =
        -inertia * (10 + speedStrength * 16) + Math.cos(armPhase - 0.85) * 14;
    } else {
      lShoulderDeg = Math.sin(armPhase) * 12;
      lElbowDeg = Math.sin(armPhase - 0.85) * 18 - 8;
      rShoulderDeg = Math.cos(armPhase * 0.9) * 12;
      rElbowDeg = Math.cos(armPhase * 0.9 - 0.85) * 18 + 8;
    }

    if (leftUpperArmRef.current) {
      leftUpperArmRef.current.setAttribute(
        "transform",
        `rotate(${lShoulderDeg.toFixed(2)} 29 44)`
      );
    }
    if (leftForearmRef.current) {
      leftForearmRef.current.setAttribute(
        "transform",
        `rotate(${lElbowDeg.toFixed(2)} 22 54)`
      );
    }
    if (rightUpperArmRef.current) {
      rightUpperArmRef.current.setAttribute(
        "transform",
        `rotate(${rShoulderDeg.toFixed(2)} 59 44)`
      );
    }
    if (rightForearmRef.current) {
      rightForearmRef.current.setAttribute(
        "transform",
        `rotate(${rElbowDeg.toFixed(2)} 66 54)`
      );
    }

    let lHipDeg: number;
    let lKneeDeg: number;
    let rHipDeg: number;
    let rKneeDeg: number;

    if (absVel > 0.025) {
      if (rawVel > 0) {
        // Bajando: estiradas hacia atrás con flexión realista de rodilla
        lHipDeg = 18 + speedStrength * 16 + Math.sin(legPhase * 1.4) * 5;
        lKneeDeg = 14 + speedStrength * 22;
        rHipDeg = 12 + speedStrength * 14 + Math.cos(legPhase * 1.4) * 5;
        rKneeDeg = 18 + speedStrength * 24;
      } else {
        // Subiendo rápido: cuelgan hacia abajo con inercia
        lHipDeg = -14 - speedStrength * 14 + Math.sin(legPhase) * 5;
        lKneeDeg = 6 + speedStrength * 10;
        rHipDeg = -10 - speedStrength * 12 + Math.cos(legPhase) * 5;
        rKneeDeg = 8 + speedStrength * 12;
      }
    } else {
      // Nado espacial asíncrono suave en gravedad cero
      lHipDeg = Math.sin(legPhase) * 13;
      lKneeDeg = 10 + Math.sin(legPhase - 0.85) * 14;
      rHipDeg = Math.sin(legPhase + Math.PI * 0.85) * 13;
      rKneeDeg = 10 + Math.sin(legPhase + Math.PI * 0.85 - 0.85) * 14;
    }

    if (leftThighRef.current) {
      leftThighRef.current.setAttribute(
        "transform",
        `rotate(${lHipDeg.toFixed(2)} 37 69)`
      );
    }
    if (leftShinRef.current) {
      leftShinRef.current.setAttribute(
        "transform",
        `rotate(${lKneeDeg.toFixed(2)} 35 83)`
      );
    }
    if (rightThighRef.current) {
      rightThighRef.current.setAttribute(
        "transform",
        `rotate(${rHipDeg.toFixed(2)} 51 69)`
      );
    }
    if (rightShinRef.current) {
      rightShinRef.current.setAttribute(
        "transform",
        `rotate(${rKneeDeg.toFixed(2)} 53 83)`
      );
    }

    // 4. Propulsor de mochila + partículas circulares de gas
    const isThrusting = absVel > 0.025;
    if (flameOuterRef.current && flameInnerRef.current) {
      if (isThrusting) {
        const flicker = 0.85 + 0.35 * Math.sin(t * 36);
        const fScale = (0.7 + speedStrength * 0.75) * flicker;
        flameOuterRef.current.setAttribute("opacity", "0.95");
        flameOuterRef.current.setAttribute(
          "transform",
          `translate(17 65) scale(1 ${fScale.toFixed(2)}) translate(-17 -65)`
        );
        flameInnerRef.current.setAttribute("opacity", "1");
        flameInnerRef.current.setAttribute(
          "transform",
          `translate(17 65) scale(1 ${(fScale * 0.88).toFixed(2)}) translate(-17 -65)`
        );
      } else {
        flameOuterRef.current.setAttribute("opacity", "0");
        flameInnerRef.current.setAttribute("opacity", "0");
      }
    }

    const particles = particlesRef.current;
    if (isThrusting) {
      particleSpawnAccRef.current += dt * (4 + speedStrength * 6);
      if (particleSpawnAccRef.current >= 1) {
        particleSpawnAccRef.current = 0;
        const slot = particles.find((p) => !p.active);
        if (slot) {
          slot.active = true;
          slot.life = 0;
          slot.maxLife = 0.5 + Math.random() * 0.25;
          slot.x = 17 + (Math.random() - 0.5) * 4;
          slot.y = 67;
          slot.vx = -6 - Math.random() * 10;
          slot.vy = velNorm >= 0 ? -18 - Math.random() * 14 : 18 + Math.random() * 14;
        }
      }
    } else {
      particleSpawnAccRef.current = 0;
    }

    for (let i = 0; i < GAS_PARTICLE_COUNT; i++) {
      const p = particles[i];
      const circle = particleRefs.current[i];
      if (!circle) continue;

      if (!p.active) {
        circle.setAttribute("opacity", "0");
        continue;
      }

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        circle.setAttribute("opacity", "0");
        continue;
      }

      const progress = p.life / p.maxLife;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      const r = 1.6 + progress * 2.6;
      const op = (1 - progress) * 0.85;
      circle.setAttribute("cx", p.x.toFixed(1));
      circle.setAttribute("cy", p.y.toFixed(1));
      circle.setAttribute("r", r.toFixed(2));
      circle.setAttribute("opacity", op.toFixed(2));
    }

    // 5. 6 chispas estelares del Easter Egg al hacer clic
    const sparkAge = t - sparkBurstTimeRef.current;
    for (let i = 0; i < CLICK_SPARK_ANGLES.length; i++) {
      const lineEl = sparkRefs.current[i];
      if (!lineEl) continue;

      if (sparkAge < 0 || sparkAge > 0.65) {
        lineEl.setAttribute("opacity", "0");
        continue;
      }

      const sp = sparkAge / 0.65;
      const eased = 1 - Math.pow(1 - sp, 2);
      const rad = (CLICK_SPARK_ANGLES[i] * Math.PI) / 180;
      const rInner = 24 + eased * 20;
      const rOuter = rInner + 7 * (1 - sp * 0.65);

      const x1 = 44 + Math.cos(rad) * rInner;
      const y1 = 52 + Math.sin(rad) * rInner;
      const x2 = 44 + Math.cos(rad) * rOuter;
      const y2 = 52 + Math.sin(rad) * rOuter;

      lineEl.setAttribute("x1", x1.toFixed(1));
      lineEl.setAttribute("y1", y1.toFixed(1));
      lineEl.setAttribute("x2", x2.toFixed(1));
      lineEl.setAttribute("y2", y2.toFixed(1));
      lineEl.setAttribute("opacity", (1 - sp).toFixed(2));
    }
  });

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 md:left-3 top-24 bottom-16 w-24 z-40 hidden sm:block select-none"
    >
      {/* Spline umbilical cúbico */}
      <svg
        width="96"
        height={trackHeight}
        viewBox={`0 0 96 ${trackHeight}`}
        fill="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <circle
          cx="42"
          cy="1"
          r="2.4"
          fill="#F4F1EA"
          stroke="#18181B"
          strokeWidth="1.2"
        />
        <path
          ref={cableOutlineRef}
          d="M 42,0 C 42,10 30,20 22,38"
          stroke="#050505"
          strokeWidth="3.6"
          strokeLinecap="round"
          opacity="0.7"
          fill="none"
        />
        <path
          ref={cableCoreRef}
          d="M 42,0 C 42,10 30,20 22,38"
          stroke="#F4F1EA"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Posición global GPU (spring vertical + flotación continua) */}
      <motion.div
        style={{ y: astroY }}
        className="pointer-events-none absolute left-[8px] top-0 will-change-transform"
      >
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="relative will-change-transform"
        >
          <button
            type="button"
            data-cursor="action"
            aria-label={`Astronauta articulado: ${scrollPct}% del recorrido`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onClick={handleAstronautClick}
            className="pointer-events-auto relative flex h-[96px] w-[76px] items-center justify-center bg-transparent p-0 focus:outline-none"
          >
            <svg
              width="76"
              height="96"
              viewBox="0 0 88 112"
              fill="none"
              className="block overflow-visible"
            >
              <defs>
                <radialGradient
                  id="ellik-astro-visor-pro"
                  cx="35%"
                  cy="28%"
                  r="75%"
                >
                  <stop offset="0%" stopColor="#1E293B" />
                  <stop offset="56%" stopColor="#0D1526" />
                  <stop offset="100%" stopColor="#030305" />
                </radialGradient>
              </defs>

              {/* 6 Chispas estelares al hacer clic */}
              <g>
                {CLICK_SPARK_ANGLES.map((angle, idx) => (
                  <line
                    key={angle}
                    ref={(el) => {
                      sparkRefs.current[idx] = el;
                    }}
                    x1="44"
                    y1="52"
                    x2="44"
                    y2="52"
                    stroke="#F4F1EA"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0"
                  />
                ))}
              </g>

              {/* Partículas dinámicas de gas del propulsor */}
              <g>
                {Array.from({ length: GAS_PARTICLE_COUNT }, (_, idx) => (
                  <circle
                    key={idx}
                    ref={(el) => {
                      particleRefs.current[idx] = el;
                    }}
                    cx="17"
                    cy="67"
                    r="2"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="0.9"
                    opacity="0"
                  />
                ))}
              </g>

              {/* Esqueleto Principal Articulado */}
              <g ref={rigRootRef}>
                {/* Mochila propulsora + llama de dos capas + manguera curva al casco */}
                <g>
                  <path
                    ref={flameOuterRef}
                    d="M 12.2 64.5 Q 17 82 21.8 64.5 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="1.2"
                    opacity="0"
                  />
                  <path
                    ref={flameInnerRef}
                    d="M 14.5 64.5 Q 17 75.5 19.5 64.5 Z"
                    fill="#FFFFFF"
                    opacity="0"
                  />

                  {/* Manguera curva de soporte vital */}
                  <path
                    d="M 27 31 C 15 34, 13 43, 18 48"
                    stroke="#18181B"
                    strokeWidth="4.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 27 31 C 15 34, 13 43, 18 48"
                    stroke="#CFCAC0"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Mochila redondeada */}
                  <path
                    d="M 14 40.5 L 25.5 40.5 C 27.2 40.5, 28.4 41.8, 28.4 43.5 L 28.4 59.8 C 28.4 61.8, 26.8 63.2, 24.8 63.2 L 14 63.2 C 11.8 63.2, 10.2 61.5, 10.2 59.4 L 10.2 44.3 C 10.2 42.2, 11.9 40.5, 14 40.5 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 11.4 44.5 L 15.8 44.5 L 15.8 61.8 L 14 61.8 C 12.3 61.8, 11.4 60.6, 11.4 59 Z"
                    fill="#CFCAC0"
                  />
                  <path
                    d="M 13 63.2 L 21 63.2 L 22 66.2 L 12 66.2 Z"
                    fill="#18181B"
                  />
                </g>

                {/* Pierna Izquierda: Muslo -> Pantorrilla + Bota */}
                <g ref={leftThighRef}>
                  <path
                    d="M 30.8 68.5 L 42.2 68.5 L 41 83.2 C 40.8 84.5, 32 84.5, 31.6 83.2 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 32.2 70 L 35.4 70 L 34.8 82.5 L 32.6 82.5 Z"
                    fill="#CFCAC0"
                  />
                  <circle cx="35.5" cy="83" r="1.6" fill="#18181B" />

                  <g ref={leftShinRef}>
                    <path
                      d="M 31.4 82.4 L 40.2 82.4 L 40.6 93 C 42.2 94.4, 42.6 98.4, 39.2 99.6 C 35.4 100.8, 29.8 99.4, 29.8 96 C 29.8 93.8, 31.4 92.6, 31.6 91.8 Z"
                      fill="#F4F1EA"
                      stroke="#18181B"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 31.2 92.8 C 34.2 94.4, 37.6 94.3, 40 92.6 L 40.8 96.4 C 40.2 98.2, 36.2 99.2, 33 98.4 C 30.8 97.8, 30.4 95.2, 31.2 92.8 Z"
                      fill="#CFCAC0"
                    />
                    <path
                      d="M 31.4 92.2 C 34.2 93.6, 37.4 93.5, 39.8 92"
                      stroke="#18181B"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Pierna Derecha: Muslo -> Pantorrilla + Bota */}
                <g ref={rightThighRef}>
                  <path
                    d="M 45.8 68.5 L 57.2 68.5 L 56.4 83.2 C 56 84.5, 47.2 84.5, 47 83.2 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 47.2 70 L 50.2 70 L 49.8 82.5 L 47.8 82.5 Z"
                    fill="#CFCAC0"
                  />
                  <circle cx="52.5" cy="83" r="1.6" fill="#18181B" />

                  <g ref={rightShinRef}>
                    <path
                      d="M 47.8 82.4 L 56.6 82.4 L 56.4 91.8 C 56.6 92.6, 58.2 93.8, 58.2 96 C 58.2 99.4, 52.6 100.8, 48.8 99.6 C 45.4 98.4, 45.8 94.4, 47.4 93 Z"
                      fill="#F4F1EA"
                      stroke="#18181B"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 48 92.6 C 50.4 94.3, 53.8 94.4, 56.8 92.8 C 57.6 95.2, 57.2 97.8, 55 98.4 C 51.8 99.2, 47.8 98.2, 47.2 96.4 Z"
                      fill="#CFCAC0"
                    />
                    <path
                      d="M 48.2 92 C 50.6 93.5, 53.8 93.6, 56.6 92.2"
                      stroke="#18181B"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Brazo Izquierdo: Hombro -> Codo -> Antebrazo + Guante */}
                <g ref={leftUpperArmRef}>
                  <path
                    d="M 31 41.2 C 25.5 42.2, 20.8 46.8, 19.2 52.2 C 18.8 54, 21.8 56.2, 24.4 55.6 C 26.8 55, 29.8 50.8, 32.5 47.5 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <circle cx="22" cy="54" r="1.5" fill="#18181B" />

                  <g ref={leftForearmRef}>
                    <path
                      d="M 19.6 52.6 C 16.4 56.8, 14 61.2, 13.8 64.8 C 13.6 67.8, 17 70.2, 20.2 68.8 C 22.8 67.6, 23.6 64, 23.8 61.5 L 25.4 54.4 Z"
                      fill="#F4F1EA"
                      stroke="#18181B"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 15.2 62.8 C 17.6 64.2, 20.4 64, 22.8 62.4 L 22 66.2 C 20 68.2, 16 68.4, 15 65.4 Z"
                      fill="#CFCAC0"
                    />
                    <path
                      d="M 15 62.4 C 17.4 63.8, 20.4 63.6, 22.8 62"
                      stroke="#18181B"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Torso con sombreado, cinturón y panel con LED titilante */}
                <g ref={torsoRef}>
                  <path
                    d="M 28.6 41.4 C 29.2 38.2, 58.8 38.2, 59.4 41.4 L 60.4 66.6 C 60.4 70.4, 51.8 72.4, 44 70.6 C 36.2 72.4, 27.6 70.4, 27.6 66.6 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 29.8 42.6 L 35.6 42.6 L 34.8 69.2 C 31.2 69, 29.1 67.6, 29.1 66 Z"
                    fill="#CFCAC0"
                  />
                  <path
                    d="M 28.5 62.4 Q 44 64.8 59.5 62.4"
                    stroke="#18181B"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect
                    x="41"
                    y="61"
                    width="6"
                    height="4"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="1.4"
                  />

                  {/* Panel mínimo pectoral con LED diminuto que titila */}
                  <rect
                    x="36"
                    y="45.2"
                    width="16"
                    height="11"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="1.8"
                  />
                  <motion.circle
                    cx="40.5"
                    cy="50.7"
                    r="1.6"
                    fill="#FDE68A"
                    stroke="#18181B"
                    strokeWidth="0.8"
                    animate={{ opacity: [0.35, 1, 0.35] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <line
                    x1="44.2"
                    y1="49"
                    x2="49.2"
                    y2="49"
                    stroke="#18181B"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="44.2"
                    y1="52.4"
                    x2="48"
                    y2="52.4"
                    stroke="#CFCAC0"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </g>

                {/* Brazo Derecho: Hombro -> Codo -> Antebrazo + Guante */}
                <g ref={rightUpperArmRef}>
                  <path
                    d="M 57 41.2 C 62.5 42.2, 67.2 46.8, 68.8 52.2 C 69.2 54, 66.2 56.2, 63.6 55.6 C 61.2 55, 58.2 50.8, 55.5 47.5 Z"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <circle cx="66" cy="54" r="1.5" fill="#18181B" />

                  <g ref={rightForearmRef}>
                    <path
                      d="M 68.4 52.6 C 71.6 56.8, 74 61.2, 74.2 64.8 C 74.4 67.8, 71 70.2, 67.8 68.8 C 65.2 67.6, 64.4 64, 64.2 61.5 L 62.6 54.4 Z"
                      fill="#F4F1EA"
                      stroke="#18181B"
                      strokeWidth="2.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 72.8 62.8 C 70.4 64.2, 67.6 64, 65.2 62.4 L 66 66.2 C 68 68.2, 72 68.4, 73 65.4 Z"
                      fill="#CFCAC0"
                    />
                    <path
                      d="M 73 62.4 C 70.6 63.8, 67.6 63.6, 65.2 62"
                      stroke="#18181B"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Cabeza / Casco Articulado con doble reflejo y expresiones en el visor */}
                <g ref={headRef}>
                  <path
                    d="M 31 39.2 Q 44 42.2 57 39.2"
                    stroke="#18181B"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Orejeras laterales */}
                  <path
                    d="M 24.4 17.5 C 21 18, 20.2 22.5, 21 26.8 C 21.8 30.6, 24.8 31.6, 27.6 30.2 Z"
                    fill="#CFCAC0"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 63.6 17.5 C 67 18, 67.8 22.5, 67 26.8 C 66.2 30.6, 63.2 31.6, 60.4 30.2 Z"
                    fill="#CFCAC0"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinejoin="round"
                  />

                  {/* Esfera del casco */}
                  <circle
                    cx="44"
                    cy="22"
                    r="18.5"
                    fill="#F4F1EA"
                    stroke="#18181B"
                    strokeWidth="2.4"
                  />

                  {/* Sombra inferior izquierda del casco */}
                  <path
                    d="M 29.2 31.6 C 33.4 37.8, 43.2 40.4, 52.8 37.8 C 44.4 38, 35.6 35.4, 29.2 31.6 Z"
                    fill="#CFCAC0"
                  />

                  {/* Visor azul-obsidiana */}
                  <path
                    d="M 36.4 11.4 L 51.6 11.4 C 56.8 11.4, 60.2 15.2, 60.2 20.6 L 60.2 24 C 60.2 29.4, 56.6 33, 51.2 33 L 36.8 33 C 31.4 33, 27.8 29.4, 27.8 24 L 27.8 20.6 C 27.8 15.2, 31.2 11.4, 36.4 11.4 Z"
                    fill="url(#ellik-astro-visor-pro)"
                    stroke="#18181B"
                    strokeWidth="2.2"
                  />

                  {/* Doble reflejo blanco brillante superior izquierdo */}
                  <path
                    d="M 31.8 18.2 Q 33.8 14.2 39.6 13.8"
                    stroke="#FFFFFF"
                    strokeWidth="2.1"
                    strokeLinecap="round"
                    opacity="0.95"
                    fill="none"
                  />
                  <circle
                    cx="31.2"
                    cy="21.4"
                    r="1.2"
                    fill="#FFFFFF"
                    opacity="0.9"
                  />

                  {/* Expresiones vivas en el visor */}
                  <g ref={visorLookRef}>
                    {visorMood === "happy" ? (
                      <g>
                        <path
                          d="M 35 23.4 Q 38 19.2 41 23.4"
                          stroke="#F4F1EA"
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 47 23.4 Q 50 19.2 53 23.4"
                          stroke="#F4F1EA"
                          strokeWidth="2.1"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 42.2 26.2 Q 44 28 45.8 26.2"
                          stroke="#F4F1EA"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </g>
                    ) : visorMood === "fast" ? (
                      /* Ojos apretados > < durante scroll muy rápido */
                      <g>
                        <path
                          d="M 35 20.6 L 40 22.8 L 35 25"
                          stroke="#F4F1EA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <path
                          d="M 53 20.6 L 48 22.8 L 53 25"
                          stroke="#F4F1EA"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                        <circle cx="44" cy="27.2" r="1.35" fill="#F4F1EA" />
                      </g>
                    ) : (
                      /* Ojitos luminosos con parpadeo natural */
                      <g>
                        <motion.ellipse
                          cx="38.2"
                          cy="22.8"
                          rx="2"
                          ry="2.55"
                          fill="#F4F1EA"
                          animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                          transition={{ duration: 0.11, ease: "easeInOut" }}
                          style={{ transformOrigin: "38.2px 22.8px" }}
                        />
                        <motion.ellipse
                          cx="49.8"
                          cy="22.8"
                          rx="2"
                          ry="2.55"
                          fill="#F4F1EA"
                          animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                          transition={{ duration: 0.11, ease: "easeInOut" }}
                          style={{ transformOrigin: "49.8px 22.8px" }}
                        />
                      </g>
                    )}
                  </g>
                </g>
              </g>
            </svg>

            {/* Globo minimalista de porcentaje al hacer hover */}
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
