"use client";

import React, { useEffect, useRef, useState } from "react";

const NUM_TUBES = 5;
const POINTS = 15;

/**
 * 4 Paletas curadas que rotan suavemente al hacer clic (interpolación RGB en 0.5s)
 */
const PALETTES: readonly (readonly [string, string, string, string, string])[] = [
  // Paleta 0 (Default — Aurora Neón)
  ["#D9F99D", "#84CC16", "#FDE047", "#F472B6", "#EC4899"],
  // Paleta 1 (ELLIK Cósmica)
  ["#F4F1EA", "#38BDF8", "#818CF8", "#C084FC", "#FFFFFF"],
  // Paleta 2 (Eclipse Solar)
  ["#FEF3C7", "#F59E0B", "#FB7185", "#F97316", "#FFFFFF"],
  // Paleta 3 (Cromo Estelar)
  ["#FFFFFF", "#E4E4E7", "#94A3B8", "#F4F1EA", "#CBD5E1"],
] as const;

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const PALETTE_RGB: RGB[][] = PALETTES.map((palette) =>
  palette.map((hex) => hexToRgb(hex))
);

/**
 * Perfil de grosor a lo largo del filamento:
 * fino en la punta (t=0), pico suave en el tercio frontal (t≈0.26), afinándose a 0 en la cola (t=1).
 */
function thicknessProfile(t: number): number {
  if (t <= 0.26) {
    const u = t / 0.26;
    return 0.38 + 0.62 * Math.sin(u * (Math.PI * 0.5));
  }
  const u = (t - 0.26) / 0.74;
  return Math.pow(Math.max(0, 1 - u), 1.4);
}

interface TubeState {
  headRate: number;
  peakHaloWidth: number;
  peakCoreWidth: number;
  haloAlpha: number;
  x: Float32Array;
  y: Float32Array;
  rx: Float32Array;
  ry: Float32Array;
  mx: Float32Array;
  my: Float32Array;
}

