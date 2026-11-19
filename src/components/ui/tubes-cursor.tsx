"use client";

import React, { useEffect, useRef, useState } from "react";

const NUM_TUBES = 5;
const POINTS = 26;

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
 * fino en la punta (t=0), pico ancho en el tercio frontal (t≈0.26), afinándose a 0 en la cola (t=1).
 */
function thicknessProfile(t: number): number {
  if (t <= 0.26) {
    const u = t / 0.26;
    return 0.36 + 0.64 * Math.sin(u * (Math.PI * 0.5));
  }
  const u = (t - 0.26) / 0.74;
  return Math.pow(Math.max(0, 1 - u), 1.35);
}

interface TubeState {
  stiffness: number;
  damping: number;
  peakHaloWidth: number;
  peakCoreWidth: number;
  haloAlpha: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
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
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    // Inicializar los 5 filamentos con parámetros físicos escalonados
    const tubes: TubeState[] = Array.from({ length: NUM_TUBES }, (_, idx) => {
      const ratio = idx / (NUM_TUBES - 1); // 0..1
      return {
        stiffness: 0.16 + ratio * 0.10, // 0.16 a 0.26
        damping: 0.78 - ratio * 0.10, // 0.68 a 0.78
        peakHaloWidth: 16 - ratio * 6, // 10px a 16px en el pico
        peakCoreWidth: 5.0 - ratio * 1.5, // 3.5px a 5px
        haloAlpha: 0.22 - ratio * 0.08, // 0.14 a 0.22
        x: new Float32Array(POINTS),
        y: new Float32Array(POINTS),
        vx: new Float32Array(POINTS),
        vy: new Float32Array(POINTS),
        rx: new Float32Array(POINTS),
        ry: new Float32Array(POINTS),
        mx: new Float32Array(POINTS),
        my: new Float32Array(POINTS),
      };
    });

    // Precalcular perfiles por segmento para evitar cálculos redundantes en 60fps
    const segThickness = new Float32Array(POINTS);
    const segBell = new Float32Array(POINTS);
    const segAlpha = new Float32Array(POINTS);
    for (let i = 0; i < POINTS; i++) {
      const t = i / (POINTS - 1);
      segThickness[i] = thicknessProfile(t);
      segBell[i] = Math.sin(t * Math.PI);
      segAlpha[i] = Math.pow(Math.max(0, 1 - t), 0.78);
    }

    let mouseX = width * 0.5;
    let mouseY = height * 0.5;
    let prevMouseX = mouseX;
    let prevMouseY = mouseY;
    let pointerInitialized = false;
    let pointerSpeed = 0;
    let lastMoveTimestamp = 0;
    let idleOpacity = 0;
    let rafId: number | null = null;
    let lastFrameTime = performance.now();

    // Estado de interpolación de paletas (0.5s al hacer clic)
    let currentPaletteIdx = 0;
    let fromColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let targetColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let activeColors: RGB[] = PALETTE_RGB[0].map((c) => [...c] as RGB);
    let paletteTransitionStart = 0;
    let isTransitioningPalette = false;

    // Detección liviana y cacheada de la sección clara #servicios (#F4F1EA)
    let serviciosEl: HTMLElement | null = null;
    let serviciosTop = -1;
    let serviciosBottom = -1;
    let lastRectUpdate = 0;
    let isOverLightSection = false;
    let lightSectionBlend = 0; // 0 = oscuro (lighter), 1 = claro (#servicios, source-over)

    const updateServiciosBounds = (now: number) => {
      if (now - lastRectUpdate < 120) return;
      lastRectUpdate = now;
      if (!serviciosEl || !serviciosEl.isConnected) {
        serviciosEl = document.getElementById("servicios");
      }
      if (serviciosEl) {
        const rect = serviciosEl.getBoundingClientRect();
        serviciosTop = rect.top;
        serviciosBottom = rect.bottom;
        isOverLightSection =
          mouseY >= serviciosTop && mouseY <= serviciosBottom;
      } else {
        isOverLightSection = false;
      }
    };

    const snapAllNodesTo = (x: number, y: number) => {
      for (let t = 0; t < NUM_TUBES; t++) {
        const tube = tubes[t];
        for (let i = 0; i < POINTS; i++) {
          tube.x[i] = x;
          tube.y[i] = y;
          tube.vx[i] = 0;
          tube.vy[i] = 0;
          tube.rx[i] = x;
          tube.ry[i] = y;
        }
      }
    };

