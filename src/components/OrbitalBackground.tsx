"use client";

import React, { useEffect, useRef } from "react";

const ORBITAL_RING_CSS = `
@keyframes ellik-orbit-cw {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes ellik-orbit-ccw {
  from { transform: rotate(0deg); }
  to { transform: rotate(-360deg); }
}
.ellik-orbit-cw {
  animation: ellik-orbit-cw 240s linear infinite;
  will-change: transform;
}
.ellik-orbit-ccw {
  animation: ellik-orbit-ccw 300s linear infinite;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .ellik-orbit-cw,
  .ellik-orbit-ccw {
    animation-play-state: paused;
  }
}
`;

interface Star {
  xNorm: number;
  yNorm: number;
  layer: 0 | 1 | 2; // 0 = lejana, 1 = media, 2 = cercana
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  tint: string;
  crosshair: boolean;
}

interface DustMote {
  xNorm: number;
  yNorm: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
}

interface ConstellationNode {
  rx: number; // Fracción X dentro de la sección (0..1)
  ry: number; // Fracción Y dentro de la sección (0..1)
  magnitude: number;
}

interface SectionConstellation {
  sectionId: string;
  nodes: ConstellationNode[];
  edges: [number, number][];
}

interface MeteorState {
  active: boolean;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  elapsed: number;
  duration: number;
  tailLength: number;
  nextSpawnAt: number;
}