export function TubesCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointerMq = window.matchMedia("(pointer: fine)");
    const reducedMotionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateEnabled = () => {
      setEnabled(finePointerMq.matches && !reducedMotionMq.matches);
    };

    updateEnabled();
    finePointerMq.addEventListener("change", updateEnabled);
    reducedMotionMq.addEventListener("change", updateEnabled);

    return () => {
      finePointerMq.removeEventListener("change", updateEnabled);
      reducedMotionMq.removeEventListener("change", updateEnabled);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    // Inicializar los 5 filamentos con tasas exponenciales cohesionadas (sin resortes con rebote)
    const tubes: TubeState[] = Array.from({ length: NUM_TUBES }, (_, idx) => {
      const ratio = idx / (NUM_TUBES - 1); // 0..1
      return {
        headRate: 10.5 + ratio * 3.0, // Tasas cercanas entre 10.5 y 13.5
        peakHaloWidth: 11.0 - ratio * 3.0, // Pico refinado de 8px a 11px
        peakCoreWidth: 3.2 - ratio * 0.8, // Pico refinado de 2.4px a 3.2px
        haloAlpha: 0.13, // Opacidad suave constante 0.13
        x: new Float32Array(POINTS),
        y: new Float32Array(POINTS),
        rx: new Float32Array(POINTS),
        ry: new Float32Array(POINTS),
        mx: new Float32Array(POINTS),
        my: new Float32Array(POINTS),
      };
    });

    // Precalcular perfiles por segmento (20 nodos)
    const segThickness = new Float32Array(POINTS);
    const segBell = new Float32Array(POINTS);
    const segAlpha = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i++) {
      const t = i / (POINTS - 1);
      segThickness[i] = thicknessProfile(t);
      segBell[i] = Math.sin(t * Math.PI);
      segAlpha[i] = Math.pow(Math.max(0, 1 - t), 0.85);
    }

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let guideX = mouseX;
    let guideY = mouseY;
    let prevGuideX = guideX;
    let prevGuideY = guideY;
    let pointerInitialized = false;
    let smoothSpeed = 0;
    let lastMoveTimestamp = 0;
    let idleOpacity = 0;
    let rafId: number | null = null;
    let lastTime = performance.now();

    // Estado de interpolación de paletas (0.5s al hacer clic)
    let currentPaletteIdx = 0;
    let fromColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let targetColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let activeColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let paletteTransitionStart = 0;
    let isTransitioningPalette = false;

    // Detección liviana y cacheada en coordenadas de documento de #servicios (#F4F1EA)
    let serviciosEl: HTMLElement | null = null;
    let serviciosDocTop = -1;
    let serviciosDocBottom = -1;
    let isOverLightSection = false;
    let lightSectionBlend = 0;

    const refreshServiciosDocBounds = () => {
      if (!serviciosEl || !serviciosEl.isConnected) {
        serviciosEl = document.getElementById("servicios");
      }
      if (serviciosEl) {
        const rect = serviciosEl.getBoundingClientRect();
        serviciosDocTop = rect.top + window.scrollY;
        serviciosDocBottom = serviciosDocTop + serviciosEl.offsetHeight;
      } else {
        serviciosDocTop = -1;
        serviciosDocBottom = -1;
      }
    };

    const syncOverLightSection = () => {
      if (serviciosDocTop === -1) {
        isOverLightSection = false;
        return;
      }
      const docY = mouseY + window.scrollY;
      isOverLightSection = docY >= serviciosDocTop && docY <= serviciosDocBottom;
    };

    refreshServiciosDocBounds();
    let docResizeTimer = 0;
    const docRo = new ResizeObserver(() => {
      window.clearTimeout(docResizeTimer);
      docResizeTimer = window.setTimeout(refreshServiciosDocBounds, 150);
    });
    docRo.observe(document.body);

    const snapAllNodesTo = (x: number, y: number) => {
      guideX = x;
      guideY = y;
      prevGuideX = x;
      prevGuideY = y;
      smoothSpeed = 0;
      for (let t = 0; t < NUM_TUBES; t++) {
        const tube = tubes[t];
        for (let i = 0; i < POINTS; i++) {
          tube.x[i] = x;
          tube.y[i] = y;
          tube.rx[i] = x;
          tube.ry[i] = y;
        }
      }
    };

    const renderFrame = (now: number) => {
      // Delta time independiente de 60Hz / 120Hz / 144Hz
      const dt = Math.min(Math.max((now - lastTime) / 1000, 0.001), 0.033);
      lastTime = now;
      const time = now * 0.001;

      // Suavizado exponencial sin rebote (critically damped lerp)
      const factor = (rate: number) => 1 - Math.exp(-rate * dt);

      syncOverLightSection();

      // Transición suave entre secciones oscuras y sección clara #servicios
      const targetLightBlend = isOverLightSection ? 1 : 0;
      lightSectionBlend += (targetLightBlend - lightSectionBlend) * factor(10);

      // Interpolación RGB suave de 0.5s al cambiar paleta con clic
      if (isTransitioningPalette) {
        const elapsed = (now - paletteTransitionStart) / 500;
        if (elapsed >= 1) {
          isTransitioningPalette = false;
          for (let t = 0; t < NUM_TUBES; t++) {
            activeColors[t][0] = targetColors[t][0];
            activeColors[t][1] = targetColors[t][1];
            activeColors[t][2] = targetColors[t][2];
          }
        } else {
          const ease = 1 - Math.pow(1 - elapsed, 3);
          for (let t = 0; t < NUM_TUBES; t++) {
            activeColors[t][0] =
              fromColors[t][0] + (targetColors[t][0] - fromColors[t][0]) * ease;
            activeColors[t][1] =
              fromColors[t][1] + (targetColors[t][1] - fromColors[t][1]) * ease;
            activeColors[t][2] =
              fromColors[t][2] + (targetColors[t][2] - fromColors[t][2]) * ease;
          }
        }
      }

      // Puntero virtual suavizado (guideX, guideY) con factor(14)
      const guideAlpha = factor(14);
      guideX += (mouseX - guideX) * guideAlpha;
      guideY += (mouseY - guideY) * guideAlpha;

      // Velocidad normalizada a 60fps equivalente con techo duro en 18
      const frameScale = dt * 60;
      const instSpeed =
        Math.hypot(guideX - prevGuideX, guideY - prevGuideY) /
        Math.max(frameScale, 0.25);
      prevGuideX = guideX;
      prevGuideY = guideY;

      smoothSpeed += (instSpeed - smoothSpeed) * factor(10);
      const cappedSpeed = Math.min(smoothSpeed, 18);

      // Desvanecimiento progresivo en reposo (~0.65s hasta 0)
      const timeSinceMove = now - lastMoveTimestamp;
      if (timeSinceMove > 40) {
        idleOpacity = Math.max(0, idleOpacity - dt / 0.65);
      } else {
        idleOpacity = Math.min(1, idleOpacity + dt * 8.5);
      }

      // Separación máxima controlada: entre 2.5px en movimiento lento y tope estricto de 11px
      const maxSpread = Math.min(11, 2.5 + cappedSpeed * 0.45);
      const chainAlpha = factor(18);
      let maxTailDist = 0;

      // 1. Actualizar cadena de nodos con lerp exponencial sin rebote + torsión lenta tipo cinta de seda
      for (let t = 0; t < NUM_TUBES; t++) {
        const tube = tubes[t];
        const { x, y, rx, ry, mx, my, headRate } = tube;

        // Nodo 0 sigue a (guideX, guideY) con rate entre 10.5 y 13.5
        const headAlpha = factor(headRate);
        x[0] += (guideX - x[0]) * headAlpha;
        y[0] += (guideY - y[0]) * headAlpha;

        // Cada nodo i sigue al nodo i - 1 con factor(18) sin inercia de latigueo
        for (let i = 1; i < POINTS; i++) {
          x[i] += (x[i - 1] - x[i]) * chainAlpha;
          y[i] += (y[i - 1] - y[i]) * chainAlpha;
        }

        const tailDist = Math.hypot(mouseX - x[POINTS - 1], mouseY - y[POINTS - 1]);
        if (tailDist > maxTailDist) maxTailDist = tailDist;

        // Torsión helicoidal lenta y sedosa (time * 1.4)
        let prevPerpX = 0;
        let prevPerpY = 0;

        for (let i = 0; i < POINTS; i++) {
          if (i === 0 || i === POINTS - 1) {
            rx[i] = x[i];
            ry[i] = y[i];
            continue;
          }

          const dx = x[i - 1] - x[i + 1];
          const dy = y[i - 1] - y[i + 1];
          const len = Math.hypot(dx, dy);

          if (len > 0.15) {
            const nx = dx / len;
            const ny = dy / len;
            // Suavizar la normal con el segmento previo para evitar quiebres bruscos
            const rawPerpX = -ny;
            const rawPerpY = nx;
            const perpX =
              i === 1 ? rawPerpX : prevPerpX * 0.35 + rawPerpX * 0.65;
            const perpY =
              i === 1 ? rawPerpY : prevPerpY * 0.35 + rawPerpY * 0.65;
            prevPerpX = perpX;
            prevPerpY = perpY;

            // Atenuar torsión cuando los nodos están muy cerca entre sí al frenar
            const segReach = Math.min(1, len / 4.5);
            const spread = maxSpread * segBell[i] * segReach;
            const offset =
              Math.sin(time * 1.4 - i * 0.26 + t * 1.25) * spread;

            rx[i] = x[i] + perpX * offset;
            ry[i] = y[i] + perpY * offset;
          } else {
            rx[i] = x[i];
            ry[i] = y[i];
          }
        }

        // Puntos medios para curvas cuadráticas suaves
        for (let i = 0; i < POINTS - 1; i++) {
          mx[i] = (rx[i] + rx[i + 1]) * 0.5;
          my[i] = (ry[i] + ry[i + 1]) * 0.5;
        }
      }

      // 2. Limpiar canvas y renderizar doble capa refinada
      ctx.clearRect(0, 0, width, height);

      if (idleOpacity > 0.004) {
        const useSourceOver = lightSectionBlend > 0.45;
        const luminanceScale = 1 - 0.25 * lightSectionBlend; // Oscurece 25% sobre #servicios
        const haloWidthScale = 1 - 0.25 * lightSectionBlend;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // CAPA 1: Halo Volumétrico suave (pico de 8px a 11px, opacidad 0.13)
        ctx.globalCompositeOperation = useSourceOver ? "source-over" : "lighter";

        for (let t = 0; t < NUM_TUBES; t++) {
          const tube = tubes[t];
          const { rx, ry, mx, my, peakHaloWidth, haloAlpha } = tube;
          const r = Math.round(activeColors[t][0] * luminanceScale);
          const g = Math.round(activeColors[t][1] * luminanceScale);
          const b = Math.round(activeColors[t][2] * luminanceScale);

          for (let i = 0; i < POINTS - 2; i++) {
            const w = peakHaloWidth * haloWidthScale * segThickness[i];
            const a = haloAlpha * idleOpacity * segAlpha[i];
            if (w < 0.3 || a < 0.004) continue;

            ctx.beginPath();
            if (i === 0) {
              ctx.moveTo(rx[0], ry[0]);
            } else {
              ctx.moveTo(mx[i - 1], my[i - 1]);
            }
            ctx.quadraticCurveTo(rx[i], ry[i], mx[i], my[i]);
            ctx.lineWidth = w;
            ctx.strokeStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
            ctx.stroke();
          }
        }

        // CAPA 2A: Tubo Principal refinado (pico de 2.4px a 3.2px)
        for (let t = 0; t < NUM_TUBES; t++) {
          const tube = tubes[t];
          const { rx, ry, mx, my, peakCoreWidth } = tube;
          const r = Math.round(activeColors[t][0] * luminanceScale);
          const g = Math.round(activeColors[t][1] * luminanceScale);
          const b = Math.round(activeColors[t][2] * luminanceScale);

          for (let i = 0; i < POINTS - 2; i++) {
            const w = peakCoreWidth * segThickness[i];
            const a = 0.84 * idleOpacity * segAlpha[i];
            if (w < 0.2 || a < 0.006) continue;

            ctx.beginPath();
            if (i === 0) {
              ctx.moveTo(rx[0], ry[0]);
            } else {
              ctx.moveTo(mx[i - 1], my[i - 1]);
            }
            ctx.quadraticCurveTo(rx[i], ry[i], mx[i], my[i]);
            ctx.lineWidth = w;
            ctx.strokeStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`;
            ctx.stroke();
          }
        }

        // CAPA 2B: Núcleo Blanco fino (0.9px, opacidad 0.7)
        const coreWhiteChannel = Math.round(255 - 25 * lightSectionBlend);
        for (let t = 0; t < NUM_TUBES; t++) {
          const tube = tubes[t];
          const { rx, ry, mx, my } = tube;

          for (let i = 0; i < POINTS - 3; i++) {
            const w = 0.9 * segThickness[i];
            const a =
              (0.7 - 0.18 * lightSectionBlend) * idleOpacity * segAlpha[i];
            if (w < 0.15 || a < 0.008) continue;

            ctx.beginPath();
            if (i === 0) {
              ctx.moveTo(rx[0], ry[0]);
            } else {
              ctx.moveTo(mx[i - 1], my[i - 1]);
            }
            ctx.quadraticCurveTo(rx[i], ry[i], mx[i], my[i]);
            ctx.lineWidth = w;
            ctx.strokeStyle = `rgba(${coreWhiteChannel},${coreWhiteChannel},${coreWhiteChannel},${a.toFixed(3)})`;
            ctx.stroke();
          }
        }
      }

      // Detener requestAnimationFrame al quedar quieto (0% CPU en idle)
      if (
        idleOpacity <= 0.004 &&
        maxTailDist < 1.2 &&
        !isTransitioningPalette
      ) {
        ctx.clearRect(0, 0, width, height);
        rafId = null;
        return;
      }

      rafId = window.requestAnimationFrame(renderFrame);
    };

    const ensureLoopRunning = () => {
      if (rafId === null) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const nextX = e.clientX;
      const nextY = e.clientY;

      // Si es el primer movimiento o saltó >260px tras estar en reposo, anclar nodos directo al cursor
      const jumpDist = Math.hypot(nextX - guideX, nextY - guideY);
      if (
        !pointerInitialized ||
        (idleOpacity <= 0.05 && jumpDist > 260) ||
        (rafId === null && jumpDist > 260)
      ) {
        pointerInitialized = true;
        snapAllNodesTo(nextX, nextY);
      }

      mouseX = nextX;
      mouseY = nextY;
      lastMoveTimestamp = now;
      syncOverLightSection();

      ensureLoopRunning();
    };

    const handlePointerDown = () => {
      const now = performance.now();
      currentPaletteIdx = (currentPaletteIdx + 1) % PALETTE_RGB.length;
      fromColors = activeColors.map((c) => [...c] as RGB);
      targetColors = PALETTE_RGB[currentPaletteIdx].map((c) => [...c] as RGB);
      paletteTransitionStart = now;
      isTransitioningPalette = true;
      lastMoveTimestamp = now;
      idleOpacity = Math.max(idleOpacity, 0.7);
      ensureLoopRunning();
    };

    const handleResize = () => {
      resizeCanvas();
      refreshServiciosDocBounds();
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.clearTimeout(docResizeTimer);
      docRo.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[45] pointer-events-none hidden md:block"
    />
  );
}
