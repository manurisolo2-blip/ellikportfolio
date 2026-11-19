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

interface StarSparkState {
  active: boolean;
  life: number;
  maxLife: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  scale: number;
}

const STAR_SPARK_COUNT = 3;

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
  const visorGlintRef = useRef<SVGGElement | null>(null);
  const clickOrbitalGroupRef = useRef<SVGGElement | null>(null);

  const cordLeftRef = useRef<SVGPathElement | null>(null);
  const cordLeftInnerRef = useRef<SVGPathElement | null>(null);
  const cordLeftAgletRef = useRef<SVGCircleElement | null>(null);
  const cordRightRef = useRef<SVGPathElement | null>(null);
  const cordRightInnerRef = useRef<SVGPathElement | null>(null);
  const cordRightAgletRef = useRef<SVGCircleElement | null>(null);

  const backUpperArmRef = useRef<SVGGElement | null>(null);
  const backForearmRef = useRef<SVGGElement | null>(null);
  const frontUpperArmRef = useRef<SVGGElement | null>(null);
  const frontForearmRef = useRef<SVGGElement | null>(null);
  const relaxedHandRef = useRef<SVGGElement | null>(null);
  const peaceHandRef = useRef<SVGGElement | null>(null);

  const backThighRef = useRef<SVGGElement | null>(null);
  const backShinRef = useRef<SVGGElement | null>(null);
  const frontThighRef = useRef<SVGGElement | null>(null);
  const frontShinRef = useRef<SVGGElement | null>(null);

  const thrusterGroupRef = useRef<SVGGElement | null>(null);
  const plumeOuterRef = useRef<SVGPathElement | null>(null);
  const plumeInnerRef = useRef<SVGPathElement | null>(null);
  const starSparkRefs = useRef<Array<SVGPathElement | null>>([]);

  const trackHeightRef = useRef<number>(520);
  const hoveredRef = useRef<boolean>(false);
  const hoverEnterTimeRef = useRef<number>(-10);

  // Estado cinemático mutable suavizado por dt exponencial
  const kinRef = useRef({
    smoothVel: 0,
    rootTilt: -10,
    headTilt: 4,
    hoverBlend: 0,
    backShoulder: 0,
    backElbow: 0,
    frontShoulder: 0,
    frontElbow: 0,
    backHip: 0,
    backKnee: 0,
    frontHip: 0,
    frontKnee: 0,
    cordLift: 0,
    thrusterAlpha: 0,
    thrusterAngle: 120,
    lightBlend: 0,
  });

  // Giro limpio de 360° en clic + destello orbital del casco
  const spinActiveRef = useRef<boolean>(false);
  const spinStartTimeRef = useRef<number>(-10);
  const orbitalBurstTimeRef = useRef<number>(-10);

  // Cache liviana de #servicios (#F4F1EA) para adaptar cable umbilical
  const serviciosCacheRef = useRef<{
    el: HTMLElement | null;
    lastCheck: number;
    overLight: boolean;
  }>({
    el: null,
    lastCheck: 0,
    overLight: false,
  });

  // 3 micro-destellos en forma de rombo/estrella
  const sparksRef = useRef<StarSparkState[]>(
    Array.from({ length: STAR_SPARK_COUNT }, () => ({
      active: false,
      life: 0,
      maxLife: 0.45,
      x: 22,
      y: 55,
      vx: 0,
      vy: 0,
      rot: 0,
      scale: 1,
    }))
  );
  const sparkSpawnAccRef = useRef<number>(0);

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
    Math.max(trackHeight - 104, 1),
  ]);

  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);

  useEffect(() => {
    hoveredRef.current = isHovered;
    if (isHovered) {
      hoverEnterTimeRef.current = performance.now() * 0.001;
    }
  }, [isHovered]);

  // Altura del carril para cálculo del cable Bézier
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
    spinStartTimeRef.current = performance.now() * 0.001;
    orbitalBurstTimeRef.current = spinStartTimeRef.current;
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

    const travel = Math.max(trackHeightRef.current - 104, 1);
    const currentAstroY = clamp(smoothProgress.get(), 0, 1) * travel;

    // 1. Flotación Lo-Fi en gravedad cero (y ±5px suave)
    const fx = Math.sin(t * 1.05) * 2.8;
    const fy = Math.cos(t * 1.35) * 5.0;
    floatX.set(fx);
    floatY.set(fy);

    // 2. Giro limpio de 360° con ease-out sedoso al hacer clic
    let spinDeg = 0;
    if (spinActiveRef.current) {
      const elapsedSpin = nowSec - spinStartTimeRef.current;
      const spinDuration = 0.92;
      if (elapsedSpin >= spinDuration) {
        spinActiveRef.current = false;
        spinDeg = 0;
      } else {
        const p = clamp(elapsedSpin / spinDuration, 0, 1);
        const easedOut = 1 - Math.pow(1 - p, 3);
        spinDeg = 360 * easedOut;
      }
    }

    // 3. Inclinación del torso y cabeza (recostado -10deg ±4deg en reposo, drop abajo, boost arriba)
    const idleTilt = -10 + Math.sin(t * 1.1) * 4.0;
    const dropTilt = 16 + downStrength * 7;
    const boostTilt = -3 - upStrength * 4;
    const targetRootTilt =
      idleTilt * (1 - scrollStrength) +
      dropTilt * downStrength +
      boostTilt * upStrength;
    k.rootTilt += (targetRootTilt - k.rootTilt) * ease(8.5);

    const hoverAge = nowSec - hoverEnterTimeRef.current;
    const hoverNod =
      hoveredRef.current && hoverAge >= 0 && hoverAge < 0.45
        ? Math.sin((hoverAge / 0.45) * Math.PI) * 6.5
        : 0;
    const idleHeadTilt = 3.5 + Math.sin(t * 1.1 - 0.55) * 4.5;
    const dropHeadTilt = 9 + downStrength * 5;
    const boostHeadTilt = -12 - upStrength * 5;
    const targetHeadTilt =
      idleHeadTilt * (1 - scrollStrength) +
      dropHeadTilt * downStrength +
      boostHeadTilt * upStrength +
      hoverNod;
    k.headTilt += (targetHeadTilt - k.headTilt) * ease(7.0);

    k.hoverBlend += ((hoveredRef.current ? 1 : 0) - k.hoverBlend) * ease(8.5);

    const totalRootRot = k.rootTilt + spinDeg;
    if (rigRootRef.current) {
      rigRootRef.current.setAttribute(
        "transform",
        `rotate(${totalRootRot.toFixed(2)} 42 50)`
      );
    }

    if (torsoRef.current) {
      const torsoBreath = Math.sin(t * 1.45) * 0.7;
      torsoRef.current.setAttribute(
        "transform",
        `translate(0 ${torsoBreath.toFixed(2)})`
      );
    }

    if (headRef.current) {
      headRef.current.setAttribute(
        "transform",
        `rotate(${k.headTilt.toFixed(2)} 42 31)`
      );
    }

    // 4. Destello plateado deslizante en el visor (barrido cada 4s + reacción a velocidad)
    if (visorGlintRef.current) {
      const cycle = (t % 4.0) / 4.0;
      let sweepX = -18;
      if (cycle < 0.36) {
        const s = cycle / 0.36;
        const smoothS = s * s * (3 - 2 * s);
        sweepX = -16 + smoothS * 38;
      } else {
        sweepX = 24;
      }
      const velShift = clamp(k.smoothVel * 14, -6, 6);
      visorGlintRef.current.setAttribute(
        "transform",
        `translate(${(sweepX + velShift).toFixed(2)} 0)`
      );
    }

    // 5. Destello orbital fino alrededor del casco al hacer clic
    if (clickOrbitalGroupRef.current) {
      const burstAge = nowSec - orbitalBurstTimeRef.current;
      const burstDuration = 0.72;
      if (burstAge >= 0 && burstAge < burstDuration) {
        const bp = burstAge / burstDuration;
        const bEase = 1 - Math.pow(1 - bp, 2);
        const s = 0.85 + bEase * 0.38;
        const rot = -18 + bEase * 42;
        const op = (1 - bp) * 0.92;
        clickOrbitalGroupRef.current.setAttribute("opacity", op.toFixed(2));
        clickOrbitalGroupRef.current.setAttribute(
          "transform",
          `translate(43 18.5) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)}) translate(-43 -18.5)`
        );
      } else {
        clickOrbitalGroupRef.current.setAttribute("opacity", "0");
      }
    }

    // 6. Cordones sueltos del hoodie con follow-through y flotación hacia arriba al caer
    const targetCordLift = downStrength * 11 - upStrength * 4;
    k.cordLift += (targetCordLift - k.cordLift) * ease(7.5);

    const swayL = Math.sin(t * 1.9 - 1.1) * (2.6 + scrollStrength * 2.0);
    const swayR = Math.cos(t * 1.75 - 1.35) * (2.6 + scrollStrength * 2.0);
    const lTipX = 44.5 + swayL - downStrength * 2.5;
    const lTipY = 47.0 - k.cordLift + Math.cos(t * 1.9 - 1.1) * 1.4;
    const rTipX = 49.5 + swayR - downStrength * 2.0;
    const rTipY = 46.2 - k.cordLift * 0.95 + Math.sin(t * 1.75 - 1.35) * 1.4;

    const dLeft = `M 45.2 36.0 Q ${(44.2 + swayL * 0.55).toFixed(1)} ${(
      41.8 -
      k.cordLift * 0.45
    ).toFixed(1)} ${lTipX.toFixed(1)} ${lTipY.toFixed(1)}`;
    const dRight = `M 48.8 36.0 Q ${(49.4 + swayR * 0.55).toFixed(1)} ${(
      41.2 -
      k.cordLift * 0.45
    ).toFixed(1)} ${rTipX.toFixed(1)} ${rTipY.toFixed(1)}`;

    if (cordLeftRef.current && cordLeftInnerRef.current && cordLeftAgletRef.current) {
      cordLeftRef.current.setAttribute("d", dLeft);
      cordLeftInnerRef.current.setAttribute("d", dLeft);
      cordLeftAgletRef.current.setAttribute("cx", lTipX.toFixed(1));
      cordLeftAgletRef.current.setAttribute("cy", lTipY.toFixed(1));
    }
    if (cordRightRef.current && cordRightInnerRef.current && cordRightAgletRef.current) {
      cordRightRef.current.setAttribute("d", dRight);
      cordRightInnerRef.current.setAttribute("d", dRight);
      cordRightAgletRef.current.setAttribute("cx", rTipX.toFixed(1));
      cordRightAgletRef.current.setAttribute("cy", rTipY.toFixed(1));
    }

    // 7. Brazos con follow-through (retraso de fase -0.8) + saludo chill en hover
    const armWave = Math.sin(t * 1.5 - 0.8);
    const armWave2 = Math.cos(t * 1.5 - 0.8);

    const targetBackShoulder =
      lerp(armWave * 8, -24, downStrength) + upStrength * 10;
    const targetBackElbow =
      lerp(armWave2 * 10 - 6, -16, downStrength) + upStrength * 8;

    const baseFrontShoulder =
      lerp(Math.sin(t * 1.5 - 1.1) * 7, -18, downStrength) + upStrength * 8;
    const baseFrontElbow =
      lerp(Math.sin(t * 1.5 - 1.85) * 9 + 4, -12, downStrength) +
      upStrength * 6;

    const hoverShoulder = -56 + Math.sin(t * 2.8) * 4;
    const hoverElbow = -32 + Math.sin(t * 3.6 - 0.6) * 7;

    const targetFrontShoulder = lerp(
      baseFrontShoulder,
      hoverShoulder,
      k.hoverBlend
    );
    const targetFrontElbow = lerp(baseFrontElbow, hoverElbow, k.hoverBlend);

    k.backShoulder += (targetBackShoulder - k.backShoulder) * ease(8.5);
    k.backElbow += (targetBackElbow - k.backElbow) * ease(8.5);
    k.frontShoulder += (targetFrontShoulder - k.frontShoulder) * ease(9.0);
    k.frontElbow += (targetFrontElbow - k.frontElbow) * ease(9.0);

    if (backUpperArmRef.current) {
      backUpperArmRef.current.setAttribute(
        "transform",
        `rotate(${k.backShoulder.toFixed(2)} 28 38)`
      );
    }
    if (backForearmRef.current) {
      backForearmRef.current.setAttribute(
        "transform",
        `rotate(${k.backElbow.toFixed(2)} 21 46.5)`
      );
    }
    if (frontUpperArmRef.current) {
      frontUpperArmRef.current.setAttribute(
        "transform",
        `rotate(${k.frontShoulder.toFixed(2)} 35.5 39.5)`
      );
    }
    if (frontForearmRef.current) {
      frontForearmRef.current.setAttribute(
        "transform",
        `rotate(${k.frontElbow.toFixed(2)} 38.5 50.2)`
      );
    }
    if (relaxedHandRef.current && peaceHandRef.current) {
      relaxedHandRef.current.setAttribute(
        "opacity",
        clamp(1 - k.hoverBlend * 1.4, 0, 1).toFixed(2)
      );
      peaceHandRef.current.setAttribute(
        "opacity",
        clamp((k.hoverBlend - 0.18) * 1.35, 0, 1).toFixed(2)
      );
    }

    // 8. Piernas asimétricas en contrafase con follow-through en rodillas
    const legPhase = t * 1.35;
    const idleFrontHip = Math.sin(legPhase) * 6.0;
    const idleFrontKnee = Math.sin(legPhase - 0.75) * 8.0;
    const idleBackHip = Math.sin(legPhase + Math.PI) * 6.5;
    const idleBackKnee = Math.sin(legPhase + Math.PI - 0.75) * 8.5;

    const targetFrontHip =
      idleFrontHip * (1 - scrollStrength) +
      downStrength * 16 -
      upStrength * 14;
    const targetFrontKnee =
      idleFrontKnee * (1 - scrollStrength) +
      downStrength * 18 -
      upStrength * 8;
    const targetBackHip =
      idleBackHip * (1 - scrollStrength) +
      downStrength * 22 -
      upStrength * 6;
    const targetBackKnee =
      idleBackKnee * (1 - scrollStrength) +
      downStrength * 20 +
      upStrength * 10;

    k.frontHip += (targetFrontHip - k.frontHip) * ease(9.0);
    k.frontKnee += (targetFrontKnee - k.frontKnee) * ease(9.0);
    k.backHip += (targetBackHip - k.backHip) * ease(9.0);
    k.backKnee += (targetBackKnee - k.backKnee) * ease(9.0);

    if (frontThighRef.current) {
      frontThighRef.current.setAttribute(
        "transform",
        `rotate(${k.frontHip.toFixed(2)} 45 58)`
      );
    }
    if (frontShinRef.current) {
      frontShinRef.current.setAttribute(
        "transform",
        `rotate(${k.frontKnee.toFixed(2)} 58.5 58.5)`
      );
    }
    if (backThighRef.current) {
      backThighRef.current.setAttribute(
        "transform",
        `rotate(${k.backHip.toFixed(2)} 34 58)`
      );
    }
    if (backShinRef.current) {
      backShinRef.current.setAttribute(
        "transform",
        `rotate(${k.backKnee.toFixed(2)} 30.5 75)`
      );
    }

    // 9. Chorro afilado estilizado + 3 micro-destellos en forma de rombo/estrella
    const isThrusting = absVel > 0.04;
    const targetThrusterAlpha = isThrusting ? clamp(scrollStrength * 1.15, 0.35, 1) : 0;
    k.thrusterAlpha += (targetThrusterAlpha - k.thrusterAlpha) * ease(11);

    const targetThrusterAngle =
      downStrength >= upStrength ? 124 : 12; // Drop: arriba-atrás; Boost: abajo
    k.thrusterAngle += (targetThrusterAngle - k.thrusterAngle) * ease(12);

    if (thrusterGroupRef.current && plumeOuterRef.current && plumeInnerRef.current) {
      if (k.thrusterAlpha > 0.02) {
        const flicker = 0.88 + 0.12 * Math.sin(t * 28);
        const lenScale = (0.55 + scrollStrength * 0.65) * flicker;
        thrusterGroupRef.current.setAttribute("opacity", k.thrusterAlpha.toFixed(2));
        thrusterGroupRef.current.setAttribute(
          "transform",
          `translate(22 54.5) rotate(${k.thrusterAngle.toFixed(1)}) scale(1 ${lenScale.toFixed(
            2
          )}) translate(-22 -54.5)`
        );
      } else {
        thrusterGroupRef.current.setAttribute("opacity", "0");
      }
    }

    const sparks = sparksRef.current;
    if (isThrusting) {
      sparkSpawnAccRef.current += dt * (4.5 + scrollStrength * 5.0);
      if (sparkSpawnAccRef.current >= 1) {
        sparkSpawnAccRef.current = 0;
        const slot = sparks.find((s) => !s.active);
        if (slot) {
          slot.active = true;
          slot.life = 0;
          slot.maxLife = 0.42 + Math.random() * 0.2;
          slot.x = 22 + (Math.random() - 0.5) * 4;
          slot.y = 54.5;
          const isDrop = downStrength >= upStrength;
          slot.vx = isDrop ? -24 - Math.random() * 14 : -10 - Math.random() * 8;
          slot.vy = isDrop ? -20 - Math.random() * 14 : 24 + Math.random() * 14;
          slot.rot = Math.random() * 45;
          slot.scale = 0.75 + Math.random() * 0.5;
        }
      }
    } else {
      sparkSpawnAccRef.current = 0;
    }

    for (let i = 0; i < STAR_SPARK_COUNT; i++) {
      const sp = sparks[i];
      const el = starSparkRefs.current[i];
      if (!el) continue;

      if (!sp.active) {
        el.setAttribute("opacity", "0");
        continue;
      }

      sp.life += dt;
      if (sp.life >= sp.maxLife) {
        sp.active = false;
        el.setAttribute("opacity", "0");
        continue;
      }

      const progress = sp.life / sp.maxLife;
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      const sc = sp.scale * (1 - progress * 0.65);
      const op = (1 - progress) * 0.9;

      el.setAttribute(
        "transform",
        `translate(${sp.x.toFixed(1)} ${sp.y.toFixed(1)}) rotate(${sp.rot.toFixed(
          0
        )}) scale(${sc.toFixed(2)})`
      );
      el.setAttribute("opacity", op.toFixed(2));
    }

    // 10. Cable umbilical ultrafino (1.2px) + adaptación suave sobre #servicios (#F4F1EA)
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
        const astroViewportY = tRect.top + currentAstroY + 52;
        cache.overLight =
          astroViewportY >= sRect.top && astroViewportY <= sRect.bottom;
      } else {
        cache.overLight = false;
      }
    }

    k.lightBlend += ((cache.overLight ? 1 : 0) - k.lightBlend) * ease(9);

    const cableEl = cablePathRef.current;
    const anchorEl = cableAnchorRef.current;
    if (cableEl && anchorEl) {
      const anchorX = 42;
      // Rotar puerto exacto de la mochila (18.5, 34) alrededor del pivote (42, 50)
      const rad = (totalRootRot * Math.PI) / 180;
      const dx = 18.5 - 42;
      const dy = 34 - 50;
      const portX = 42 + dx * Math.cos(rad) - dy * Math.sin(rad);
      const portY = 50 + dx * Math.sin(rad) + dy * Math.cos(rad);

      const endX = 6 + portX + fx;
      const endY = Math.max(10, currentAstroY + portY + fy);

      const slackFactor = 1 - upStrength * 0.45;
      const wave1 = (Math.sin(t * 1.55) * 12 + Math.cos(t * 0.95) * 4) * slackFactor;
      const wave2 = Math.cos(t * 1.35 - 0.8) * 11 * slackFactor;
      const velWhip = clamp(k.smoothVel * 48, -30, 30);

      const c1x = clamp(anchorX + wave1 * 0.75 - velWhip * 0.45, 6, 86);
      const c1y = Math.max(12, endY * 0.34);
      const c2x = clamp(anchorX + wave2 + velWhip, 6, 86);
      const c2y = Math.max(24, endY * 0.72);

      cableEl.setAttribute(
        "d",
        `M ${anchorX},0 C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(
          1
        )},${c2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`
      );

      // Interpolar suavemente de #F4F1EA (fondo oscuro) a #18181B/50 (#servicios)
      const r = Math.round(lerp(244, 24, k.lightBlend));
      const g = Math.round(lerp(241, 24, k.lightBlend));
      const b = Math.round(lerp(234, 27, k.lightBlend));
      const a = lerp(0.54, 0.5, k.lightBlend).toFixed(2);
      const cableColor = `rgba(${r}, ${g}, ${b}, ${a})`;
      cableEl.setAttribute("stroke", cableColor);
      anchorEl.setAttribute("fill", cableColor);
      anchorEl.setAttribute("stroke", "#111114");
    }
  });

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 md:left-3 top-24 bottom-16 w-[96px] z-40 hidden sm:block select-none"
    >
      {/* Cable umbilical curvo elástico (1.2px) */}
      <svg
        width="96"
        height={trackHeight}
        viewBox={`0 0 96 ${trackHeight}`}
        fill="none"
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <circle
          ref={cableAnchorRef}
          cx="42"
          cy="1"
          r="2"
          fill="rgba(244, 241, 234, 0.54)"
          stroke="#111114"
          strokeWidth="1"
        />
        <path
          ref={cablePathRef}
          d="M 42,0 C 42,10 30,20 24.5,34"
          stroke="rgba(244, 241, 234, 0.54)"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Posición global GPU (spring vertical + flotación Lo-Fi) */}
      <motion.div
        style={{ y: astroY }}
        className="pointer-events-none absolute left-[6px] top-0 will-change-transform"
      >
        <motion.div
          style={{ x: floatX, y: floatY }}
          className="relative will-change-transform"
        >
          <button
            type="button"
            data-cursor="action"
            aria-label={`Astronauta streetwear en gravedad cero: ${scrollPct}% del recorrido`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            onClick={handleAstronautClick}
            className="pointer-events-auto relative flex h-[104px] w-[84px] items-center justify-center bg-transparent p-0 focus:outline-none"
          >
            <svg
              width="84"
              height="104"
              viewBox="0 0 84 104"
              fill="none"
              className="block overflow-visible"
            >
              <defs>
                {/* Visor oscuro espejado (#09090B -> #1E293B -> #050505) */}
                <linearGradient
                  id="ellik-street-visor-grad"
                  x1="38"
                  y1="10"
                  x2="57"
                  y2="27"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#09090B" />
                  <stop offset="48%" stopColor="#1E293B" />
                  <stop offset="100%" stopColor="#050505" />
                </linearGradient>

                {/* Destello plateado deslizante */}
                <linearGradient
                  id="ellik-visor-silver-glint"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="50%" stopColor="rgba(226,232,240,0.34)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>

                <clipPath id="ellik-street-visor-clip">
                  <path d="M 42.2 10.6 C 48.2 10.4, 54.4 12.0, 56.2 16.8 C 57.0 19.2, 56.2 23.6, 52.6 25.5 C 48.2 27.6, 41.2 26.8, 39.2 22.8 C 37.6 19.6, 38.0 13.4, 42.2 10.6 Z" />
                </clipPath>
              </defs>

              {/* Micro-destellos en forma de rombo/estrella del propulsor */}
              <g>
                {Array.from({ length: STAR_SPARK_COUNT }, (_, idx) => (
                  <path
                    key={idx}
                    ref={(el) => {
                      starSparkRefs.current[idx] = el;
                    }}
                    d="M 0 -3.4 L 0.9 -0.9 L 3.4 0 L 0.9 0.9 L 0 3.4 L -0.9 0.9 L -3.4 0 L -0.9 -0.9 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="0.6"
                    opacity="0"
                  />
                ))}
              </g>

              {/* Esqueleto articulado 3/4 asimétrico (Zero-G Chill) */}
              <g ref={rigRootRef}>
                {/* 1. Chorro fino estilizado de propulsión (detrás de la mochila) */}
                <g ref={thrusterGroupRef} opacity="0">
                  <path
                    ref={plumeOuterRef}
                    d="M 19.6 54.5 L 22.0 74.0 L 24.4 54.5 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                  <path
                    ref={plumeInnerRef}
                    d="M 20.9 54.5 L 22.0 67.5 L 23.1 54.5 Z"
                    fill="#FFFFFF"
                  />
                </g>

                {/* 2. Mochila propulsora compacta y angulosa (grafito #27272A) */}
                <g>
                  <path
                    d="M 19.5 32.0 L 28.5 32.0 L 28.5 52.0 L 18.0 52.0 L 16.0 48.5 L 16.0 35.8 Z"
                    fill="#27272A"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Faceta de sombra */}
                  <path
                    d="M 16.6 36.2 L 21.0 36.2 L 21.0 51.3 L 18.4 51.3 L 16.6 48.3 Z"
                    fill="#18181B"
                  />
                  {/* Rejilla / detalle técnico metálico */}
                  <rect
                    x="22.4"
                    y="36.2"
                    width="3.6"
                    height="9.0"
                    rx="0.8"
                    fill="#3F3F46"
                    stroke="#111114"
                    strokeWidth="0.9"
                  />
                  {/* Puerto umbilical en (18.5, 34) */}
                  <circle
                    cx="18.5"
                    cy="34.0"
                    r="1.7"
                    fill="#E4E4E7"
                    stroke="#111114"
                    strokeWidth="1.1"
                  />
                  {/* Toberas metálicas inferiores */}
                  <path
                    d="M 18.6 52.0 L 25.4 52.0 L 26.2 54.8 L 17.8 54.8 Z"
                    fill="#52525B"
                    stroke="#111114"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </g>

                {/* 3. Brazo trasero descansando relajado hacia atrás/arriba */}
                <g ref={backUpperArmRef}>
                  <path
                    d="M 28.5 35.5 C 24.2 37.2, 20.6 41.2, 19.2 45.6 C 18.8 47.4, 21.8 49.0, 23.6 47.6 C 25.8 45.4, 28.2 42.0, 30.6 39.2 Z"
                    fill="#CFCAC0"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <g ref={backForearmRef}>
                    <path
                      d="M 19.8 45.2 C 16.8 48.6, 14.8 52.4, 15.0 55.0 C 15.4 57.4, 18.6 57.8, 20.4 56.0 C 21.8 54.2, 22.8 50.2, 23.4 47.0 Z"
                      fill="#CFCAC0"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Puño oscuro */}
                    <path
                      d="M 15.2 52.6 L 20.8 53.2 L 20.2 55.4 L 14.8 54.8 Z"
                      fill="#27272A"
                      stroke="#111114"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    {/* Guante relajado */}
                    <path
                      d="M 14.8 54.6 C 14.4 57.6, 16.6 59.8, 19.2 59.0 C 21.0 58.4, 21.4 55.6, 20.0 54.4 Z"
                      fill="#18181B"
                      stroke="#111114"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>

                {/* 4. Pierna trasera extendida hacia abajo (Cargo #18181B + Bota chunky #F4F1EA) */}
                <g ref={backThighRef}>
                  <path
                    d="M 29.0 56.5 L 40.8 56.5 L 36.2 75.5 C 34.0 76.4, 26.2 76.2, 25.8 74.4 Z"
                    fill="#18181B"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Sombra cargo trasera */}
                  <path
                    d="M 29.6 57.4 L 33.4 57.4 L 29.6 74.6 L 26.8 74.2 Z"
                    fill="#09090B"
                  />
                  {/* Costura cargo sutil */}
                  <path
                    d="M 35.4 58.5 L 32.0 73.8"
                    stroke="#3F3F46"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />

                  <g ref={backShinRef}>
                    <path
                      d="M 25.8 74.2 L 35.8 74.2 L 34.4 89.2 L 24.8 89.2 Z"
                      fill="#18181B"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 30.8 75.5 L 30.0 87.8"
                      stroke="#3F3F46"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                    {/* Bota / zapatilla chunky trasera */}
                    <path
                      d="M 25.0 88.2 L 34.0 88.2 L 35.6 92.2 C 37.8 92.6, 39.4 93.8, 39.4 95.6 L 24.4 95.6 Z"
                      fill="#F4F1EA"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 25.8 89.0 L 29.8 89.0 L 29.2 94.8 L 25.4 94.8 Z"
                      fill="#CFCAC0"
                    />
                    {/* Suela gruesa marcada #09090B */}
                    <path
                      d="M 23.8 95.0 L 39.8 95.0 C 40.4 95.0, 40.4 98.4, 39.0 98.4 L 24.2 98.4 C 23.4 98.4, 23.2 96.2, 23.8 95.0 Z"
                      fill="#09090B"
                      stroke="#111114"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 26.2 96.8 L 37.6 96.8"
                      stroke="#3F3F46"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* 5. Pierna delantera flexionada arriba (muslo elevado + rodilla doblada relajada) */}
                <g ref={frontThighRef}>
                  <path
                    d="M 41.2 55.0 C 48.6 52.8, 56.0 52.6, 61.2 54.6 C 62.8 55.2, 62.4 62.0, 59.4 62.8 C 52.6 64.2, 44.5 63.8, 40.0 61.5 Z"
                    fill="#18181B"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Bolsillo lateral tipo cargo + costura */}
                  <path
                    d="M 47.0 55.8 L 54.8 55.6 L 54.4 61.2 L 46.8 61.4 Z"
                    fill="#27272A"
                    stroke="#3F3F46"
                    strokeWidth="0.9"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="47.2"
                    y1="57.4"
                    x2="54.6"
                    y2="57.2"
                    stroke="#3F3F46"
                    strokeWidth="0.9"
                  />

                  <g ref={frontShinRef}>
                    <path
                      d="M 54.4 57.5 L 62.6 58.2 L 59.6 74.8 L 50.8 74.0 Z"
                      fill="#18181B"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 57.4 59.5 L 55.2 73.0"
                      stroke="#3F3F46"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                    />
                    {/* Bota / zapatilla chunky delantera */}
                    <path
                      d="M 51.4 73.8 L 59.4 74.2 L 61.6 77.8 C 64.0 78.2, 65.6 79.4, 65.6 81.2 L 50.6 80.8 Z"
                      fill="#F4F1EA"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 52.0 74.6 L 55.8 74.8 L 55.0 80.0 L 51.4 80.0 Z"
                      fill="#CFCAC0"
                    />
                    {/* Suela gruesa #09090B */}
                    <path
                      d="M 50.0 80.4 L 66.0 80.8 C 66.6 80.8, 66.6 83.8, 65.2 83.8 L 50.2 83.4 C 49.4 83.4, 49.4 81.4, 50.0 80.4 Z"
                      fill="#09090B"
                      stroke="#111114"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 52.2 82.1 L 64.0 82.4"
                      stroke="#3F3F46"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                  </g>
                </g>

                {/* 6. Torso: Campera Puffer / Hoodie Oversize (#F4F1EA + #CFCAC0 + cordones cero-G) */}
                <g ref={torsoRef}>
                  <path
                    d="M 31.2 31.6 C 35.8 29.8, 46.2 29.8, 50.8 31.6 C 53.8 33.4, 55.2 37.6, 54.6 43.2 L 53.6 56.4 C 53.4 58.8, 49.0 60.2, 41.8 60.2 C 34.4 60.2, 28.4 58.6, 28.2 56.2 L 27.6 41.4 C 27.4 36.2, 29.0 32.8, 31.2 31.6 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  {/* Sombra dura cel-shaded */}
                  <path
                    d="M 28.4 38.4 L 35.2 38.4 L 35.8 59.2 C 32.0 58.9, 29.1 57.6, 29.0 55.8 Z"
                    fill="#CFCAC0"
                  />
                  {/* Costuras horizontales acolchadas de puffer */}
                  <path
                    d="M 28.8 44.2 Q 41.5 46.2 53.8 43.8"
                    stroke="#CFCAC0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 28.9 51.8 Q 41.5 53.6 53.2 51.4"
                    stroke="#CFCAC0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Línea de cierre frontal 3/4 */}
                  <path
                    d="M 47.0 36.0 L 46.4 59.4"
                    stroke="#27272A"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  {/* Dobladillo inferior ajustado oscuro */}
                  <path
                    d="M 28.5 56.6 Q 41.0 58.8 53.3 56.6"
                    stroke="#111114"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Cuello alto acolchado */}
                  <path
                    d="M 33.4 31.4 C 37.0 28.6, 47.2 28.6, 50.8 31.4 C 51.8 33.8, 49.8 36.5, 42.6 36.8 C 35.2 36.5, 32.6 33.8, 33.4 31.4 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 34.4 33.0 C 37.4 35.4, 46.8 35.4, 49.8 33.0"
                    stroke="#CFCAC0"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Dos cordones sueltos del hoodie con física cero-G */}
                  <path
                    ref={cordLeftRef}
                    d="M 45.2 36.0 Q 44.2 41.8 44.5 47.0"
                    stroke="#111114"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    ref={cordLeftInnerRef}
                    d="M 45.2 36.0 Q 44.2 41.8 44.5 47.0"
                    stroke="#E4E4E7"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle
                    ref={cordLeftAgletRef}
                    cx="44.5"
                    cy="47.0"
                    r="1.15"
                    fill="#27272A"
                    stroke="#111114"
                    strokeWidth="0.7"
                  />

                  <path
                    ref={cordRightRef}
                    d="M 48.8 36.0 Q 49.4 41.2 49.5 46.2"
                    stroke="#111114"
                    strokeWidth="2.0"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    ref={cordRightInnerRef}
                    d="M 48.8 36.0 Q 49.4 41.2 49.5 46.2"
                    stroke="#E4E4E7"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle
                    ref={cordRightAgletRef}
                    cx="49.5"
                    cy="46.2"
                    r="1.15"
                    fill="#27272A"
                    stroke="#111114"
                    strokeWidth="0.7"
                  />
                </g>

                {/* 7. Cabeza 3/4: Casco cromado + Visor oscuro espejado + Auriculares */}
                <g ref={headRef}>
                  {/* Destello orbital al hacer clic */}
                  <g ref={clickOrbitalGroupRef} opacity="0">
                    <ellipse
                      cx="43"
                      cy="18.5"
                      rx="21.5"
                      ry="7.0"
                      transform="rotate(-18 43 18.5)"
                      stroke="#F4F1EA"
                      strokeWidth="1.05"
                      fill="none"
                    />
                    <path
                      d="M 22.8 23.8 L 23.4 25.4 L 25.0 26.0 L 23.4 26.6 L 22.8 28.2 L 22.2 26.6 L 20.6 26.0 L 22.2 25.4 Z"
                      fill="#FFFFFF"
                    />
                    <path
                      d="M 62.5 9.2 L 63.0 10.6 L 64.4 11.1 L 63.0 11.6 L 62.5 13.0 L 62.0 11.6 L 60.6 11.1 L 62.0 10.6 Z"
                      fill="#FFFFFF"
                    />
                  </g>

                  {/* Casco 3/4 levemente inclinado hacia adelante */}
                  <path
                    d="M 31.5 18.5 C 31.5 9.5, 38.5 5.5, 45.5 6.2 C 52.8 6.9, 57.2 12.2, 56.8 19.5 C 56.5 26.2, 51.5 30.2, 43.8 30.2 C 35.8 30.2, 31.5 25.5, 31.5 18.5 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />

                  {/* Sombra cel-shaded trasera e inferior del casco */}
                  <path
                    d="M 32.3 18.5 C 32.3 24.8, 36.2 29.4, 43.8 29.4 C 46.8 29.4, 49.4 28.6, 51.2 27.3 C 45.2 28.2, 38.8 25.4, 36.2 20.5 C 34.4 17.1, 34.8 13.0, 37.2 9.4 C 33.8 11.4, 32.3 14.8, 32.3 18.5 Z"
                    fill="#CFCAC0"
                  />

                  {/* Visor oscuro espejado (perfil 3/4, cero ojos infantiles) */}
                  <path
                    d="M 42.2 10.6 C 48.2 10.4, 54.4 12.0, 56.2 16.8 C 57.0 19.2, 56.2 23.6, 52.6 25.5 C 48.2 27.6, 41.2 26.8, 39.2 22.8 C 37.6 19.6, 38.0 13.4, 42.2 10.6 Z"
                    fill="url(#ellik-street-visor-grad)"
                  />

                  {/* Reflejos recortados dentro del visor */}
                  <g clipPath="url(#ellik-street-visor-clip)">
                    {/* Destello plateado deslizante */}
                    <g ref={visorGlintRef}>
                      <rect
                        x="38"
                        y="6"
                        width="8"
                        height="26"
                        transform="rotate(-26 42 19)"
                        fill="url(#ellik-visor-silver-glint)"
                      />
                    </g>

                    {/* Dos líneas filosas de reflejo diagonal en blanco puro */}
                    <path
                      d="M 41.2 16.8 L 47.4 11.4"
                      stroke="#FFFFFF"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      opacity="0.96"
                    />
                    <path
                      d="M 44.2 18.8 L 49.2 14.4"
                      stroke="#FFFFFF"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      opacity="0.72"
                    />
                  </g>

                  {/* Borde nítido del visor */}
                  <path
                    d="M 42.2 10.6 C 48.2 10.4, 54.4 12.0, 56.2 16.8 C 57.0 19.2, 56.2 23.6, 52.6 25.5 C 48.2 27.6, 41.2 26.8, 39.2 22.8 C 37.6 19.6, 38.0 13.4, 42.2 10.6 Z"
                    stroke="#111114"
                    strokeWidth="1.5"
                    fill="none"
                  />

                  {/* Auriculares minimalistas con detalle cromado */}
                  <path
                    d="M 32.8 16.2 C 33.4 8.8, 38.8 5.2, 44.6 5.2"
                    stroke="#18181B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <rect
                    x="29.4"
                    y="14.2"
                    width="6.0"
                    height="9.4"
                    rx="2.6"
                    fill="#27272A"
                    stroke="#111114"
                    strokeWidth="1.4"
                  />
                  <rect
                    x="30.9"
                    y="16.2"
                    width="2.6"
                    height="5.4"
                    rx="1.3"
                    fill="#E4E4E7"
                    stroke="#111114"
                    strokeWidth="0.7"
                  />
                </g>

                {/* 8. Brazo delantero (manga puffer suelta + mano relajada / gesto chill peace en hover) */}
                <g ref={frontUpperArmRef}>
                  <path
                    d="M 32.0 37.5 C 35.8 36.8, 39.2 39.0, 40.8 45.2 L 41.8 50.2 C 41.2 52.0, 36.4 52.4, 34.8 50.6 L 32.2 44.2 C 31.0 41.2, 30.8 38.5, 32.0 37.5 Z"
                    fill="#F4F1EA"
                    stroke="#111114"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 32.8 39.0 L 35.2 49.4 L 38.2 50.4 L 35.0 43.2 Z"
                    fill="#CFCAC0"
                  />

                  <g ref={frontForearmRef}>
                    <path
                      d="M 35.5 49.0 C 39.5 48.0, 44.5 49.5, 49.0 51.4 L 48.2 55.8 C 43.2 55.2, 38.2 54.4, 34.8 52.0 Z"
                      fill="#F4F1EA"
                      stroke="#111114"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    {/* Puño acanalado */}
                    <path
                      d="M 47.4 51.0 L 50.2 51.6 L 49.4 56.0 L 46.6 55.6 Z"
                      fill="#27272A"
                      stroke="#111114"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />

                    {/* Estado normal: mano relajada */}
                    <g ref={relaxedHandRef} opacity="1">
                      <path
                        d="M 49.8 51.6 C 52.4 51.4, 54.8 52.8, 54.6 54.8 C 54.4 56.8, 51.6 57.2, 49.2 56.0 Z"
                        fill="#18181B"
                        stroke="#111114"
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                      />
                    </g>

                    {/* Estado hover: gesto chill / peace */}
                    <g ref={peaceHandRef} opacity="0">
                      <path
                        d="M 49.6 51.6 L 52.8 46.2 C 53.4 45.2, 54.8 45.8, 54.4 47.0 L 52.8 51.2 L 56.2 47.8 C 57.0 47.0, 58.2 48.0, 57.4 49.0 L 53.8 53.2 C 54.2 55.2, 52.4 56.8, 49.2 55.8 Z"
                        fill="#18181B"
                        stroke="#F4F1EA"
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M 49.6 51.6 L 52.8 46.2 C 53.4 45.2, 54.8 45.8, 54.4 47.0 L 52.8 51.2 L 56.2 47.8 C 57.0 47.0, 58.2 48.0, 57.4 49.0 L 53.8 53.2 C 54.2 55.2, 52.4 56.8, 49.2 55.8 Z"
                        fill="none"
                        stroke="#111114"
                        strokeWidth="1.35"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </svg>

            {/* Tag minimalista en Satoshi al hacer hover */}
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
