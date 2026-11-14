"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { MISSIONS, type BusinessCategory } from "@/data/ellikData";
import { EllikMark } from "./EllikLogo";
import { MissionVisualSurface } from "./MissionVisualSurface";

interface HeroSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

export function HeroSection({ onOpenDrawer }: HeroSectionProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const surfaceRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Estado orbital y arrastre manual con inercia
  const orbitAngleRef = useRef<number>(22);
  const angularVelocityRef = useRef<number>(0);
  const baseSpeedFactorRef = useRef<number>(1);
  const targetSpeedFactorRef = useRef<number>(1);

  const isDraggingRef = useRef<boolean>(false);
  const dragLastXRef = useRef<number>(0);
  const totalDragDistanceRef = useRef<number>(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [radiusZ, setRadiusZ] = useState<number>(340);

  // Camera Tilt: inclinación suave de perspectiva con el mouse
  const pointerNormX = useMotionValue(0);
  const pointerNormY = useMotionValue(-0.3);

  const cameraRotateX = useSpring(
    useTransform(pointerNormY, [-0.5, 0.5], [8, -8]),
    { stiffness: 120, damping: 24 }
  );
  const cameraRotateY = useSpring(
    useTransform(pointerNormX, [-0.5, 0.5], [-10, 10]),
    { stiffness: 120, damping: 24 }
  );

  useEffect(() => {
    const updateRadius = () => {
      const vw = window.innerWidth;
      if (vw < 768) {
        setRadiusZ(165);
      } else if (vw < 1180) {
        setRadiusZ(260);
      } else {
        setRadiusZ(340);
      }
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragLastXRef.current;
      dragLastXRef.current = e.clientX;
      totalDragDistanceRef.current += Math.abs(dx);

      const angleDelta = dx * 0.34;
      orbitAngleRef.current += angleDelta;
      angularVelocityRef.current = angleDelta;
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, []);

  useAnimationFrame((_, delta) => {
    if (!ringRef.current) return;

    const dt = Math.min(delta, 50) / 1000;
    baseSpeedFactorRef.current +=
      (targetSpeedFactorRef.current - baseSpeedFactorRef.current) * 0.08;

    if (!isDraggingRef.current) {
      orbitAngleRef.current += angularVelocityRef.current;
      angularVelocityRef.current *= 0.94;
      if (Math.abs(angularVelocityRef.current) < 0.005) {
        angularVelocityRef.current = 0;
      }

      orbitAngleRef.current += dt * 11 * baseSpeedFactorRef.current;
    }

    ringRef.current.style.transform = `rotateY(${orbitAngleRef.current.toFixed(
      3
    )}deg)`;

    // Atenuación sutil de brillo cuando cada panel pasa por detrás (-Z) de la estrella
    for (let i = 0; i < MISSIONS.length; i++) {
      const surfaceEl = surfaceRefs.current[i];
      if (!surfaceEl) continue;

      const worldDeg = orbitAngleRef.current + i * 90;
      const zCos = Math.cos((worldDeg * Math.PI) / 180);
      const brightness = zCos >= 0 ? 1 : 0.62 + (zCos + 1) * 0.38;
      surfaceEl.style.filter = `brightness(${brightness.toFixed(3)})`;
    }
  });

  const handleStagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const ny = (e.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    pointerNormX.set(nx);
    pointerNormY.set(ny);
  };

  const handleStagePointerLeave = () => {
    pointerNormX.set(0);
    pointerNormY.set(-0.3);
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragLastXRef.current = e.clientX;
    totalDragDistanceRef.current = 0;
    angularVelocityRef.current = 0;
  };

  const handlePanelEnter = (idx: number) => {
    targetSpeedFactorRef.current = 0.05;
    setHoveredIndex(idx);
  };

  const handlePanelLeave = () => {
    targetSpeedFactorRef.current = 1;
    setHoveredIndex(null);
  };

  const handlePanelClick = (missionId: string) => {
    if (totalDragDistanceRef.current > 8) return;
    const target =
      document.getElementById(missionId) ??
      document.getElementById("proyectos");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-x-hidden flex flex-col justify-between pt-24 pb-12 lg:pt-28 lg:pb-14"
    >
      {/* Escenario CSS 3D Real (perspective: 1400px, preserve-3d) */}
      <div
        ref={stageRef}
        data-cursor="orbit"
        onPointerMove={handleStagePointerMove}
        onPointerLeave={handleStagePointerLeave}
        onPointerDown={handleStagePointerDown}
        className="perspective-1400 relative my-auto flex w-full min-h-[430px] sm:min-h-[480px] md:min-h-[540px] items-center justify-center touch-pan-y select-none"
      >
        <motion.div
          style={{
            rotateX: cameraRotateX,
            rotateY: cameraRotateY,
          }}
          className="preserve-3d relative flex h-[340px] w-full items-center justify-center"
        >
          {/* A. EL NÚCLEO CENTRAL: LA ESTRELLA ELLIK (translateZ: 0px) */}
          <div
            style={{ transform: "translate3d(0px, 0px, 0px)" }}
            className="pointer-events-none relative flex flex-col items-center justify-center text-center"
          >
            <div className="relative flex h-28 w-28 md:h-36 md:w-36 items-center justify-center">
              <div
                className="animate-pulse-star absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%)",
                }}
              />
              <EllikMark className="animate-pulse-star relative h-16 w-16 md:h-20 md:w-20 text-[#FFFFFF]" />
            </div>

            <h1
              className="mt-1 font-display font-bold uppercase tracking-[0.22em] text-[#FFFFFF] pl-[0.22em] leading-[0.95]"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
            >
              ELLIK
            </h1>
            <p className="mt-2 font-serif italic text-2xl md:text-3xl text-[#F4F1EA]">
              Tu negocio en órbita.
            </p>
          </div>

          {/* B. LAS 4 PÁGINAS ORBITANDO EN 3D REAL (0°, 90°, 180°, 270°) */}
          <div
            ref={ringRef}
            className="preserve-3d pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            {MISSIONS.map((mission, idx) => {
              const angleDeg = idx * 90;
              const isHovered = hoveredIndex === idx;
              const isDimmed = hoveredIndex !== null && hoveredIndex !== idx;

              return (
                <div
                  key={mission.id}
                  data-cursor="view"
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => handlePanelEnter(idx)}
                  onMouseLeave={handlePanelLeave}
                  onFocus={() => handlePanelEnter(idx)}
                  onBlur={handlePanelLeave}
                  onClick={() => handlePanelClick(mission.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePanelClick(mission.id);
                    }
                  }}
                  aria-label={`${mission.title} — Ir al proyecto`}
                  style={{
                    transform: `rotateY(${angleDeg}deg) translateZ(${radiusZ}px)`,
                  }}
                  className="pointer-events-auto absolute w-[190px] h-[240px] md:w-[250px] md:h-[310px] cursor-pointer"
                >
                  <div
                    ref={(el) => {
                      surfaceRefs.current[idx] = el;
                    }}
                    className={`group flex h-full w-full flex-col bg-[#09090B] border transition-all duration-300 ${
                      isHovered
                        ? "border-[#FFFFFF]"
                        : "border-[rgba(255,255,255,0.18)]"
                    } ${isDimmed ? "opacity-35" : "opacity-100"}`}
                  >
                    <div className="flex-1 w-full overflow-hidden">
                      <MissionVisualSurface mission={mission} />
                    </div>

                    {/* Barra inferior discreta de 32px */}
                    <div className="h-8 shrink-0 border-t border-[rgba(255,255,255,0.14)] bg-[#09090B] px-3 flex items-center justify-between gap-2">
                      <span className="font-sans text-xs text-[#8A8A93] group-hover:text-[#FFFFFF] transition-colors truncate">
                        {mission.shortTitle}
                      </span>
                      <span className="font-mono text-[11px] text-[#FFFFFF] shrink-0">
                        ↗
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* C. Cierre del Hero limpio y con aire */}
      <div className="relative z-20 flex flex-col items-center text-center pt-6">
        <p className="font-sans text-sm md:text-base text-[#8A8A93] max-w-md text-center leading-relaxed">
          Diseño y desarrollo web para comercios y marcas que quieren recibir
          pedidos sin fricción.
        </p>

        <button
          type="button"
          data-cursor="action"
          onClick={() => onOpenDrawer()}
          className="mt-7 border border-[rgba(255,255,255,0.28)] bg-transparent px-7 py-3.5 font-mono text-xs tracking-[0.18em] uppercase text-[#FFFFFF] transition-colors duration-200 hover:bg-[#FFFFFF] hover:text-[#050505] hover:border-[#FFFFFF]"
        >
          AGENDAR LLAMADA DE 10 MIN
        </button>
      </div>
    </section>
  );
}
