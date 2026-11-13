"use client";

import React, { useEffect, useRef } from "react";

interface Star3D {
  x: number;
  y: number;
  z: number;
  prevZ: number;
  size: number;
  warm: boolean;
  alpha: number;
}

interface OrbitSpec {
  radius: number;
  tiltX: number;
  tiltY: number;
  speedZ: number;
  speedY: number;
  phase: number;
  alpha: number;
  hasSatellite: boolean;
}

function rotatePoint3D(
  x: number,
  y: number,
  z: number,
  rx: number,
  ry: number,
  rz: number
): [number, number, number] {
  // Rotate around Z
  const cosZ = Math.cos(rz);
  const sinZ = Math.sin(rz);
  const x1 = x * cosZ - y * sinZ;
  const y1 = x * sinZ + y * cosZ;
  const z1 = z;

  // Rotate around X
  const cosX = Math.cos(rx);
  const sinX = Math.sin(rx);
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;
  const x2 = x1;

  // Rotate around Y
  const cosY = Math.cos(ry);
  const sinY = Math.sin(ry);
  const x3 = x2 * cosY + z2 * sinY;
  const z3 = -x2 * sinY + z2 * cosY;
  const y3 = y2;

  return [x3, y3, z3];
}

export function OrbitalBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetryRef = useRef<HTMLSpanElement | null>(null);
  const crossRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const STAR_COUNT = 220;
    const DEPTH = 1600;
    const FOV = 620;

    const stars: Star3D[] = Array.from({ length: STAR_COUNT }, () => {
      const z = Math.random() * DEPTH + 60;
      return {
        x: (Math.random() - 0.5) * 2600,
        y: (Math.random() - 0.5) * 1800,
        z,
        prevZ: z,
        size: Math.random() * 1.35 + 0.55,
        warm: Math.random() > 0.65,
        alpha: Math.random() * 0.55 + 0.25,
      };
    });

    const orbits: OrbitSpec[] = [
      {
        radius: 440,
        tiltX: 1.05,
        tiltY: 0.28,
        speedZ: 0.0014,
        speedY: 0.0007,
        phase: 0.4,
        alpha: 0.075,
        hasSatellite: true,
      },
      {
        radius: 560,
        tiltX: -0.78,
        tiltY: 0.55,
        speedZ: -0.0009,
        speedY: 0.0005,
        phase: 2.2,
        alpha: 0.055,
        hasSatellite: true,
      },
      {
        radius: 300,
        tiltX: 0.58,
        tiltY: -0.62,
        speedZ: 0.0018,
        speedY: -0.0006,
        phase: 4.1,
        alpha: 0.09,
        hasSatellite: false,
      },
    ];

    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    let lastScrollY = window.scrollY;
    let warpBoost = 0;
    let lastTelemetryBucket = "";

    const handlePointerMove = (e: PointerEvent) => {
      targetMouseX = (e.clientX / Math.max(width, 1) - 0.5) * 2;
      targetMouseY = (e.clientY / Math.max(height, 1) - 0.5) * 2;
    };

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      warpBoost = Math.min(warpBoost + delta * 0.16, 26);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    let time = 0;
    let rafId = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Suavizado de cámara y velocidad warp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      warpBoost *= 0.92;

      const baseSpeed = prefersReducedMotion ? 0 : 1.1 + warpBoost;
      if (!prefersReducedMotion) {
        time += 1;
      }

      const cx = width * 0.52 - mouseX * 48;
      const cy = height * 0.48 - mouseY * 32;

      // 1. Campo estelar 3D con estelas de velocidad en scroll
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.prevZ = s.z;
        s.z -= baseSpeed;

        if (s.z <= 25) {
          s.x = (Math.random() - 0.5) * 2600;
          s.y = (Math.random() - 0.5) * 1800;
          s.z = DEPTH;
          s.prevZ = DEPTH;
        }

        const scale = FOV / s.z;
        const sx = cx + s.x * scale;
        const sy = cy + s.y * scale;

        if (sx < -40 || sx > width + 40 || sy < -40 || sy > height + 40) {
          continue;
        }

        const depthFade = Math.max(0, Math.min(1, 1 - s.z / DEPTH));
        const finalAlpha = s.alpha * (0.3 + depthFade * 0.7);
        const color = s.warm
          ? `rgba(244, 241, 234, ${finalAlpha.toFixed(3)})`
          : `rgba(255, 255, 255, ${finalAlpha.toFixed(3)})`;

        if (warpBoost > 1.2) {
          const prevScale = FOV / Math.min(s.prevZ + warpBoost * 1.4, DEPTH);
          const px = cx + s.x * prevScale;
          const py = cy + s.y * prevScale;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(0.6, s.size * depthFade * 1.15);
          ctx.stroke();
        } else {
          const radius = Math.max(0.5, s.size * (0.4 + depthFade * 0.9));
          ctx.fillStyle = color;
          ctx.fillRect(sx - radius * 0.5, sy - radius * 0.5, radius, radius);
        }
      }

      // 2. Anillos orbitales 3D proyectados
      const orbitCenterX = width * (width >= 1024 ? 0.68 : 0.55) - mouseX * 36;
      const orbitCenterY = height * 0.48 - mouseY * 26;
      const orbitScaleBase = Math.min(width, height) / 960;
      const responsiveFactor = Math.max(0.58, Math.min(1.18, orbitScaleBase));
      const segments = 96;

      for (let oIdx = 0; oIdx < orbits.length; oIdx++) {
        const orbit = orbits[oIdx];
        const rx = orbit.tiltX + mouseY * 0.18;
        const ry = orbit.tiltY + mouseX * 0.22 + time * orbit.speedY;
        const rz = time * orbit.speedZ;
        const r = orbit.radius * responsiveFactor;

        ctx.beginPath();
        let started = false;

        for (let step = 0; step <= segments; step++) {
          const theta = (step / segments) * Math.PI * 2;
          const vx = Math.cos(theta) * r;
          const vy = Math.sin(theta) * r;
          const [px, py, pz] = rotatePoint3D(vx, vy, 0, rx, ry, rz);

          const persp = 900 / (900 + pz);
          const screenX = orbitCenterX + px * persp;
          const screenY = orbitCenterY + py * persp;

          if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${orbit.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Satélite recorriendo la órbita 3D
        if (orbit.hasSatellite) {
          const satAngle = orbit.phase + time * (orbit.speedZ * 4.5 + 0.004);
          const sx3 = Math.cos(satAngle) * r;
          const sy3 = Math.sin(satAngle) * r;
          const [px, py, pz] = rotatePoint3D(sx3, sy3, 0, rx, ry, rz);
          const persp = 900 / (900 + pz);
          const screenX = orbitCenterX + px * persp;
          const screenY = orbitCenterY + py * persp;

          const satAlpha = pz < 0 ? 0.85 : 0.3;
          ctx.fillStyle = `rgba(244, 241, 234, ${satAlpha})`;
          ctx.fillRect(screenX - 2, screenY - 2, 4, 4);

          ctx.strokeStyle = `rgba(255, 255, 255, ${(satAlpha * 0.35).toFixed(2)})`;
          ctx.strokeRect(screenX - 6, screenY - 6, 12, 12);
        }
      }

      // 3. Actualización ligera de telemetría y retículas sin re-render de React
      const scrollRatio = Math.min(
        100,
        Math.round(
          (window.scrollY /
            Math.max(
              1,
              document.documentElement.scrollHeight - window.innerHeight
            )) *
            100
        )
      );
      const velVal = (1.0 + warpBoost * 0.45).toFixed(1);
      const telemetryText = `ALT ${String(scrollRatio).padStart(
        3,
        "0"
      )}% // VEL ${velVal}x // CAM ${mouseX >= 0 ? "+" : ""}${mouseX.toFixed(
        2
      )}`;

      if (telemetryRef.current && telemetryText !== lastTelemetryBucket) {
        telemetryRef.current.textContent = telemetryText;
        lastTelemetryBucket = telemetryText;
      }

      const crossDeg = (window.scrollY * 0.08 + mouseX * 18).toFixed(1);
      for (const el of crossRefs.current) {
        if (el) {
          el.style.transform = `rotate(${crossDeg}deg)`;
        }
      }

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Lienzo 3D en tiempo real (Campo estelar + Órbitas 3D) */}
      <canvas ref={canvasRef} className="block h-full w-full" />

      {/* Línea vertical de eje orbital tenue */}
      <div
        className="absolute top-0 bottom-0 left-1/2 hidden lg:block w-px -translate-x-1/2"
        style={{ backgroundColor: "var(--orbital-line)" }}
      />

      {/* Línea horizontal de referencia ecuatorial muy sutil */}
      <div
        className="absolute left-0 right-0 top-[52%] h-px"
        style={{ backgroundColor: "var(--orbital-line)" }}
      />

      {/* Telemetría dinámica en tiempo real */}
      <span
        ref={telemetryRef}
        className="fixed bottom-8 left-10 hidden lg:inline-block font-mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] opacity-70"
      >
        ALT 000% // VEL 1.0x // CAM +0.00
      </span>

      {/* Marcas de retícula astronómica (+) rotatorias */}
      <span
        ref={(el) => {
          crossRefs.current[0] = el;
        }}
        className="fixed top-20 left-6 lg:left-10 font-mono text-[11px] leading-none text-[var(--text-muted)] opacity-55 inline-block transition-transform duration-75"
      >
        +
      </span>
      <span
        ref={(el) => {
          crossRefs.current[1] = el;
        }}
        className="fixed top-20 right-6 lg:right-10 font-mono text-[11px] leading-none text-[var(--text-muted)] opacity-55 inline-block transition-transform duration-75"
      >
        +
      </span>
      <span
        ref={(el) => {
          crossRefs.current[2] = el;
        }}
        className="fixed bottom-20 left-6 lg:bottom-14 lg:left-10 font-mono text-[11px] leading-none text-[var(--text-muted)] opacity-55 inline-block transition-transform duration-75"
      >
        +
      </span>
      <span
        ref={(el) => {
          crossRefs.current[3] = el;
        }}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-10 font-mono text-[11px] leading-none text-[var(--text-muted)] opacity-55 inline-block transition-transform duration-75"
      >
        +
      </span>
    </div>
  );
}
