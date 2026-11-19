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

const CLICK_STAR_ANGLES = [0, 58, 122, 180, 238, 302] as const;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function AstronautScrollTracker() {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cablePathRef = useRef<SVGPathElement | null>(null);
  const cableAnchorRef = useRef<SVGCircleElement | null>(null);

  // Jerarquía articulada (<g> con transform-origin exactos, 60fps sin re-renders)
  const rigRootRef = useRef<SVGGElement | null>(null);
  const torsoRef = useRef<SVGGElement | null>(null);
  const headRef = useRef<SVGGElement | null>(null);
  const farArmRef = useRef<SVGGElement | null>(null);
  const upperArmRef = useRef<SVGGElement | null>(null);
  const forearmRef = useRef<SVGGElement | null>(null);
  const frontLegRef = useRef<SVGGElement | null>(null);
  const frontShinRef = useRef<SVGGElement | null>(null);
  const backLegRef = useRef<SVGGElement | null>(null);
  const backShinRef = useRef<SVGGElement | null>(null);

  const flowGroupRef = useRef<SVGGElement | null>(null);
  const flowLineRefs = useRef<Array<SVGPathElement | null>>([]);
  const clickStarRefs = useRef<Array<SVGLineElement | null>>([]);

  const trackHeightRef = useRef<number>(520);
  const hoveredRef = useRef<boolean>(false);

  // Estado cinemático mutable suavizado exponencialmente con dt
  const kinRef = useRef({
    smoothVel: 0,
    rootTilt: 0,
    headTilt: 0,
    hoverBlend: 0,
    farArmRot: 0,
    shoulderRot: 0,
    elbowRot: 0,
    frontHipRot: 0,
    frontKneeRot: 0,
    backHipRot: 0,
    backKneeRot: 0,
    flowAlpha: 0,
    flowAngle: 120,
    lightBlend: 0,
  });

  // Mortal 360° en clic + trazos estelares radiales de tinta
  const spinActiveRef = useRef<boolean>(false);
  const spinStartTimeRef = useRef<number>(-10);
  const starBurstTimeRef = useRef<number>(-10);

  // Detección cacheada de #servicios (#F4F1EA) para inversión limpia del cable umbilical
  const serviciosCacheRef = useRef<{
    el: HTMLElement | null;
    lastCheck: number;
    overLight: boolean;
  }>({
    el: null,
    lastCheck: 0,
    overLight: false,
  });

  const [trackHeight, setTrackHeight] = useState<number>(520);
  const [scrollPct, setScrollPct] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

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
    Math.max(trackHeight - 112, 1),
  ]);

  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);

  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  // Medición responsiva de la altura del carril
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

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextPct = Math.round(clamp(latest, 0, 1) * 100);
    setScrollPct((prev) => (prev === nextPct ? prev : nextPct));
  });

  const handleAstronautClick = () => {
    spinActiveRef.current = true;
    const now = performance.now() * 0.001;
    spinStartTimeRef.current = now;
    starBurstTimeRef.current = now;
  };

  useAnimationFrame((timeMs, deltaMs) => {
    if (document.hidden) return;

    const dt = clamp(deltaMs, 1, 33) / 1000;
    const t = timeMs * 0.001;
    const nowSec = performance.now() * 0.001;
    const ease = (rate: number) => 1 - Math.exp(-rate * dt);

    const k = kinRef.current;
    const rawVel = scrollVelocity.get();
    k.smoothVel += (rawVel - k.smoothVel) * ease(12);

    const absVel = Math.abs(k.smoothVel);
    const downStrength = clamp(k.smoothVel / 0.34, 0, 1);
    const upStrength = clamp(-k.smoothVel / 0.34, 0, 1);
    const scrollStrength = Math.max(downStrength, upStrength);

    const travel = Math.max(trackHeightRef.current - 112, 1);
    const currentAstroY = clamp(smoothProgress.get(), 0, 1) * travel;

    // 1. Gravedad cero orgánica (y: ±6px, deriva lateral sutil)
    const fx = Math.sin(t * 0.95) * 2.8;
    const fy = Math.cos(t * 1.25) * 6.0;
    floatX.set(fx);
    floatY.set(fy);

    // 2. Giro limpio de 360° con ease-out suave al hacer clic
    let spinDeg = 0;
    if (spinActiveRef.current) {
      const elapsedSpin = nowSec - spinStartTimeRef.current;
      const spinDuration = 0.95;
      if (elapsedSpin >= spinDuration) {
        spinActiveRef.current = false;
        spinDeg = 0;
      } else {
        const p = clamp(elapsedSpin / spinDuration, 0, 1);
        const easedOut = 1 - Math.pow(1 - p, 3);
        spinDeg = -360 * easedOut;
      }
    }

    // 3. Torso (±3.5deg reposo, +14 a +26deg en picada abajo, -16deg mirando arriba)
    const idleTilt = Math.sin(t * 0.9) * 3.5;
    const dropTilt = 14 + downStrength * 12;
    const boostTilt = -16 * upStrength;
    const targetRootTilt =
      idleTilt * (1 - scrollStrength) +
      dropTilt * downStrength +
      boostTilt * upStrength;
    k.rootTilt += (targetRootTilt - k.rootTilt) * ease(8.5);

    k.hoverBlend += ((hoveredRef.current ? 1 : 0) - k.hoverBlend) * ease(8.0);

    // Cabeza / casco con micro-cabeceo lento y giro leve hacia el usuario en hover
    const idleHead = Math.sin(t * 0.9 - 0.65) * 4.2;
    const targetHead =
      idleHead * (1 - scrollStrength) +
      downStrength * 8 -
      upStrength * 11 +
      k.hoverBlend * 9.5;
    k.headTilt += (targetHead - k.headTilt) * ease(7.0);

    const totalRootRot = k.rootTilt + spinDeg;
    if (rigRootRef.current) {
      rigRootRef.current.setAttribute(
        "transform",
        `rotate(${totalRootRot.toFixed(2)} 54 78)`
      );
    }

    if (torsoRef.current) {
      const torsoBreath = Math.sin(t * 1.3) * 0.8;
      torsoRef.current.setAttribute(
        "transform",
        `translate(0 ${torsoBreath.toFixed(2)})`
      );
    }

    if (headRef.current) {
      headRef.current.setAttribute(
        "transform",
        `rotate(${k.headTilt.toFixed(2)} 55 39)`
      );
    }

    // 4. Brazo principal y mano abierta con follow-through + saludo suave en hover
    const armWave = Math.sin(t * 1.35 - 0.75);
    const forearmWave = Math.sin(t * 1.35 - 1.65);

    const idleShoulder = armWave * 7.5;
    const idleElbow = forearmWave * 11.5;

    // En scroll abajo se extiende atrás por inercia; en hover se eleva suave con vaivén de mano
    const targetShoulder =
      lerp(
        idleShoulder * (1 - scrollStrength) + downStrength * 34 - upStrength * 14,
        -24 + Math.sin(t * 2.4) * 4,
        k.hoverBlend
      );
    const targetElbow =
      lerp(
        idleElbow * (1 - scrollStrength) + downStrength * 18 - upStrength * 12,
        -26 + Math.sin(t * 3.2 - 0.6) * 8,
        k.hoverBlend
      );
    const targetFarArm =
      Math.cos(t * 1.35 - 0.8) * 6 * (1 - scrollStrength) -
      downStrength * 18 +
      upStrength * 10;

    k.shoulderRot += (targetShoulder - k.shoulderRot) * ease(8.5);
    k.elbowRot += (targetElbow - k.elbowRot) * ease(8.5);
    k.farArmRot += (targetFarArm - k.farArmRot) * ease(8.5);

    if (upperArmRef.current) {
      upperArmRef.current.setAttribute(
        "transform",
        `rotate(${k.shoulderRot.toFixed(2)} 49 50)`
      );
    }
    if (forearmRef.current) {
      forearmRef.current.setAttribute(
        "transform",
        `rotate(${k.elbowRot.toFixed(2)} 47 74)`
      );
    }
    if (farArmRef.current) {
      farArmRef.current.setAttribute(
        "transform",
        `rotate(${k.farArmRot.toFixed(2)} 64 52)`
      );
    }

    // 5. Piernas dobladas con oscilación asincrónica en cadera y rodilla
    const legPhase = t * 1.2;
    const idleFrontHip = Math.sin(legPhase) * 6.5;
    const idleFrontKnee = Math.sin(legPhase - 0.8) * 9.0;
    const idleBackHip = Math.sin(legPhase + Math.PI * 0.78) * 7.0;
    const idleBackKnee = Math.sin(legPhase + Math.PI * 0.78 - 0.8) * 9.5;

    // Abajo: se estiran levemente hacia atrás; Arriba: recoge las rodillas hacia adelante
    const targetFrontHip =
      idleFrontHip * (1 - scrollStrength) + downStrength * 18 - upStrength * 16;
    const targetFrontKnee =
      idleFrontKnee * (1 - scrollStrength) - downStrength * 22 + upStrength * 16;
    const targetBackHip =
      idleBackHip * (1 - scrollStrength) + downStrength * 22 - upStrength * 14;
    const targetBackKnee =
      idleBackKnee * (1 - scrollStrength) - downStrength * 20 + upStrength * 18;

    k.frontHipRot += (targetFrontHip - k.frontHipRot) * ease(9.0);
    k.frontKneeRot += (targetFrontKnee - k.frontKneeRot) * ease(9.0);
    k.backHipRot += (targetBackHip - k.backHipRot) * ease(9.0);
    k.backKneeRot += (targetBackKnee - k.backKneeRot) * ease(9.0);

    if (frontLegRef.current) {
      frontLegRef.current.setAttribute(
        "transform",
        `rotate(${k.frontHipRot.toFixed(2)} 52 96)`
      );
    }
    if (frontShinRef.current) {
      frontShinRef.current.setAttribute(
        "transform",
        `rotate(${k.frontKneeRot.toFixed(2)} 70 122)`
      );
    }
    if (backLegRef.current) {
      backLegRef.current.setAttribute(
        "transform",
        `rotate(${k.backHipRot.toFixed(2)} 46 94)`
      );
    }
    if (backShinRef.current) {
      backShinRef.current.setAttribute(
        "transform",
        `rotate(${k.backKneeRot.toFixed(2)} 57 123)`
      );
    }

    // 6. Detección cacheada de sección clara #servicios (#F4F1EA)
    const cache = serviciosCacheRef.current;
    const nowMs = performance.now();
    if (nowMs - cache.lastCheck >= 110) {
      cache.lastCheck = nowMs;
      if (!cache.el || !cache.el.isConnected) {
        cache.el = document.getElementById("servicios");
      }
      const trackEl = trackRef.current;
      if (cache.el && trackEl) {
        const sRect = cache.el.getBoundingClientRect();
        const tRect = trackEl.getBoundingClientRect();
        const astroViewportY = tRect.top + currentAstroY + 56;
        cache.overLight =
          astroViewportY >= sRect.top && astroViewportY <= sRect.bottom;
      } else {
        cache.overLight = false;
      }
    }

    k.lightBlend += ((cache.overLight ? 1 : 0) - k.lightBlend) * ease(9);

    // 7. Tres líneas de flujo/velocidad ultrafinas estilo tinta cómic al scrollear
    const isFlowing = absVel > 0.045;
    const targetFlowAlpha = isFlowing ? clamp(scrollStrength * 0.9, 0.25, 0.9) : 0;
    k.flowAlpha += (targetFlowAlpha - k.flowAlpha) * ease(11);

    const targetFlowAngle = downStrength >= upStrength ? 128 : -16;
    k.flowAngle += (targetFlowAngle - k.flowAngle) * ease(12);

    const inkR = Math.round(lerp(244, 9, k.lightBlend));
    const inkG = Math.round(lerp(241, 9, k.lightBlend));
    const inkB = Math.round(lerp(234, 11, k.lightBlend));
    const flowColor = `rgba(${inkR}, ${inkG}, ${inkB}, 0.72)`;

    if (flowGroupRef.current) {
      if (k.flowAlpha > 0.02) {
        const streakStretch = 0.72 + scrollStrength * 0.55;
        const jitter = Math.sin(t * 24) * 1.4;
        flowGroupRef.current.setAttribute("opacity", k.flowAlpha.toFixed(2));
        flowGroupRef.current.setAttribute(
          "transform",
          `translate(25 66) rotate(${k.flowAngle.toFixed(1)}) scale(1 ${streakStretch.toFixed(
            2
          )}) translate(${jitter.toFixed(2)} 0) translate(-25 -66)`
        );
        for (let i = 0; i < flowLineRefs.current.length; i++) {
          const lineEl = flowLineRefs.current[i];
          if (lineEl) lineEl.setAttribute("stroke", flowColor);
        }
      } else {
        flowGroupRef.current.setAttribute("opacity", "0");
      }
    }

    // 8. Pequeñas líneas de trazo estelar alrededor al hacer clic
    const burstAge = nowSec - starBurstTimeRef.current;
    for (let i = 0; i < CLICK_STAR_ANGLES.length; i++) {
      const lineEl = clickStarRefs.current[i];
      if (!lineEl) continue;

      if (burstAge < 0 || burstAge > 0.65) {
        lineEl.setAttribute("opacity", "0");
        continue;
      }

      const bp = burstAge / 0.65;
      const eased = 1 - Math.pow(1 - bp, 2);
      const rad = (CLICK_STAR_ANGLES[i] * Math.PI) / 180;
      const rInner = 34 + eased * 18;
      const rOuter = rInner + 9 * (1 - bp * 0.6);

      const x1 = 54 + Math.cos(rad) * rInner;
      const y1 = 76 + Math.sin(rad) * rInner;
      const x2 = 54 + Math.cos(rad) * rOuter;
      const y2 = 76 + Math.sin(rad) * rOuter;

      lineEl.setAttribute("x1", x1.toFixed(1));
      lineEl.setAttribute("y1", y1.toFixed(1));
      lineEl.setAttribute("x2", x2.toFixed(1));
      lineEl.setAttribute("y2", y2.toFixed(1));
      lineEl.setAttribute("stroke", `rgba(${inkR}, ${inkG}, ${inkB}, 0.85)`);
      lineEl.setAttribute("opacity", (1 - bp).toFixed(2));
    }

    // 9. Cable umbilical de tinta (1.3px) conectado exacto al arnés de la espalda
    const cableEl = cablePathRef.current;
    const anchorEl = cableAnchorRef.current;
    if (cableEl && anchorEl) {
      const anchorX = 48;
      const sx = 72 / 110;
      const sy = 112 / 170;

      // Rotar punto de enganche (29, 46) en el SVG alrededor del pivote (54, 78)
      const rad = (totalRootRot * Math.PI) / 180;
      const dx = 29 - 54;
      const dy = 46 - 78;
      const rotX = 54 + dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotY = 78 + dx * Math.sin(rad) + dy * Math.cos(rad);

      const endX = 12 + rotX * sx + fx;
      const endY = Math.max(10, currentAstroY + rotY * sy + fy);

      const slackFactor = 1 - upStrength * 0.42;
      const wave1 = (Math.sin(t * 1.4) * 11 + Math.cos(t * 0.9) * 4) * slackFactor;
      const wave2 = Math.cos(t * 1.2 - 0.8) * 10 * slackFactor;
      const velWhip = clamp(k.smoothVel * 44, -26, 26);

      const c1x = clamp(anchorX + wave1 * 0.72 - velWhip * 0.4, 8, 88);
      const c1y = Math.max(12, endY * 0.34);
      const c2x = clamp(anchorX + wave2 + velWhip, 8, 88);
      const c2y = Math.max(24, endY * 0.72);

      cableEl.setAttribute(
        "d",
        `M ${anchorX},0 C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(
          1
        )},${c2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`
      );

      // #F4F1EA/55 sobre fondo oscuro -> #09090B/55 sobre #servicios (#F4F1EA)
      const cableAlpha = lerp(0.55, 0.55, k.lightBlend).toFixed(2);
      const cableColor = `rgba(${inkR}, ${inkG}, ${inkB}, ${cableAlpha})`;
      cableEl.setAttribute("stroke", cableColor);
      anchorEl.setAttribute("fill", cableColor);
      anchorEl.setAttribute(
        "stroke",
        k.lightBlend > 0.5 ? "#F4F1EA" : "#09090B"
      );
    }
  });

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 md:left-3 top-24 bottom-16 w-[96px] z-40 hidden sm:block select-none"
    >
      {/* Cable umbilical de tinta curvo (strokeWidth 1.3px) */}
      <svg
        width="96"
        height={trackHeight}
        viewBox={`0 0 96 ${trackHeight}`}
        fill="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <circle
          ref={cableAnchorRef}
          cx="48"
          cy="1"
          r="2"
          fill="rgba(244, 241, 234, 0.55)"
          stroke="#09090B"
          strokeWidth="1"
        />
        <path
          ref={cablePathRef}
          d="M 48,0 C 48,10 38,20 31,30"
          stroke="rgba(244, 241, 234, 0.55)"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Contenedor GPU vertical + flotación en gravedad cero */}
      <motion.div
        style={{ y: astroY }}
        className="pointer-events-none absolute left-[12px] top-0 will-change-transform"
      >
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="relative will-change-transform"
        >
          <button
            type="button"
            data-cursor="action"
            aria-label={`Astronauta editorial: ${scrollPct}% del recorrido`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onClick={handleAstronautClick}
            className="pointer-events-auto relative flex h-[112px] w-[72px] items-center justify-center bg-transparent p-0 focus:outline-none"
          >
            <svg
              width="72"
              height="112"
              viewBox="0 0 110 170"
              fill="none"
              className="block overflow-visible"
            >
              {/* 6 Trazos estelares radiales al hacer clic */}
              <g>
                {CLICK_STAR_ANGLES.map((angle, idx) => (
                  <line
                    key={angle}
                    ref={(el) => {
                      clickStarRefs.current[idx] = el;
                    }}
                    x1="54"
                    y1="76"
                    x2="54"
                    y2="76"
                    stroke="#F4F1EA"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    opacity="0"
                  />
                ))}
              </g>

              {/* Esqueleto realista estilo tinta / novela gráfica (perfil 3/4) */}
              <g ref={rigRootRef}>
                {/* 3 Líneas ultrafinas de flujo / velocidad detrás de la mochila */}
                <g ref={flowGroupRef} opacity="0">
                  <path
                    ref={(el) => {
                      flowLineRefs.current[0] = el;
                    }}
                    d="M 20 64 Q 17 82 15 98"
                    stroke="#F4F1EA"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    ref={(el) => {
                      flowLineRefs.current[1] = el;
                    }}
                    d="M 26 68 Q 24 90 22 110"
                    stroke="#F4F1EA"
                    strokeWidth="0.95"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    ref={(el) => {
                      flowLineRefs.current[2] = el;
                    }}
                    d="M 32 66 Q 31 83 30 96"
                    stroke="#F4F1EA"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                    fill="none"
                  />
                </g>

                {/* Brazo lejano sutil asomando al frente para dar volumen 3/4 */}
                <g ref={farArmRef}>
                  <path
                    d="M 62 49 C 69 54, 73 61, 72 68 L 66 71 C 65 65, 62 59, 58 55 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 63 54 L 68 57 M 64 59 L 69 62"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Guante lejano con recorte #F4F1EA */}
                  <path
                    d="M 66 69 C 69 69, 73 71, 74 75 C 74.5 77.5, 72 79, 70 78 L 69 75 L 67 77 C 65 76.5, 64.5 72.5, 66 69 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </g>

                {/* Pierna trasera (doblada hacia atrás en flotación natural) */}
                <g ref={backLegRef}>
                  {/* Borde exterior de recorte sobre sombra de muslo */}
                  <path
                    d="M 39 94 L 54 94 L 62 121 L 49 124 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sombra dura interna de muslo */}
                  <path
                    d="M 40.5 96 L 47 96 L 52 122 L 49.5 123 Z"
                    fill="#09090B"
                  />
                  {/* Pliegues en tinta */}
                  <path
                    d="M 48 103 L 55 101 M 49 111 L 57 109"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Banda oscura en rodilla trasera con filete exterior #F4F1EA */}
                  <path
                    d="M 49 118 L 61.5 117 L 62.5 123.5 L 49.5 124.5 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 49 118 L 61.5 117 L 62.5 123.5 L 49.5 124.5 Z"
                    fill="none"
                    stroke="#09090B"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />

                  <g ref={backShinRef}>
                    {/* Pantorrilla flexionada atrás */}
                    <path
                      d="M 50 123 L 61 122 L 49 146 L 38 143 Z"
                      fill="#F4F1EA"
                      stroke="#09090B"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 50 124 L 54 124 L 44 144.5 L 39 143 Z"
                      fill="#09090B"
                    />
                    <path
                      d="M 48 131 L 55 133 M 44 137 L 52 139"
                      stroke="#09090B"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />

                    {/* Bota espacial trasera + suela acanalada visible */}
                    <path
                      d="M 38 142 L 49 145 L 53 151 C 55 153, 55 156, 52 157 L 35 152 Z"
                      fill="#F4F1EA"
                      stroke="#09090B"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                    {/* Puntera y contrafuerte en tinta negra */}
                    <path
                      d="M 36.5 144 L 40.5 145 L 38.5 152 L 35.5 151 Z"
                      fill="#09090B"
                    />
                    {/* Suela acanalada en tinta con recorte #F4F1EA */}
                    <path
                      d="M 34.2 151.4 L 53.5 156.6 L 52.6 159.8 L 33.4 154.6 Z"
                      fill="#09090B"
                      stroke="#F4F1EA"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    {/* Rayitas paralelas de la suela acanalada */}
                    <path
                      d="M 37 154.2 L 38 152.2 M 41 155.3 L 42 153.3 M 45 156.4 L 46 154.4 M 49 157.5 L 50 155.5"
                      stroke="#F4F1EA"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Pierna delantera (ligeramente adelantada para profundidad 3D) */}
                <g ref={frontLegRef}>
                  <path
                    d="M 47 93 C 54 91, 61 93, 64 98 L 73 119 L 60 124 L 48 103 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sombra inferior de muslo y achurado sutil */}
                  <path
                    d="M 48.5 101 L 56 101 L 64 121 L 60.5 123 Z"
                    fill="#09090B"
                  />
                  <path
                    d="M 55 102 L 62 99 M 57 107 L 65 104 M 59 112 L 67 109"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Banda oscura en rodilla delantera con recorte #F4F1EA */}
                  <path
                    d="M 59 116 L 72.5 114.5 L 74 121 L 60.5 123 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 59 116 L 72.5 114.5 L 74 121 L 60.5 123 Z"
                    fill="none"
                    stroke="#09090B"
                    strokeWidth="1.1"
                    strokeLinejoin="round"
                  />

                  <g ref={frontShinRef}>
                    {/* Pantorrilla delantera flexionada atrás */}
                    <path
                      d="M 61 122 L 73 119 L 63 145 L 51 142 Z"
                      fill="#F4F1EA"
                      stroke="#09090B"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 61 122 L 65.5 121.5 L 55.5 142.5 L 51.5 141.5 Z"
                      fill="#09090B"
                    />
                    <path
                      d="M 60 129 L 68 131 M 57 135 L 65 137"
                      stroke="#09090B"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />

                    {/* Bota espacial delantera + suela acanalada visible */}
                    <path
                      d="M 51 141 L 63 144 L 68 150 C 70.5 152, 70 155.5, 67 156 L 48 151 Z"
                      fill="#F4F1EA"
                      stroke="#09090B"
                      strokeWidth="1.9"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 49.8 143 L 54.5 144.2 L 52.5 151 L 48.8 150 Z"
                      fill="#09090B"
                    />
                    <path
                      d="M 49 147 L 60 149.8"
                      stroke="#09090B"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                    {/* Suela acanalada en tinta con contorno #F4F1EA */}
                    <path
                      d="M 47.2 150.4 L 68.5 155.6 L 67.6 159.0 L 46.4 153.8 Z"
                      fill="#09090B"
                      stroke="#F4F1EA"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 50.2 153.2 L 51.2 151.2 M 54.4 154.2 L 55.4 152.2 M 58.6 155.3 L 59.6 153.3 M 62.8 156.3 L 63.8 154.3"
                      stroke="#F4F1EA"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* Torso esbelto arqueado, mochila PLSS redondeada y arneses */}
                <g ref={torsoRef}>
                  {/* Mochila PLSS con contorno #F4F1EA en su sombra oscura trasera */}
                  <path
                    d="M 24 44 C 24.5 40.5, 27 38.5, 31 38.5 L 43 39 L 44 80 C 44 83.5, 41 85, 36 85 L 27.5 83.5 C 24 82.5, 23 78.5, 23.5 72 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sombra trasera de tinta con halo limpio #F4F1EA contra fondo negro */}
                  <path
                    d="M 24 44 C 24.4 41.5, 25.8 39.8, 28 39.2 L 32.5 39.2 L 32.5 84 L 27.5 83.2 C 24.4 82.2, 23.4 78.5, 23.8 72 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  {/* Achurado de transición en mochila */}
                  <path
                    d="M 33 46 L 37.5 46 M 33 50 L 36.5 50 M 33 54 L 38 54 M 33 68 L 37 68 M 33 72 L 36.5 72"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  {/* Módulo inferior / salida PLSS */}
                  <rect
                    x="27"
                    y="83.5"
                    width="11"
                    height="3.5"
                    rx="1"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1"
                  />
                  {/* Argolla/nudo de enganche del cable umbilical en (29, 46) */}
                  <circle
                    cx="29"
                    cy="46"
                    r="2.4"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.4"
                  />
                  <circle cx="29" cy="46" r="0.9" fill="#09090B" />

                  {/* Silueta esbelta del torso arqueado en ingravidez */}
                  <path
                    d="M 42 40 C 48 38, 59 38.5, 64 43.5 C 67.5 49, 67 61, 63 74 L 61.5 94 C 55.5 97, 45 96.5, 39.5 92 L 39 74 C 37.5 60, 39 46, 42 40 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  {/* Sombra dura en espalda baja y bajo el brazo */}
                  <path
                    d="M 39.8 68 L 46 70 L 46.5 94.5 C 43 94, 40.5 92.8, 39.8 91 Z"
                    fill="#09090B"
                  />
                  {/* Pliegues y achurado sutil en costado */}
                  <path
                    d="M 47 74 L 51 75 M 47 78 L 52 79 M 47 82 L 50.5 83 M 55 56 L 63 54 M 56 62 L 62.5 60"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  {/* Correas de arnés cruzadas + cinturón con rayas de costura */}
                  <path
                    d="M 41 43 L 61.5 76"
                    stroke="#09090B"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 62 44 L 40.5 75"
                    stroke="#09090B"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 39.2 76 Q 51 79 62.6 75.5"
                    stroke="#09090B"
                    strokeWidth="3.0"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Costuras transversales sobre las correas */}
                  <path
                    d="M 44 48 L 46 46.5 M 48 54 L 50 52.5 M 52 60 L 54 58.5 M 56 66 L 58 64.5"
                    stroke="#F4F1EA"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 43 76.5 L 43 78.8 M 48 77.2 L 48 79.5 M 57 76.8 L 57 79.0"
                    stroke="#F4F1EA"
                    strokeWidth="0.85"
                    strokeLinecap="round"
                  />

                  {/* Pequeño módulo de control rectangular en la cadera */}
                  <rect
                    x="49"
                    y="72"
                    width="9.5"
                    height="11.5"
                    rx="1"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M 49.5 80.5 L 58 80.5 L 58 83 L 49.5 83 Z"
                    fill="#09090B"
                  />
                  <path
                    d="M 51.5 75 L 56 75 M 51.5 77.8 L 54.5 77.8"
                    stroke="#09090B"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />

                  {/* Bolsillo lateral con volumen en cadera delantera */}
                  <path
                    d="M 55 85 L 62.5 84 L 62 93 L 54.5 93.5 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 55 87.5 L 62.2 86.8 M 54.5 92 L 62 91.5"
                    stroke="#09090B"
                    strokeWidth="1"
                  />
                </g>

                {/* Casco realista perfil 3/4 mirando arriba/adelante en diagonal */}
                <g ref={headRef}>
                  {/* Cuello anillado */}
                  <path
                    d="M 45 36.5 Q 55 41.5 64 38"
                    stroke="#09090B"
                    strokeWidth="3.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 46 36.5 Q 55 41 63 38"
                    stroke="#F4F1EA"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 50 38.5 L 49.5 40.2 M 54.5 39.2 L 54.5 41.0 M 59 38.8 L 59.5 40.5"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  {/* Ovoidal del casco realista */}
                  <path
                    d="M 41.5 25 C 40 16, 46 9.5, 56 9.5 C 66.5 9.5, 72.5 14.8, 72.5 22.8 C 72.5 30, 67 36.2, 57.5 37.2 C 48 38, 42.5 32.5, 41.5 25 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />

                  {/* Sombra dura de tinta en base trasera del casco + halo de recorte #F4F1EA */}
                  <path
                    d="M 42 25.5 C 42.8 32, 48.2 37.2, 57.5 36.5 C 61.5 36.2, 64.5 34.8, 66.8 32.6 C 59.5 34.5, 52 32.2, 48.5 26.8 C 46.2 23.2, 46.5 17.8, 49 13.4 C 44 15.8, 41.4 20.5, 42 25.5 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.15"
                    strokeLinejoin="round"
                  />

                  {/* Visor oscuro curvo en diagonal (contorno externo #F4F1EA + achurado + 2 brillos blancos) */}
                  <path
                    d="M 53.5 14.5 C 58.8 11.4, 67.2 12.0, 71.2 17.2 C 73.0 20.6, 71.2 26.8, 66.0 29.0 C 59.8 31.4, 53.0 28.6, 51.6 23.0 C 50.8 19.6, 51.6 16.2, 53.5 14.5 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 53.5 14.5 C 58.8 11.4, 67.2 12.0, 71.2 17.2 C 73.0 20.6, 71.2 26.8, 66.0 29.0 C 59.8 31.4, 53.0 28.6, 51.6 23.0 C 50.8 19.6, 51.6 16.2, 53.5 14.5 Z"
                    fill="none"
                    stroke="#09090B"
                    strokeWidth="1.4"
                  />

                  {/* 3 Líneas cortas de achurado dentro del visor */}
                  <path
                    d="M 54.5 25.2 L 58.0 27.6 M 56.8 24.4 L 60.4 26.8 M 59.4 23.8 L 62.6 25.9"
                    stroke="#F4F1EA"
                    strokeOpacity="0.45"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  {/* 2 Brillos curvos blancos nítidos (cero ojos) */}
                  <path
                    d="M 55.2 18.2 Q 59.8 14.2 65.4 15.0"
                    stroke="#F4F1EA"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 54.2 21.4 Q 55.5 23.2 57.6 24.2"
                    stroke="#F4F1EA"
                    strokeWidth="1.0"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Bisagra circular mecánica lateral */}
                  <circle
                    cx="49.5"
                    cy="25.8"
                    r="4.2"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.6"
                  />
                  <circle cx="49.5" cy="25.8" r="1.9" fill="#09090B" />
                  <path
                    d="M 47.6 25.8 L 51.4 25.8"
                    stroke="#F4F1EA"
                    strokeWidth="0.8"
                  />
                </g>

                {/* Brazo principal articulado + guante sombreado palma abierta */}
                <g ref={upperArmRef}>
                  {/* Costura circular del hombro */}
                  <circle
                    cx="49"
                    cy="50"
                    r="6.2"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.6"
                  />
                  {/* Manga superior con pliegues en tinta */}
                  <path
                    d="M 44 50.5 C 42 57, 42 66, 43 74 L 52.5 74 C 53 66, 53.5 57, 54 50 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 43 52 L 46.5 52 L 46 73 L 43.4 73 Z"
                    fill="#09090B"
                  />
                  <path
                    d="M 46 57 L 52 55 M 46.5 63 L 52.5 61 M 46.5 69 L 51.5 68"
                    stroke="#09090B"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  <g ref={forearmRef}>
                    {/* Antebrazo articulado */}
                    <path
                      d="M 43 73 L 52.5 73 C 55 80, 56.5 87, 57 92 L 48 93 C 46 87, 44.5 80, 43 73 Z"
                      fill="#F4F1EA"
                      stroke="#09090B"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 43.8 74 L 47 74 L 50.5 92.2 L 48.4 92.4 Z"
                      fill="#09090B"
                    />
                    <path
                      d="M 48 80 L 54 78.5 M 49 85 L 55 83.5"
                      stroke="#09090B"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                    {/* Anillo de muñeca */}
                    <path
                      d="M 47.5 91.5 L 57.5 90.5 L 57.8 93.2 L 47.8 94.2 Z"
                      fill="#09090B"
                      stroke="#F4F1EA"
                      strokeWidth="1"
                    />

                    {/* Guante negro de tinta con palma abierta y dedos relajados colgando (+ halo #F4F1EA 1.2px) */}
                    <path
                      d="M 48.2 93.6 C 46.5 96.5, 46.2 100.5, 47.8 103.5 C 48.8 105.2, 50.6 104.2, 50.5 101.8 L 51.2 106.2 C 51.4 107.8, 53.2 107.8, 53.4 105.8 L 53.6 101.8 L 54.4 106.4 C 54.8 107.8, 56.4 107.4, 56.4 105.5 L 56.2 101.0 L 57.4 104.6 C 58.0 105.8, 59.4 105.2, 59.0 103.2 L 57.6 97.6 C 59.2 98.4, 60.8 97.4, 60.4 95.8 C 60.0 94.4, 58.2 93.4, 57.0 92.8 Z"
                      fill="#09090B"
                      stroke="#F4F1EA"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    {/* Trazos finos de pliegue en palma abierta del guante */}
                    <path
                      d="M 50.8 97.2 Q 53.6 96.4 55.8 97.8 M 51.8 99.6 L 55.2 99.6"
                      stroke="#F4F1EA"
                      strokeOpacity="0.65"
                      strokeWidth="0.85"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </g>
                </g>
              </g>
            </svg>

            {/* Etiqueta limpia en Satoshi */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -4, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -4, scale: 0.92 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="pointer-events-none absolute left-full ml-1.5 top-2 whitespace-nowrap border border-[#F4F1EA]/45 bg-[#050505] px-2 py-0.5 font-sans font-medium tabular-nums text-[10px] tracking-[0.12em] text-[#F4F1EA]"
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