const SECTION_CONSTELLATIONS: SectionConstellation[] = [
  {
    sectionId: "proyectos",
    nodes: [
      { rx: 0.56, ry: 0.08, magnitude: 2.5 },
      { rx: 0.67, ry: 0.15, magnitude: 2.0 },
      { rx: 0.82, ry: 0.12, magnitude: 2.3 },
      { rx: 0.92, ry: 0.23, magnitude: 1.9 },
      { rx: 0.79, ry: 0.3, magnitude: 2.2 },
      { rx: 0.64, ry: 0.27, magnitude: 1.8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [1, 5],
    ],
  },
  {
    sectionId: "contacto",
    nodes: [
      { rx: 0.66, ry: 0.14, magnitude: 2.3 },
      { rx: 0.78, ry: 0.1, magnitude: 2.0 },
      { rx: 0.91, ry: 0.22, magnitude: 2.4 },
      { rx: 0.86, ry: 0.42, magnitude: 1.9 },
      { rx: 0.73, ry: 0.36, magnitude: 2.1 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [1, 4],
    ],
  },
];

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function wrapCoord(val: number, max: number): number {
  const m = val % max;
  return m < 0 ? m + max : m;
}

export function OrbitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const rng = createSeededRandom(20261116);

    // Generación determinista de las 3 capas estelares
    const stars: Star[] = [];
    const warmStarTint = "#F4F1EA";
    const coolStarTint = "#E0EAFC";

    // Capa 0 (Lejana): diminutas, fijas y sobrias
    for (let i = 0; i < 115; i++) {
      stars.push({
        xNorm: rng(),
        yNorm: rng(),
        layer: 0,
        radius: 0.45 + rng() * 0.35,
        baseAlpha: 0.14 + rng() * 0.2,
        twinkleSpeed: 0,
        twinklePhase: 0,
        tint: rng() > 0.3 ? warmStarTint : coolStarTint,
        crosshair: false,
      });
    }

    // Capa 1 (Media): parpadeo sutil y paralaje moderado
    for (let i = 0; i < 68; i++) {
      stars.push({
        xNorm: rng(),
        yNorm: rng(),
        layer: 1,
        radius: 0.85 + rng() * 0.45,
        baseAlpha: 0.28 + rng() * 0.32,
        twinkleSpeed: 0.9 + rng() * 1.6,
        twinklePhase: rng() * Math.PI * 2,
        tint: rng() > 0.35 ? warmStarTint : coolStarTint,
        crosshair: false,
      });
    }

    // Capa 2 (Cercana): paralaje activo con mouse/scroll y microdestellos
    for (let i = 0; i < 28; i++) {
      stars.push({
        xNorm: rng(),
        yNorm: rng(),
        layer: 2,
        radius: 1.3 + rng() * 0.65,
        baseAlpha: 0.48 + rng() * 0.42,
        twinkleSpeed: 0.7 + rng() * 1.2,
        twinklePhase: rng() * Math.PI * 2,
        tint: rng() > 0.4 ? warmStarTint : "#FFFFFF",
        crosshair: i < 8,
      });
    }

    // Polvo cósmico flotante muy fino
    const dustMotes: DustMote[] = [];
    for (let i = 0; i < 24; i++) {
      dustMotes.push({
        xNorm: rng(),
        yNorm: rng(),
        radius: 0.6 + rng() * 0.9,
        alpha: 0.04 + rng() * 0.06,
        vx: (rng() - 0.5) * 0.004,
        vy: -0.002 - rng() * 0.004,
      });
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    // Pre-cálculo de atmósfera en canvas offscreen (evita crear gradientes en cada frame)
    const ATMOSPHERE_PAD = 48;
    const atmosphereCanvas = document.createElement("canvas");
    const atmosphereCtx = atmosphereCanvas.getContext("2d");

    const buildAtmosphereCache = () => {
      if (!atmosphereCtx || width <= 0 || height <= 0) return;
      const aw = width + ATMOSPHERE_PAD * 2;
      const ah = height + ATMOSPHERE_PAD * 2;
      atmosphereCanvas.width = aw;
      atmosphereCanvas.height = ah;
      atmosphereCtx.clearRect(0, 0, aw, ah);

      const deepBlueGrad = atmosphereCtx.createRadialGradient(
        width * 0.28 + ATMOSPHERE_PAD,
        height * 0.35 + ATMOSPHERE_PAD,
        0,
        width * 0.28 + ATMOSPHERE_PAD,
        height * 0.35 + ATMOSPHERE_PAD,
        Math.max(width, height) * 0.58
      );
      deepBlueGrad.addColorStop(0, "rgba(18, 34, 62, 0.14)");
      deepBlueGrad.addColorStop(0.55, "rgba(12, 22, 40, 0.05)");
      deepBlueGrad.addColorStop(1, "rgba(5, 5, 5, 0)");

      atmosphereCtx.fillStyle = deepBlueGrad;
      atmosphereCtx.fillRect(0, 0, aw, ah);

      const warmDustGrad = atmosphereCtx.createRadialGradient(
        width * 0.76 + ATMOSPHERE_PAD,
        height * 0.62 + ATMOSPHERE_PAD,
        0,
        width * 0.76 + ATMOSPHERE_PAD,
        height * 0.62 + ATMOSPHERE_PAD,
        Math.max(width, height) * 0.45
      );
      warmDustGrad.addColorStop(0, "rgba(244, 241, 234, 0.032)");
      warmDustGrad.addColorStop(0.6, "rgba(244, 241, 234, 0.009)");
      warmDustGrad.addColorStop(1, "rgba(5, 5, 5, 0)");

      atmosphereCtx.fillStyle = warmDustGrad;
      atmosphereCtx.fillRect(0, 0, aw, ah);
    };

    const sectionDocBounds: Record<
      string,
      { left: number; top: number; width: number; height: number }
    > = {};
    let serviciosDocTop = -1;
    let serviciosDocBottom = -1;

    const refreshDocBounds = () => {
      const sy = window.scrollY;
      for (const c of SECTION_CONSTELLATIONS) {
        const el = document.getElementById(c.sectionId);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        sectionDocBounds[c.sectionId] = {
          left: r.left,
          top: r.top + sy,
          width: el.offsetWidth || r.width,
          height: el.offsetHeight || r.height,
        };
      }
      const servEl = document.getElementById("servicios");
      if (servEl) {
        const sr = servEl.getBoundingClientRect();
        serviciosDocTop = sr.top + sy;
        serviciosDocBottom = serviciosDocTop + servEl.offsetHeight;
      } else {
        serviciosDocTop = -1;
        serviciosDocBottom = -1;
      }
    };

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildAtmosphereCache();
      refreshDocBounds();
    };

    resizeCanvas();
    let resizeTimer = 0;
    const handleResize = () => {
      resizeCanvas();
    };
    const handleDocResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshDocBounds, 150);
    };
    const docRo = new ResizeObserver(handleDocResize);
    docRo.observe(document.body);
    window.addEventListener("resize", handleResize);

    // Estado de puntero y scroll para paralaje y efecto warp
    let targetMouseX = 0;
    let targetMouseY = 0;
    let smoothMouseX = 0;
    let smoothMouseY = 0;

    let lastScrollY = window.scrollY;
    let smoothScrollVel = 0;

    const handlePointerMove = (e: PointerEvent) => {
      if (width <= 0 || height <= 0) return;
      targetMouseX = e.clientX / width - 0.5;
      targetMouseY = e.clientY / height - 0.5;
    };

    const handlePointerLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", handlePointerLeave);

    // Progreso de trazado por constelación (0..1)
    const constellationProgress: Record<string, number> = {};
    for (const c of SECTION_CONSTELLATIONS) {
      constellationProgress[c.sectionId] = prefersReducedMotion ? 1 : 0;
    }

    // Meteorito silencioso cada 12 a 18 segundos
    const meteor: MeteorState = {
      active: false,
      startX: 0,
      startY: 0,
      dx: 0,
      dy: 0,
      elapsed: 0,
      duration: 0.9,
      tailLength: 170,
      nextSpawnAt: performance.now() + 12000 + rng() * 6000,
    };

    const spawnMeteor = (nowMs: number) => {
      const fromRight = rng() > 0.35;
      meteor.active = true;
      meteor.elapsed = 0;
      meteor.duration = 0.78 + rng() * 0.28;
      meteor.tailLength = 150 + rng() * 90;
      meteor.startX = fromRight
        ? width * (0.58 + rng() * 0.38)
        : width * (0.12 + rng() * 0.3);
      meteor.startY = height * (0.06 + rng() * 0.34);

      const travelDist = 260 + rng() * 180;
      const angle = fromRight
        ? Math.PI * (0.76 + rng() * 0.08) // Diagonal hacia abajo-izquierda
        : Math.PI * (0.16 + rng() * 0.08); // Diagonal hacia abajo-derecha

      meteor.dx = Math.cos(angle) * travelDist;
      meteor.dy = Math.sin(angle) * travelDist;
      meteor.nextSpawnAt = nowMs + 12000 + rng() * 6000;
    };

    let rafId = 0;
    let prevTime = performance.now();

    const drawCosmicAtmosphere = (tSec: number) => {
      if (atmosphereCanvas.width === 0 || atmosphereCanvas.height === 0) return;
      const driftX = Math.sin(tSec * 0.06) * 20 + smoothMouseX * 14;
      const driftY = Math.cos(tSec * 0.05) * 16 + smoothMouseY * 10;
      ctx.drawImage(
        atmosphereCanvas,
        driftX - ATMOSPHERE_PAD,
        driftY - ATMOSPHERE_PAD
      );
    };

    const drawConstellations = (dt: number, currentScrollY: number) => {
      for (const constellation of SECTION_CONSTELLATIONS) {
        const bounds = sectionDocBounds[constellation.sectionId];
        if (!bounds) continue;

        const rectTop = bounds.top - currentScrollY;
        const rectBottom = rectTop + bounds.height;
        const inView = rectTop < height * 0.88 && rectBottom > height * 0.1;

        if (!prefersReducedMotion) {
          const current = constellationProgress[constellation.sectionId] ?? 0;
          if (inView) {
            constellationProgress[constellation.sectionId] = Math.min(
              1,
              current + dt * 0.75
            );
          } else if (rectTop > height * 1.15) {
            // Reinicio sutil solo si vuelve muy arriba para mantener vivo el recorrido
            constellationProgress[constellation.sectionId] = Math.max(
              0,
              current - dt * 1.2
            );
          }
        }

        const progress = constellationProgress[constellation.sectionId] ?? 0;
        if (progress <= 0.01 || !inView) continue;

        const visibilityFade =
          Math.min(
            1,
            Math.max(0, (height * 0.96 - rectTop) / (height * 0.25))
          ) *
          Math.min(1, Math.max(0, rectBottom / (height * 0.22)));

        if (visibilityFade <= 0.02) continue;

        // Proyección de nodos estelares en coordenadas de pantalla con paralaje suave
        const pMouseX = -smoothMouseX * 14;
        const pMouseY = -smoothMouseY * 10;

        const screenNodes = constellation.nodes.map((node) => ({
          x: bounds.left + bounds.width * node.rx + pMouseX,
          y: rectTop + bounds.height * node.ry + pMouseY,
          magnitude: node.magnitude,
        }));

        // Líneas geométricas progresivas (rgba(255,255,255,0.08))
        const totalEdges = constellation.edges.length;
        const scaledProgress = progress * totalEdges;

        ctx.lineWidth = 1;
        for (let eIdx = 0; eIdx < totalEdges; eIdx++) {
          const edgeFraction = Math.max(
            0,
            Math.min(1, scaledProgress - eIdx)
          );
          if (edgeFraction <= 0) continue;

          const [aIdx, bIdx] = constellation.edges[eIdx];
          const a = screenNodes[aIdx];
          const b = screenNodes[bIdx];

          const curX = a.x + (b.x - a.x) * edgeFraction;
          const curY = a.y + (b.y - a.y) * edgeFraction;

          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.08 * visibilityFade).toFixed(4)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(curX, curY);
          ctx.stroke();
        }

        // Estrellas principales de la constelación
        const nodeReveal = Math.min(1, progress * 2.2);
        for (let nIdx = 0; nIdx < screenNodes.length; nIdx++) {
          const node = screenNodes[nIdx];
          const nodeThreshold = nIdx / Math.max(screenNodes.length, 1);
          const localReveal = Math.max(
            0,
            Math.min(1, (nodeReveal - nodeThreshold * 0.5) * 2)
          );
          if (localReveal <= 0) continue;

          const alpha = visibilityFade * localReveal;

          // Anillo mínimo de telescopio alrededor del vértice principal
          if (nIdx === 0 || nIdx === 2) {
            ctx.strokeStyle = `rgba(244, 241, 234, ${(0.14 * alpha).toFixed(4)})`;
            ctx.lineWidth = 0.75;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.magnitude * 3.1, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = `rgba(244, 241, 234, ${(0.58 * alpha).toFixed(4)})`;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.magnitude * 0.75, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawMeteor = (dt: number, nowMs: number) => {
      if (prefersReducedMotion) return;

      if (!meteor.active && nowMs >= meteor.nextSpawnAt) {
        spawnMeteor(nowMs);
      }

      if (!meteor.active) return;

      meteor.elapsed += dt;
      const p = meteor.elapsed / meteor.duration;
      if (p >= 1) {
        meteor.active = false;
        return;
      }

      // Curva suave de entrada/salida y desaceleración leve
      const eased = 1 - Math.pow(1 - p, 2);
      const envelope = Math.sin(p * Math.PI);

      const headX = meteor.startX + meteor.dx * eased;
      const headY = meteor.startY + meteor.dy * eased;
      const dirLen = Math.hypot(meteor.dx, meteor.dy) || 1;
      const ux = meteor.dx / dirLen;
      const uy = meteor.dy / dirLen;

      const tailX = headX - ux * meteor.tailLength * envelope;
      const tailY = headY - uy * meteor.tailLength * envelope;

      const grad = ctx.createLinearGradient(tailX, tailY, headX, headY);
      grad.addColorStop(0, "rgba(244, 241, 234, 0)");
      grad.addColorStop(
        0.72,
        `rgba(244, 241, 234, ${(0.22 * envelope).toFixed(4)})`
      );
      grad.addColorStop(
        1,
        `rgba(255, 255, 255, ${(0.82 * envelope).toFixed(4)})`
      );

      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.9;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${(0.9 * envelope).toFixed(4)})`;
      ctx.beginPath();
      ctx.arc(headX, headY, 1.1, 0, Math.PI * 2);
      ctx.fill();
    };

    const renderFrame = (nowMs: number) => {
      const dt = Math.min((nowMs - prevTime) / 1000, 0.05);
      prevTime = nowMs;
      const tSec = nowMs / 1000;

      // Velocidad vertical del scroll para el efecto warp
      const currentScrollY = window.scrollY;

      // Omitir repintado cuando #servicios opaco (#F4F1EA) cubre toda la ventana
      if (
        serviciosDocTop !== -1 &&
        serviciosDocTop - currentScrollY <= 0 &&
        serviciosDocBottom - currentScrollY >= height
      ) {
        lastScrollY = currentScrollY;
        smoothScrollVel = 0;
        if (!prefersReducedMotion && !document.hidden) {
          rafId = window.requestAnimationFrame(renderFrame);
        } else {
          rafId = 0;
        }
        return;
      }

      // Suavizado exponencial del puntero
      const pointerEase = 1 - Math.exp(-dt * 6.5);
      smoothMouseX += (targetMouseX - smoothMouseX) * pointerEase;
      smoothMouseY += (targetMouseY - smoothMouseY) * pointerEase;

      const rawScrollVel =
        dt > 0.001 ? (currentScrollY - lastScrollY) / dt : 0;
      lastScrollY = currentScrollY;

      const clampedVel = Math.max(-3200, Math.min(3200, rawScrollVel));
      const velFollow =
        Math.abs(clampedVel) > Math.abs(smoothScrollVel)
          ? 1 - Math.exp(-dt * 18)
          : 1 - Math.exp(-dt * 6.5);
      smoothScrollVel += (clampedVel - smoothScrollVel) * velFollow;
      if (Math.abs(smoothScrollVel) < 4) smoothScrollVel = 0;

      ctx.clearRect(0, 0, width, height);

      drawCosmicAtmosphere(tSec);

      // Polvo cósmico flotante (sin allocs de strings rgba por frame)
      ctx.fillStyle = warmStarTint;
      for (let i = 0; i < dustMotes.length; i++) {
        const mote = dustMotes[i];
        if (!prefersReducedMotion) {
          mote.xNorm = wrapCoord(mote.xNorm + mote.vx * dt, 1);
          mote.yNorm = wrapCoord(mote.yNorm + mote.vy * dt, 1);
        }
        const mx = wrapCoord(
          mote.xNorm * width - smoothMouseX * 8,
          width
        );
        const my = wrapCoord(
          mote.yNorm * height - currentScrollY * 0.05 - smoothMouseY * 8,
          height
        );

        const size = mote.radius * 1.6;
        ctx.globalAlpha = mote.alpha;
        ctx.fillRect(mx - size * 0.5, my - size * 0.5, size, size);
      }

      // 3 Capas de estrellas con paralaje y estiramiento warp por scroll
      const warpFactor = prefersReducedMotion ? 0 : smoothScrollVel * 0.009;

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        let mouseMult = 2;
        let scrollMult = 0.025;
        let warpMult = 0.25;

        if (star.layer === 1) {
          mouseMult = 12;
          scrollMult = 0.11;
          warpMult = 0.72;
        } else if (star.layer === 2) {
          mouseMult = 28;
          scrollMult = 0.26;
          warpMult = 1.45;
        }

        const sx = wrapCoord(
          star.xNorm * width - smoothMouseX * mouseMult,
          width
        );
        const sy = wrapCoord(
          star.yNorm * height -
            currentScrollY * scrollMult -
            smoothMouseY * mouseMult,
          height
        );

        let alpha = star.baseAlpha;
        if (star.layer > 0 && !prefersReducedMotion) {
          const twinkle =
            0.66 + 0.34 * Math.sin(tSec * star.twinkleSpeed + star.twinklePhase);
          alpha *= twinkle;
        }

        const streakY = Math.max(
          -26,
          Math.min(26, warpFactor * warpMult)
        );
        const absStreak = Math.abs(streakY);

        if (absStreak > 0.75) {
          // Trazo vertical estirado durante el scroll rápido (warp suave)
          ctx.globalAlpha = Math.min(1, alpha * (1 + absStreak * 0.025));
          ctx.strokeStyle = star.tint;
          ctx.lineWidth = star.radius * 1.15;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(sx, sy - streakY * 0.5);
          ctx.lineTo(sx, sy + streakY * 0.5);
          ctx.stroke();
        } else {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = star.tint;

          if (star.radius <= 0.85) {
            const d = star.radius * 2;
            ctx.fillRect(sx - star.radius, sy - star.radius, d, d);
          } else {
            ctx.beginPath();
            ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Destello cruciforme sutil solo en las estrellas cercanas principales
          if (star.crosshair && alpha > 0.4) {
            const arm = star.radius * 3.1;
            ctx.globalAlpha = alpha * 0.35;
            ctx.strokeStyle = star.tint;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(sx - arm, sy);
            ctx.lineTo(sx + arm, sy);
            ctx.moveTo(sx, sy - arm);
            ctx.lineTo(sx, sy + arm);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      drawConstellations(dt, currentScrollY);
      drawMeteor(dt, nowMs);

      if (!prefersReducedMotion && !document.hidden) {
        rafId = window.requestAnimationFrame(renderFrame);
      } else {
        rafId = 0;
      }
    };

    if (prefersReducedMotion) {
      const renderReduced = () => {
        ctx.clearRect(0, 0, width, height);
        drawCosmicAtmosphere(0);
        const scrollY = window.scrollY;
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const scrollMult =
            star.layer === 0 ? 0.025 : star.layer === 1 ? 0.11 : 0.26;
          const sx = star.xNorm * width;
          const sy = wrapCoord(star.yNorm * height - scrollY * scrollMult, height);
          ctx.globalAlpha = star.baseAlpha;
          ctx.fillStyle = star.tint;
          ctx.beginPath();
          ctx.arc(sx, sy, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        drawConstellations(0, scrollY);
      };
      renderReduced();
      window.addEventListener("scroll", renderReduced, { passive: true });
      return () => {
        window.clearTimeout(resizeTimer);
        docRo.disconnect();
        window.removeEventListener("scroll", renderReduced);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("blur", handlePointerLeave);
      };
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else if (!rafId) {
        prevTime = performance.now();
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (!document.hidden) {
      rafId = window.requestAnimationFrame(renderFrame);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.clearTimeout(resizeTimer);
      docRo.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <style>{ORBITAL_RING_CSS}</style>
      {/* Cosmos multicapa interactivo a 60fps: estrellas, warp de scroll, constelaciones y meteorito */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Dos anillos orbitales gigantes ultrafinos animados por compositor CSS */}
      <svg
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          className="ellik-orbit-cw"
          style={{ transformOrigin: "920px 440px" }}
        >
          <circle
            cx="920"
            cy="440"
            r="460"
            stroke="rgba(255, 255, 255, 0.045)"
            strokeWidth="1"
          />
        </g>

        <g
          className="ellik-orbit-ccw"
          style={{ transformOrigin: "720px 450px" }}
        >
          <ellipse
            cx="720"
            cy="450"
            rx="680"
            ry="270"
            transform="rotate(-16 720 450)"
            stroke="rgba(255, 255, 255, 0.045)"
            strokeWidth="1"
          />
        </g>
      </svg>
    </div>
  );
}
