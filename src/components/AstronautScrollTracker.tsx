"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";

const CLICK_STAR_ANGLES = [0, 58, 122, 180, 238, 302] as const;
const ROPE_NODES = 8;

interface JointSpring {
  pos: number;
  vel: number;
}

interface RopeNode {
  x: number;
  y: number;
  ox: number;
  oy: number;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function createJoint(pos = 0): JointSpring {
  return { pos, vel: 0 };
}

function stepJoint(
  j: JointSpring,
  target: number,
  stiffness: number,
  damping: number,
  impulseAccel: number,
  minDeg: number,
  maxDeg: number,
  dt: number
): number {
  const force = (target - j.pos) * stiffness + impulseAccel;
  j.vel += force * dt;
  j.vel *= Math.exp(-damping * dt);
  j.pos += j.vel * dt;

  if (j.pos < minDeg) {
    j.pos = minDeg;
    if (j.vel < 0) j.vel *= -0.18;
  } else if (j.pos > maxDeg) {
    j.pos = maxDeg;
    if (j.vel > 0) j.vel *= -0.18;
  }
  return j.pos;
}

function clampEllipse(dx: number, dy: number, rx: number, ry: number) {
  const mag = Math.hypot(dx / rx, dy / ry);
  if (mag <= 1) return { x: dx, y: dy };
  return { x: dx / mag, y: dy / mag };
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

  // Puntero global para brisa ingrávida cercana
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -999,
    y: -999,
    active: false,
  });

  // Estado de arrastre elástico directo sobre el astronauta
  const dragRef = useRef<{
    active: boolean;
    dragging: boolean;
    startClientX: number;
    startClientY: number;
    baseDragX: number;
    baseDragY: number;
    offsetX: number;
    offsetY: number;
    prevOffsetX: number;
    prevOffsetY: number;
    releaseVx: number;
    releaseVy: number;
    lastMoveTime: number;
  }>({
    active: false,
    dragging: false,
    startClientX: 0,
    startClientY: 0,
    baseDragX: 0,
    baseDragY: 0,
    offsetX: 0,
    offsetY: 0,
    prevOffsetX: 0,
    prevOffsetY: 0,
    releaseVx: 0,
    releaseVy: 0,
    lastMoveTime: 0,
  });

  // Simulador físico 2D completo de 2º orden
  const physRef = useRef({
    initialized: false,
    prevScrollY: 0,
    velPx: 0,
    prevVelPx: 0,
    accelPx: 0,
    bodyX: 0,
    bodyY: 0,
    bodyVx: 0,
    bodyVy: 0,
    bodyAy: 0,
    rootAngle: 0,
    rootAngVel: 0,
    rootAngAccel: 0,
    spinTurns: 0,
    hoverBlend: 0,
    breezeX: 0,
    breezeY: 0,
    flowAlpha: 0,
    flowAngle: 120,
    lightBlend: 0,
    head: createJoint(0),
    farArm: createJoint(0),
    shoulder: createJoint(0),
    elbow: createJoint(0),
    frontHip: createJoint(0),
    frontKnee: createJoint(0),
    backHip: createJoint(0),
    backKnee: createJoint(0),
  });

  // Cadena Verlet de 8 nodos para el cable umbilical físico
  const ropeRef = useRef<RopeNode[]>(
    Array.from({ length: ROPE_NODES }, (_, i) => {
      const frac = i / (ROPE_NODES - 1);
      return {
        x: 48 - frac * 14,
        y: frac * 34,
        ox: 48 - frac * 14,
        oy: frac * 34,
      };
    })
  );

  const starBurstTimeRef = useRef<number>(-10);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const pctLabelRef = useRef<HTMLSpanElement | null>(null);
  const scrollPctRef = useRef<number>(0);
  const lastAriaPctRef = useRef<number>(-1);

  const isVisibleDesktopRef = useRef<boolean>(true);
  const trackRectRef = useRef<{ left: number; top: number }>({
    left: 12,
    top: 96,
  });
  const serviciosDocBoundsRef = useRef<{ top: number; bottom: number }>({
    top: -1,
    bottom: -1,
  });
  const overLightRef = useRef<boolean>(false);
  const lastLightCheckRef = useRef<number>(0);
  const wasFlowHiddenRef = useRef<boolean>(false);
  const wasBurstClearedRef = useRef<boolean>(false);

  const [trackHeight, setTrackHeight] = useState<number>(520);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const { scrollYProgress } = useScroll();

  const bodyPosX = useMotionValue(0);
  const bodyPosY = useMotionValue(0);

  useEffect(() => {
    hoveredRef.current = isHovered;
  }, [isHovered]);

  // Medición responsiva de la altura/posición del carril, #servicios y visibilidad sm+
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const syncDesktopVisibility = () => {
      isVisibleDesktopRef.current = mq.matches;
    };
    syncDesktopVisibility();
    mq.addEventListener("change", syncDesktopVisibility);

    const refreshServiciosDocBounds = () => {
      const servEl = document.getElementById("servicios");
      if (servEl) {
        const sr = servEl.getBoundingClientRect();
        const docTop = sr.top + window.scrollY;
        serviciosDocBoundsRef.current = {
          top: docTop,
          bottom: docTop + servEl.offsetHeight,
        };
      } else {
        serviciosDocBoundsRef.current = { top: -1, bottom: -1 };
      }
    };

    const el = trackRef.current;
    const updateTrackMetrics = () => {
      if (el) {
        const h = el.clientHeight || 520;
        const r = el.getBoundingClientRect();
        trackHeightRef.current = h;
        trackRectRef.current = { left: r.left, top: r.top };
        setTrackHeight(h);
      }
      refreshServiciosDocBounds();
    };

    updateTrackMetrics();

    let docResizeTimer = 0;
    const handleDocResize = () => {
      window.clearTimeout(docResizeTimer);
      docResizeTimer = window.setTimeout(refreshServiciosDocBounds, 150);
    };

    const ro = el ? new ResizeObserver(updateTrackMetrics) : null;
    if (el && ro) ro.observe(el);

    const docRo = new ResizeObserver(handleDocResize);
    docRo.observe(document.body);

    window.addEventListener("resize", updateTrackMetrics, { passive: true });

    return () => {
      mq.removeEventListener("change", syncDesktopVisibility);
      ro?.disconnect();
      docRo.disconnect();
      window.clearTimeout(docResizeTimer);
      window.removeEventListener("resize", updateTrackMetrics);
    };
  }, []);

  // Listeners globales para brisa del puntero y arrastre elástico
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.active = true;

      const d = dragRef.current;
      if (!d.active) return;

      const rawDx = e.clientX - d.startClientX;
      const rawDy = e.clientY - d.startClientY;
      if (!d.dragging && Math.hypot(rawDx, rawDy) > 5) {
        d.dragging = true;
      }

      if (d.dragging) {
        const clamped = clampEllipse(
          d.baseDragX + rawDx,
          d.baseDragY + rawDy,
          34,
          48
        );
        const now = performance.now();
        const moveDt = Math.max(0.008, (now - d.lastMoveTime) / 1000);
        d.releaseVx = clamp((clamped.x - d.offsetX) / moveDt, -520, 520);
        d.releaseVy = clamp((clamped.y - d.offsetY) / moveDt, -520, 520);
        d.prevOffsetX = d.offsetX;
        d.prevOffsetY = d.offsetY;
        d.offsetX = clamped.x;
        d.offsetY = clamped.y;
        d.lastMoveTime = now;
      }
    };

    const triggerSpinImpulse = () => {
      const p = physRef.current;
      p.spinTurns -= 1;
      p.rootAngVel -= 420;
      p.bodyVy -= 120;
      starBurstTimeRef.current = performance.now() * 0.001;
    };

    const handleGlobalPointerUp = () => {
      const d = dragRef.current;
      if (!d.active) return;

      const wasDragging = d.dragging;
      d.active = false;
      d.dragging = false;

      if (wasDragging) {
        const p = physRef.current;
        p.bodyVx += d.releaseVx * 0.65;
        p.bodyVy += d.releaseVy * 0.65;
        p.rootAngVel += clamp(d.releaseVx * 0.7, -260, 260);
        d.offsetX = 0;
        d.offsetY = 0;
        d.releaseVx = 0;
        d.releaseVy = 0;
      } else {
        triggerSpinImpulse();
      }
    };

    const handleWindowBlur = () => {
      pointerRef.current.active = false;
      if (dragRef.current.active) {
        dragRef.current.active = false;
        dragRef.current.dragging = false;
        dragRef.current.offsetX = 0;
        dragRef.current.offsetY = 0;
      }
    };

    window.addEventListener("pointermove", handleGlobalPointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerUp);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const nextPct = Math.round(clamp(latest, 0, 1) * 100);
    scrollPctRef.current = nextPct;

    if (pctLabelRef.current) {
      pctLabelRef.current.textContent = `${nextPct}%`;
    }

    if (
      buttonRef.current &&
      (nextPct === 0 ||
        nextPct === 100 ||
        Math.abs(nextPct - lastAriaPctRef.current) >= 5)
    ) {
      lastAriaPctRef.current = nextPct;
      buttonRef.current.setAttribute(
        "aria-label",
        `Astronauta editorial: ${nextPct}% del recorrido`
      );
    }
  });

  const handleAstronautPointerDown = (
    e: React.PointerEvent<HTMLButtonElement>
  ) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const d = dragRef.current;
    d.active = true;
    d.dragging = false;
    d.startClientX = e.clientX;
    d.startClientY = e.clientY;
    d.baseDragX = physRef.current.bodyX;
    d.baseDragY = 0;
    d.offsetX = d.baseDragX;
    d.offsetY = 0;
    d.releaseVx = 0;
    d.releaseVy = 0;
    d.lastMoveTime = performance.now();
  };

  const handleAstronautKeyboardClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // El clic con puntero ya se dispara al soltar en pointerup (solo manejar Enter/Space)
    if (e.detail !== 0) return;
    const p = physRef.current;
    p.spinTurns -= 1;
    p.rootAngVel -= 420;
    p.bodyVy -= 120;
    starBurstTimeRef.current = performance.now() * 0.001;
  };

  useAnimationFrame((timeMs, deltaMs) => {
    if (document.hidden || !isVisibleDesktopRef.current) return;

    const dt = clamp(deltaMs, 1, 33) / 1000;
    const t = timeMs * 0.001;
    const nowSec = performance.now() * 0.001;
    const ease = (rate: number) => 1 - Math.exp(-rate * dt);

    const p = physRef.current;
    const drag = dragRef.current;
    const travel = Math.max(trackHeightRef.current - 112, 1);
    const scrollTargetY = clamp(scrollYProgress.get(), 0, 1) * travel;
    const currentScrollY = window.scrollY;

    if (!p.initialized) {
      p.initialized = true;
      p.prevScrollY = currentScrollY;
      p.bodyY = scrollTargetY;
      p.bodyX = 0;

      const initEndX = 12 + 29 * (72 / 110);
      const initEndY = Math.max(12, scrollTargetY + 46 * (112 / 170));
      const nodes = ropeRef.current;
      for (let i = 0; i < ROPE_NODES; i++) {
        const frac = i / (ROPE_NODES - 1);
        const nx = lerp(48, initEndX, frac);
        const ny = lerp(0, initEndY, frac);
        nodes[i].x = nx;
        nodes[i].y = ny;
        nodes[i].ox = nx;
        nodes[i].oy = ny;
      }
    }

    // 1. Velocidad y aceleración reales de scroll en píxeles
    const rawVelPx = clamp((currentScrollY - p.prevScrollY) / dt, -3600, 3600);
    p.prevScrollY = currentScrollY;
    p.prevVelPx = p.velPx;
    p.velPx += (rawVelPx - p.velPx) * ease(14);
    const rawAccelPx = clamp((p.velPx - p.prevVelPx) / dt, -14000, 14000);
    p.accelPx += (rawAccelPx - p.accelPx) * ease(12);

    const downStrength = clamp(p.velPx / 1200, 0, 1);
    const upStrength = clamp(-p.velPx / 1200, 0, 1);
    const scrollStrength = Math.max(downStrength, upStrength);
    const isScrolling = Math.abs(p.velPx) > 75;

    // 2. Brisa ingrávida cercana usando coordenadas cacheadas del carril (sin reflow)
    let targetBreezeX = 0;
    let targetBreezeY = 0;
    const ptr = pointerRef.current;

    if (ptr.active && !drag.dragging && !hoveredRef.current) {
      const astroCx = trackRectRef.current.left + 12 + p.bodyX + 36;
      const astroCy = trackRectRef.current.top + p.bodyY + 56;
      const dxPtr = astroCx - ptr.x;
      const dyPtr = astroCy - ptr.y;
      const distPtr = Math.hypot(dxPtr, dyPtr);

      if (distPtr < 115 && distPtr > 18) {
        const falloff = Math.pow(1 - distPtr / 115, 2);
        const ux = dxPtr / distPtr;
        const uy = dyPtr / distPtr;
        targetBreezeX = clamp(ux * falloff * 14, -14, 18);
        targetBreezeY = clamp(uy * falloff * 14, -14, 14);
        p.rootAngVel += ux * falloff * 28 * dt;
      }
    }
    p.breezeX += (targetBreezeX - p.breezeX) * ease(8);
    p.breezeY += (targetBreezeY - p.breezeY) * ease(8);

    // 3. Dinámica 2D de cuerpo rígido (Lissajous + resorte 2º orden + arrastre elástico)
    const lissX = Math.sin(t * 0.92) * 3.0 + Math.cos(t * 1.47) * 1.4;
    const lissY = Math.cos(t * 1.15) * 4.5 + Math.sin(t * 1.72) * 2.2;
    const tetherSwingX = clamp(-p.velPx * 0.0045, -7, 7);

    const targetBodyX = drag.dragging
      ? drag.offsetX
      : clamp(lissX + p.breezeX + tetherSwingX, -14, 18);
    const targetBodyY = drag.dragging
      ? scrollTargetY + drag.offsetY
      : scrollTargetY + lissY + p.breezeY;

    const kBodyX = drag.dragging ? 150 : 24;
    const dBodyX = drag.dragging ? 23 : 6.2;
    const kBodyY = drag.dragging ? 150 : 34;
    const dBodyY = drag.dragging ? 23 : 8.4;

    const subSteps = 2;
    const subDt = dt / subSteps;
    let lastAx = 0;
    let lastAy = 0;

    for (let s = 0; s < subSteps; s++) {
      // Fuerza vertical + pequeño acoplamiento lateral en frenadas fuertes
      const whipX = (p.accelPx / 14000) * 18;
      lastAx = (targetBodyX - p.bodyX) * kBodyX + whipX;
      lastAy = (targetBodyY - p.bodyY) * kBodyY;

      p.bodyVx += lastAx * subDt;
      p.bodyVy += lastAy * subDt;
      p.bodyVx *= Math.exp(-dBodyX * subDt);
      p.bodyVy *= Math.exp(-dBodyY * subDt);

      p.bodyX += p.bodyVx * subDt;
      p.bodyY += p.bodyVy * subDt;
    }

    if (!drag.dragging) {
      p.bodyX = clamp(p.bodyX, -22, 26);
    }
    p.bodyY = clamp(p.bodyY, -28, travel + 28);
    p.bodyAy = clamp(lastAy, -3600, 3600);

    bodyPosX.set(p.bodyX);
    bodyPosY.set(p.bodyY);

    // 4. Dinámica angular del torso (picada/ascenso + latigazo de frenada + giro 360°)
    const idleTiltTarget = Math.sin(t * 0.9) * 3.5;
    const dropTiltTarget = 16 + downStrength * 12;
    const boostTiltTarget = -(15 + upStrength * 9);
    const scrollAccelWhip = clamp(-p.accelPx / 1200, -10, 10);
    const dragTorque = drag.dragging ? clamp(-drag.offsetX * 0.8, -22, 22) : 0;

    const baseTiltTarget =
      idleTiltTarget * (1 - scrollStrength) +
      dropTiltTarget * downStrength +
      boostTiltTarget * upStrength +
      scrollAccelWhip * 0.55 +
      dragTorque;

    const effectiveTargetAngle = p.spinTurns * 360 + baseTiltTarget;
    const kAngle = 32;
    const dAngle = 10.6;
    let lastAngAccel = 0;

    for (let s = 0; s < subSteps; s++) {
      lastAngAccel = (effectiveTargetAngle - p.rootAngle) * kAngle;
      p.rootAngVel += lastAngAccel * subDt;
      p.rootAngVel *= Math.exp(-dAngle * subDt);
      p.rootAngle += p.rootAngVel * subDt;
    }
    p.rootAngAccel = lastAngAccel;

    // Normalizar múltiplos completos cuando ya aterrizó derecho y en calma
    if (
      p.spinTurns !== 0 &&
      Math.abs(effectiveTargetAngle - p.rootAngle) < 0.35 &&
      Math.abs(p.rootAngVel) < 1.2
    ) {
      p.rootAngle -= p.spinTurns * 360;
      p.spinTurns = 0;
    }

    if (rigRootRef.current) {
      rigRootRef.current.setAttribute(
        "transform",
        `rotate(${p.rootAngle.toFixed(2)} 54 78)`
      );
    }

    if (torsoRef.current) {
      const torsoBreath = Math.sin(t * 1.3) * 0.8;
      torsoRef.current.setAttribute(
        "transform",
        `translate(0 ${torsoBreath.toFixed(2)})`
      );
    }

    // 5. Articulaciones acopladas de 2º orden (follow-through + inercia + fuerza centrífuga)
    p.hoverBlend +=
      ((hoveredRef.current && !drag.dragging ? 1 : 0) - p.hoverBlend) * ease(8.0);

    const ayNorm = clamp(p.bodyAy / 900, -1.8, 1.8);
    const velRotImpulse = clamp(p.rootAngVel * 0.08, -28, 28);
    const centrifugal = clamp(Math.abs(p.rootAngVel) / 480, 0, 1);

    const headTarget =
      Math.sin(t * 0.9 - 0.65) * 4.2 * (1 - scrollStrength) +
      downStrength * 8 -
      upStrength * 11 +
      p.hoverBlend * 9.5;
    const headDeg = stepJoint(
      p.head,
      headTarget,
      62,
      10.5,
      -ayNorm * 35 + velRotImpulse,
      -28,
      28,
      dt
    );
    if (headRef.current) {
      headRef.current.setAttribute(
        "transform",
        `rotate(${headDeg.toFixed(2)} 55 39)`
      );
    }

    const shoulderTarget = lerp(
      Math.sin(t * 1.35 - 0.75) * 7.5 * (1 - scrollStrength) +
        downStrength * 36 -
        upStrength * 14 +
        centrifugal * 28,
      -24 + Math.sin(t * 2.4) * 4,
      p.hoverBlend
    );
    const shoulderDeg = stepJoint(
      p.shoulder,
      shoulderTarget,
      52,
      8.2,
      -ayNorm * 55 + centrifugal * 160,
      -65,
      68,
      dt
    );

    const elbowTarget = lerp(
      Math.sin(t * 1.35 - 1.65) * 11.5 * (1 - scrollStrength) +
        downStrength * 20 -
        upStrength * 12 +
        centrifugal * 16,
      -26 + Math.sin(t * 3.2 - 0.6) * 8,
      p.hoverBlend
    );
    const elbowDeg = stepJoint(
      p.elbow,
      elbowTarget,
      58,
      7.4,
      -p.shoulder.vel * 1.15 - velRotImpulse * 1.6 - ayNorm * 45,
      -72,
      65,
      dt
    );

    const farArmTarget =
      Math.cos(t * 1.35 - 0.8) * 6 * (1 - scrollStrength) -
      downStrength * 18 +
      upStrength * 10 -
      centrifugal * 22;
    const farArmDeg = stepJoint(
      p.farArm,
      farArmTarget,
      50,
      8.0,
      -ayNorm * 45 - velRotImpulse * 1.2,
      -55,
      55,
      dt
    );

    if (upperArmRef.current) {
      upperArmRef.current.setAttribute(
        "transform",
        `rotate(${shoulderDeg.toFixed(2)} 49 50)`
      );
    }
    if (forearmRef.current) {
      forearmRef.current.setAttribute(
        "transform",
        `rotate(${elbowDeg.toFixed(2)} 47 74)`
      );
    }
    if (farArmRef.current) {
      farArmRef.current.setAttribute(
        "transform",
        `rotate(${farArmDeg.toFixed(2)} 64 52)`
      );
    }

    const legPhase = t * 1.2;
    const frontHipTarget =
      Math.sin(legPhase) * 6.5 * (1 - scrollStrength) +
      downStrength * 18 -
      upStrength * 16 -
      centrifugal * 18;
    const frontHipDeg = stepJoint(
      p.frontHip,
      frontHipTarget,
      56,
      8.8,
      -ayNorm * 48 + velRotImpulse,
      -52,
      54,
      dt
    );

    const frontKneeTarget =
      Math.sin(legPhase - 0.8) * 9.0 * (1 - scrollStrength) -
      downStrength * 22 +
      upStrength * 16 +
      centrifugal * 12;
    const frontKneeDeg = stepJoint(
      p.frontKnee,
      frontKneeTarget,
      60,
      7.8,
      -p.frontHip.vel * 1.2 + ayNorm * 42,
      -58,
      58,
      dt
    );

    const backHipTarget =
      Math.sin(legPhase + Math.PI * 0.78) * 7.0 * (1 - scrollStrength) +
      downStrength * 22 -
      upStrength * 14 +
      centrifugal * 16;
    const backHipDeg = stepJoint(
      p.backHip,
      backHipTarget,
      54,
      8.6,
      -ayNorm * 52 + velRotImpulse,
      -52,
      56,
      dt
    );

    const backKneeTarget =
      Math.sin(legPhase + Math.PI * 0.78 - 0.8) * 9.5 * (1 - scrollStrength) -
      downStrength * 20 +
      upStrength * 18 +
      centrifugal * 14;
    const backKneeDeg = stepJoint(
      p.backKnee,
      backKneeTarget,
      58,
      7.6,
      -p.backHip.vel * 1.2 + ayNorm * 45,
      -58,
      58,
      dt
    );

    if (frontLegRef.current) {
      frontLegRef.current.setAttribute(
        "transform",
        `rotate(${frontHipDeg.toFixed(2)} 52 96)`
      );
    }
    if (frontShinRef.current) {
      frontShinRef.current.setAttribute(
        "transform",
        `rotate(${frontKneeDeg.toFixed(2)} 70 122)`
      );
    }
    if (backLegRef.current) {
      backLegRef.current.setAttribute(
        "transform",
        `rotate(${backHipDeg.toFixed(2)} 46 94)`
      );
    }
    if (backShinRef.current) {
      backShinRef.current.setAttribute(
        "transform",
        `rotate(${backKneeDeg.toFixed(2)} 57 123)`
      );
    }

    // 6. Detección cacheada de sección clara #servicios (#F4F1EA) sin reflows en scroll
    const nowMs = performance.now();
    if (nowMs - lastLightCheckRef.current >= 90) {
      lastLightCheckRef.current = nowMs;
      const bounds = serviciosDocBoundsRef.current;
      if (bounds.top !== -1) {
        const astroDocY =
          currentScrollY + trackRectRef.current.top + p.bodyY + 56;
        overLightRef.current =
          astroDocY >= bounds.top && astroDocY <= bounds.bottom;
      } else {
        overLightRef.current = false;
      }
    }

    p.lightBlend += ((overLightRef.current ? 1 : 0) - p.lightBlend) * ease(9);

    // 7. Tres líneas de flujo/velocidad ultrafinas estilo tinta cómic al scrollear
    const targetFlowAlpha = isScrolling
      ? clamp(scrollStrength * 0.9, 0.25, 0.9)
      : 0;
    p.flowAlpha += (targetFlowAlpha - p.flowAlpha) * ease(11);

    const targetFlowAngle = downStrength >= upStrength ? 128 : -16;
    p.flowAngle += (targetFlowAngle - p.flowAngle) * ease(12);

    const inkR = Math.round(lerp(244, 9, p.lightBlend));
    const inkG = Math.round(lerp(241, 9, p.lightBlend));
    const inkB = Math.round(lerp(234, 11, p.lightBlend));
    const flowColor = `rgba(${inkR}, ${inkG}, ${inkB}, 0.72)`;

    if (flowGroupRef.current) {
      if (p.flowAlpha > 0.02) {
        wasFlowHiddenRef.current = false;
        const streakStretch = 0.72 + scrollStrength * 0.55;
        const jitter = Math.sin(t * 24) * 1.4;
        flowGroupRef.current.setAttribute("opacity", p.flowAlpha.toFixed(2));
        flowGroupRef.current.setAttribute(
          "transform",
          `translate(25 66) rotate(${p.flowAngle.toFixed(1)}) scale(1 ${streakStretch.toFixed(
            2
          )}) translate(${jitter.toFixed(2)} 0) translate(-25 -66)`
        );
        for (let i = 0; i < flowLineRefs.current.length; i++) {
          const lineEl = flowLineRefs.current[i];
          if (lineEl) lineEl.setAttribute("stroke", flowColor);
        }
      } else if (!wasFlowHiddenRef.current) {
        wasFlowHiddenRef.current = true;
        flowGroupRef.current.setAttribute("opacity", "0");
      }
    }

    // 8. Pequeñas líneas de trazo estelar alrededor al hacer clic
    const burstAge = nowSec - starBurstTimeRef.current;
    if (burstAge < 0 || burstAge > 0.65) {
      if (!wasBurstClearedRef.current) {
        wasBurstClearedRef.current = true;
        for (let i = 0; i < CLICK_STAR_ANGLES.length; i++) {
          const lineEl = clickStarRefs.current[i];
          if (lineEl) lineEl.setAttribute("opacity", "0");
        }
      }
    } else {
      wasBurstClearedRef.current = false;
      for (let i = 0; i < CLICK_STAR_ANGLES.length; i++) {
        const lineEl = clickStarRefs.current[i];
        if (!lineEl) continue;

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
    }

    // 9. Cable umbilical físico con integración Verlet de 8 nodos
    const cableEl = cablePathRef.current;
    const anchorEl = cableAnchorRef.current;
    if (cableEl && anchorEl) {
      const anchorX = 48;
      const anchorY = 0;
      const sx = 72 / 110;
      const sy = 112 / 170;

      // Posición exacta de la argolla del arnés (29, 46) rotada alrededor de (54, 78)
      const rad = (p.rootAngle * Math.PI) / 180;
      const dxRing = 29 - 54;
      const dyRing = 46 - 78;
      const rotX = 54 + dxRing * Math.cos(rad) - dyRing * Math.sin(rad);
      const rotY = 78 + dxRing * Math.sin(rad) + dyRing * Math.cos(rad);

      const endX = clamp(12 + p.bodyX + rotX * sx, 4, 92);
      const endY = Math.max(10, p.bodyY + rotY * sy);

      const nodes = ropeRef.current;
      const totalSpan = Math.hypot(endX - anchorX, endY - anchorY);
      const slackMult = drag.dragging
        ? 1.01
        : Math.max(1.015, 1.07 - upStrength * 0.04);
      const segLen = Math.max(totalSpan * slackMult, 20) / (ROPE_NODES - 1);

      const verletDamp = 0.94;
      const windStep = dt * dt;

      for (let i = 1; i < ROPE_NODES - 1; i++) {
        const n = nodes[i];
        const vx = clamp((n.x - n.ox) * verletDamp, -14, 14);
        const vy = clamp((n.y - n.oy) * verletDamp, -18, 18);
        n.ox = n.x;
        n.oy = n.y;

        const spaceWindX =
          (Math.sin(t * 1.45 + i * 0.65) * 46 - p.velPx * 0.04) * windStep;
        const spaceDriftY = 18 * windStep;

        n.x = clamp(n.x + vx + spaceWindX, 4, 92);
        n.y = Math.max(1, n.y + vy + spaceDriftY);
      }

      // 6 iteraciones de restricción de distancia entre los 8 nodos
      for (let iter = 0; iter < 6; iter++) {
        nodes[0].x = anchorX;
        nodes[0].y = anchorY;
        nodes[ROPE_NODES - 1].x = endX;
        nodes[ROPE_NODES - 1].y = endY;

        for (let i = 0; i < ROPE_NODES - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          const diff = (dist - segLen) / dist;

          const pinA = i === 0;
          const pinB = i + 1 === ROPE_NODES - 1;

          if (!pinA && !pinB) {
            a.x += dx * 0.5 * diff;
            a.y += dy * 0.5 * diff;
            b.x -= dx * 0.5 * diff;
            b.y -= dy * 0.5 * diff;
          } else if (pinA && !pinB) {
            b.x -= dx * diff;
            b.y -= dy * diff;
          } else if (!pinA && pinB) {
            a.x += dx * diff;
            a.y += dy * diff;
          }

          if (!pinA) {
            a.x = clamp(a.x, 4, 92);
            a.y = Math.max(1, a.y);
          }
          if (!pinB) {
            b.x = clamp(b.x, 4, 92);
            b.y = Math.max(1, b.y);
          }
        }
      }

      // Curva cuadrática suave uniendo puntos medios de los 8 nodos Verlet
      let pathD = `M ${nodes[0].x.toFixed(1)},${nodes[0].y.toFixed(1)}`;
      for (let i = 1; i < ROPE_NODES - 1; i++) {
        const curr = nodes[i];
        const next = nodes[i + 1];
        const mx = (curr.x + next.x) * 0.5;
        const my = (curr.y + next.y) * 0.5;
        pathD += ` Q ${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${mx.toFixed(
          1
        )},${my.toFixed(1)}`;
      }
      const last = nodes[ROPE_NODES - 1];
      pathD += ` L ${last.x.toFixed(1)},${last.y.toFixed(1)}`;

      cableEl.setAttribute("d", pathD);

      const cableColor = `rgba(${inkR}, ${inkG}, ${inkB}, 0.55)`;
      cableEl.setAttribute("stroke", cableColor);
      anchorEl.setAttribute("fill", cableColor);
      anchorEl.setAttribute(
        "stroke",
        p.lightBlend > 0.5 ? "#F4F1EA" : "#09090B"
      );
    }
  });

  return (
    <div
      ref={trackRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 md:left-3 top-24 bottom-16 w-[96px] z-40 hidden sm:block select-none"
    >
      {/* Cable umbilical de tinta físico (8 nodos Verlet, strokeWidth 1.3px) */}
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
          d="M 48,0 Q 44,14 39,24 L 31,30"
          stroke="rgba(244, 241, 234, 0.55)"
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Posición física 2D en gravedad cero */}
      <motion.div
        style={{ x: bodyPosX, y: bodyPosY }}
        className="pointer-events-none absolute left-[12px] top-0 will-change-transform"
      >
        <button
          ref={buttonRef}
          type="button"
          data-cursor="action"
          aria-label="Astronauta editorial: 0% del recorrido"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          onPointerDown={handleAstronautPointerDown}
          onClick={handleAstronautKeyboardClick}
          className="pointer-events-auto relative flex h-[112px] w-[72px] touch-pan-y items-center justify-center bg-transparent p-0 focus:outline-none"
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
                <path
                  d="M 39 94 L 54 94 L 62 121 L 49 124 Z"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 40.5 96 L 47 96 L 52 122 L 49.5 123 Z"
                  fill="#09090B"
                />
                <path
                  d="M 48 103 L 55 101 M 49 111 L 57 109"
                  stroke="#09090B"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
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

                  <path
                    d="M 38 142 L 49 145 L 53 151 C 55 153, 55 156, 52 157 L 35 152 Z"
                    fill="#F4F1EA"
                    stroke="#09090B"
                    strokeWidth="1.9"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 36.5 144 L 40.5 145 L 38.5 152 L 35.5 151 Z"
                    fill="#09090B"
                  />
                  <path
                    d="M 34.2 151.4 L 53.5 156.6 L 52.6 159.8 L 33.4 154.6 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
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
                <path
                  d="M 24 44 C 24.5 40.5, 27 38.5, 31 38.5 L 43 39 L 44 80 C 44 83.5, 41 85, 36 85 L 27.5 83.5 C 24 82.5, 23 78.5, 23.5 72 Z"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 24 44 C 24.4 41.5, 25.8 39.8, 28 39.2 L 32.5 39.2 L 32.5 84 L 27.5 83.2 C 24.4 82.2, 23.4 78.5, 23.8 72 Z"
                  fill="#09090B"
                  stroke="#F4F1EA"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 33 46 L 37.5 46 M 33 50 L 36.5 50 M 33 54 L 38 54 M 33 68 L 37 68 M 33 72 L 36.5 72"
                  stroke="#09090B"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />
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
                <circle
                  cx="29"
                  cy="46"
                  r="2.4"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="1.4"
                />
                <circle cx="29" cy="46" r="0.9" fill="#09090B" />

                <path
                  d="M 42 40 C 48 38, 59 38.5, 64 43.5 C 67.5 49, 67 61, 63 74 L 61.5 94 C 55.5 97, 45 96.5, 39.5 92 L 39 74 C 37.5 60, 39 46, 42 40 Z"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M 39.8 68 L 46 70 L 46.5 94.5 C 43 94, 40.5 92.8, 39.8 91 Z"
                  fill="#09090B"
                />
                <path
                  d="M 47 74 L 51 75 M 47 78 L 52 79 M 47 82 L 50.5 83 M 55 56 L 63 54 M 56 62 L 62.5 60"
                  stroke="#09090B"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />

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

                <path
                  d="M 41.5 25 C 40 16, 46 9.5, 56 9.5 C 66.5 9.5, 72.5 14.8, 72.5 22.8 C 72.5 30, 67 36.2, 57.5 37.2 C 48 38, 42.5 32.5, 41.5 25 Z"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />

                <path
                  d="M 42 25.5 C 42.8 32, 48.2 37.2, 57.5 36.5 C 61.5 36.2, 64.5 34.8, 66.8 32.6 C 59.5 34.5, 52 32.2, 48.5 26.8 C 46.2 23.2, 46.5 17.8, 49 13.4 C 44 15.8, 41.4 20.5, 42 25.5 Z"
                  fill="#09090B"
                  stroke="#F4F1EA"
                  strokeWidth="1.15"
                  strokeLinejoin="round"
                />

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

                <path
                  d="M 54.5 25.2 L 58.0 27.6 M 56.8 24.4 L 60.4 26.8 M 59.4 23.8 L 62.6 25.9"
                  stroke="#F4F1EA"
                  strokeOpacity="0.45"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                />

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
                <circle
                  cx="49"
                  cy="50"
                  r="6.2"
                  fill="#F4F1EA"
                  stroke="#09090B"
                  strokeWidth="1.6"
                />
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
                  <path
                    d="M 47.5 91.5 L 57.5 90.5 L 57.8 93.2 L 47.8 94.2 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1"
                  />

                  <path
                    d="M 48.2 93.6 C 46.5 96.5, 46.2 100.5, 47.8 103.5 C 48.8 105.2, 50.6 104.2, 50.5 101.8 L 51.2 106.2 C 51.4 107.8, 53.2 107.8, 53.4 105.8 L 53.6 101.8 L 54.4 106.4 C 54.8 107.8, 56.4 107.4, 56.4 105.5 L 56.2 101.0 L 57.4 104.6 C 58.0 105.8, 59.4 105.2, 59.0 103.2 L 57.6 97.6 C 59.2 98.4, 60.8 97.4, 60.4 95.8 C 60.0 94.4, 58.2 93.4, 57.0 92.8 Z"
                    fill="#09090B"
                    stroke="#F4F1EA"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
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
                ref={pctLabelRef}
                initial={{ opacity: 0, x: -4, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.92 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="pointer-events-none absolute left-full ml-1.5 top-2 whitespace-nowrap border border-[#F4F1EA]/45 bg-[#050505] px-2 py-0.5 font-sans font-medium tabular-nums text-[10px] tracking-[0.12em] text-[#F4F1EA]"
              >
                {scrollPctRef.current}%
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </div>
  );
}