    const renderFrame = (now: number) => {
      const dt = Math.min((now - lastFrameTime) / 1000, 0.05);
      lastFrameTime = now;
      const timeSec = now * 0.001;

      updateServiciosBounds(now);

      // Transición suave entre modo oscuro y sección clara #servicios
      const targetLightBlend = isOverLightSection ? 1 : 0;
      lightSectionBlend += (targetLightBlend - lightSectionBlend) * Math.min(1, dt * 12);

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
          // Ease out cubic
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

      // Calcular velocidad instantánea del puntero y decaimiento suave
      const instDx = mouseX - prevMouseX;
      const instDy = mouseY - prevMouseY;
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      const instSpeed = Math.hypot(instDx, instDy);
      pointerSpeed = pointerSpeed * 0.86 + instSpeed * 0.14;

      // Desvanecimiento inteligente en reposo (~0.9s hasta 0)
      const timeSinceMove = now - lastMoveTimestamp;
      if (timeSinceMove > 45) {
        idleOpacity = Math.max(0, idleOpacity - dt / 0.9);
      } else {
        idleOpacity = Math.min(1, idleOpacity + dt * 9.5);
      }

      let maxNodeMotion = 0;
      const speedNorm = Math.min(pointerSpeed / 22, 1.35);

      // 1. Actualizar física de resortes, cadena con inercia y torsión helicoidal
      for (let t = 0; t < NUM_TUBES; t++) {
        const tube = tubes[t];
        const { x, y, vx, vy, rx, ry, mx, my, stiffness, damping } = tube;

        // Nodo 0 (cabeza): resorte hacia (mouseX, mouseY)
        vx[0] = (vx[0] + (mouseX - x[0]) * stiffness) * damping;
        vy[0] = (vy[0] + (mouseY - y[0]) * stiffness) * damping;
        x[0] += vx[0];
        y[0] += vy[0];

        // Nodos 1..POINTS-1: seguimiento en cadena con lerp decreciente e inercia de velocidad
        for (let i = 1; i < POINTS; i++) {
          const ratio = i / (POINTS - 1);
          const follow = 0.54 - ratio * 0.22; // Lerp decreciente hacia la cola
          const inertia = 0.36 + ratio * 0.08; // Conservación de inercia para látigos sedosos

          vx[i] = vx[i] * inertia + (x[i - 1] - x[i]) * follow;
          vy[i] = vy[i] * inertia + (y[i - 1] - y[i]) * follow;
          x[i] += vx[i];
          y[i] += vy[i];

          const motion = Math.abs(vx[i]) + Math.abs(vy[i]);
          if (motion > maxNodeMotion) maxNodeMotion = motion;
        }

        // Torsión helicoidal 3D perpendicular a la dirección del movimiento
        for (let i = 0; i < POINTS; i++) {
          if (i === 0 || i === POINTS - 1) {
            rx[i] = x[i];
            ry[i] = y[i];
            continue;
          }

          const dx = x[i - 1] - x[i + 1];
          const dy = y[i - 1] - y[i + 1];
          const len = Math.hypot(dx, dy);

          if (len > 0.001) {
            const nx = dx / len;
            const ny = dy / len;
            // Vector perpendicular normalizado (-ny, nx)
            const perpX = -ny;
            const perpY = nx;

            // Spread dinámico con velocidad y curva de campana a lo largo de la cola
            const spread =
              (2.6 + speedNorm * 10.5) * segBell[i] * (0.35 + 0.65 * idleOpacity);
            const offset =
              Math.sin(timeSec * 3.2 - i * 0.34 + t * 1.25) * spread;

            rx[i] = x[i] + perpX * offset;
            ry[i] = y[i] + perpY * offset;
          } else {
            rx[i] = x[i];
            ry[i] = y[i];
          }
        }

        // Calcular puntos medios para quadraticCurveTo continuo
        for (let i = 0; i < POINTS - 1; i++) {
          mx[i] = (rx[i] + rx[i + 1]) * 0.5;
          my[i] = (ry[i] + ry[i + 1]) * 0.5;
        }
      }

      // 2. Limpiar canvas y dibujar las dos capas luminosas
      ctx.clearRect(0, 0, width, height);

      if (idleOpacity > 0.004) {
        const useSourceOver = lightSectionBlend > 0.45;
        const luminanceScale = 1 - 0.25 * lightSectionBlend; // Oscurece 25% sobre #servicios
        const haloWidthScale = 1 - 0.28 * lightSectionBlend;

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // CAPA 1: Halo Volumétrico (10px a 16px en el pico, baja opacidad 0.14 a 0.22)
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
            if (w < 0.35 || a < 0.005) continue;

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

        // CAPA 2A: Tubo Principal saturado (3.5px a 5px en el pico)
        for (let t = 0; t < NUM_TUBES; t++) {
          const tube = tubes[t];
          const { rx, ry, mx, my, peakCoreWidth } = tube;
          const r = Math.round(activeColors[t][0] * luminanceScale);
          const g = Math.round(activeColors[t][1] * luminanceScale);
          const b = Math.round(activeColors[t][2] * luminanceScale);

          for (let i = 0; i < POINTS - 2; i++) {
            const w = peakCoreWidth * segThickness[i];
            const a = 0.86 * idleOpacity * segAlpha[i];
            if (w < 0.25 || a < 0.008) continue;

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

        // CAPA 2B: Núcleo Blanco ultrafino (1.2px) para brillo cilíndrico 3D
        const coreWhiteChannel = Math.round(255 - 25 * lightSectionBlend);
        for (let t = 0; t < NUM_TUBES; t++) {
          const tube = tubes[t];
          const { rx, ry, mx, my } = tube;

          for (let i = 0; i < POINTS - 4; i++) {
            const w = 1.2 * segThickness[i];
            const a =
              (0.85 - 0.22 * lightSectionBlend) * idleOpacity * segAlpha[i];
            if (w < 0.2 || a < 0.01) continue;

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

      // Detener requestAnimationFrame cuando la estela se desvaneció y está en reposo (0% CPU en idle)
      if (
        idleOpacity <= 0.004 &&
        maxNodeMotion < 0.08 &&
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
        lastFrameTime = performance.now();
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMoveTimestamp = now;

      if (!pointerInitialized) {
        pointerInitialized = true;
        prevMouseX = mouseX;
        prevMouseY = mouseY;
        snapAllNodesTo(mouseX, mouseY);
      }

      // Actualizar inmediatamente si entramos o salimos de #servicios con los bounds cacheados
      if (serviciosTop !== -1 || serviciosBottom !== -1) {
        isOverLightSection =
          mouseY >= serviciosTop && mouseY <= serviciosBottom;
      }

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
      idleOpacity = Math.max(idleOpacity, 0.75);
      ensureLoopRunning();
    };

    const handleScroll = () => {
      lastRectUpdate = 0; // Forzar actualización de rect en el próximo frame activo
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", handleScroll);
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
