"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  MISSIONS,
  type BusinessCategory,
  type Mission,
} from "@/data/ellikData";
import { MagneticButton } from "./AnimatedHeading";
import { EllikEmblem } from "./EllikLogo";

interface HeroSectionProps {
  onOpenDrawer: (preset?: { rubro?: BusinessCategory; plan?: string }) => void;
}

interface OrbitPanelConfig {
  key: string;
  mission: Mission;
  baseAngle: number;
  offsetY: number;
  tiltX: number;
  tiltZ: number;
  variant: 0 | 1 | 2 | 3 | 4 | 5;
}

const ORBIT_PANELS: OrbitPanelConfig[] = [
  {
    key: "orbit-panel-1",
    mission: MISSIONS[0],
    baseAngle: 0,
    offsetY: -125,
    tiltX: 4,
    tiltZ: -3,
    variant: 0,
  },
  {
    key: "orbit-panel-2",
    mission: MISSIONS[2],
    baseAngle: 60,
    offsetY: 95,
    tiltX: -3,
    tiltZ: 2,
    variant: 1,
  },
  {
    key: "orbit-panel-3",
    mission: MISSIONS[1],
    baseAngle: 120,
    offsetY: -55,
    tiltX: 2,
    tiltZ: -2,
    variant: 2,
  },
  {
    key: "orbit-panel-4",
    mission: MISSIONS[3],
    baseAngle: 180,
    offsetY: 130,
    tiltX: -4,
    tiltZ: 4,
    variant: 3,
  },
  {
    key: "orbit-panel-5",
    mission: MISSIONS[0],
    baseAngle: 240,
    offsetY: -110,
    tiltX: 3,
    tiltZ: -3,
    variant: 4,
  },
  {
    key: "orbit-panel-6",
    mission: MISSIONS[2],
    baseAngle: 300,
    offsetY: 45,
    tiltX: -2,
    tiltZ: 2,
    variant: 5,
  },
];

interface HeroPanelArtworkProps {
  variant: 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * Composiciones arquitectónicas de alto contraste para representar piezas reales
 * de estudio creativo cuando no existe una captura cargada en public/proyectos/.
 */
function HeroPanelArtwork({ variant }: HeroPanelArtworkProps) {
  switch (variant) {
    case 0:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "radial-gradient(circle at 82% 18%, rgba(217, 167, 96, 0.34) 0%, rgba(244, 241, 234, 0.14) 28%, #0E0E11 72%)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="h-1.5 w-8 bg-[#F4F1EA]/85" />
            <span className="h-2.5 w-2.5 border border-[#F4F1EA]/55" />
          </div>

          <div className="my-auto grid grid-cols-12 gap-2 items-end">
            <div className="col-span-7 space-y-2">
              <div className="h-10 w-full bg-[#F4F1EA]/90" />
              <div className="h-2.5 w-4/5 bg-[#8A8A93]/70" />
              <div className="h-2 w-3/5 bg-[#8A8A93]/40" />
            </div>
            <div
              className="col-span-5 h-24 border border-white/25"
              style={{
                background:
                  "linear-gradient(155deg, rgba(244,241,234,0.34) 0%, rgba(217,167,96,0.18) 55%, rgba(11,11,13,0.9) 100%)",
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/15">
            <span className="h-5 bg-white/10 border border-white/15" />
            <span className="h-5 bg-white/20 border border-white/25" />
            <span className="h-5 bg-[#F4F1EA]/85" />
          </div>
        </div>
      );

    case 1:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(135deg, rgba(244, 241, 234, 0.22) 0%, rgba(138, 138, 147, 0.14) 38%, #0A0A0D 78%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="h-2 w-12 bg-[#FFFFFF]/85" />
            <div className="flex gap-1">
              <span className="h-1.5 w-3 bg-white/40" />
              <span className="h-1.5 w-3 bg-white/40" />
            </div>
          </div>

          <div className="relative my-auto flex-1 mt-3 mb-2 grid grid-cols-5 gap-2">
            <div
              className="col-span-3 h-full border border-white/25"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(180,180,188,0.45) 55%, rgba(16,16,20,0.95) 100%)",
              }}
            />
            <div className="col-span-2 flex flex-col justify-between gap-2">
              <div className="h-14 border border-white/20 bg-white/10" />
              <div className="space-y-1.5">
                <span className="block h-2 w-full bg-white/75" />
                <span className="block h-1.5 w-3/4 bg-[#8A8A93]/65" />
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="h-3 border border-white/30 bg-white/15" />
                <span className="h-3 border border-white/60 bg-[#FFFFFF]/85" />
                <span className="h-3 border border-white/30 bg-white/15" />
              </div>
            </div>
          </div>
        </div>
      );

    case 2:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, rgba(244, 241, 234, 0.28) 0%, rgba(138, 138, 147, 0.12) 44%, #09090B 82%)",
          }}
        >
          <div className="flex justify-center pt-1">
            <span className="h-1.5 w-16 bg-white/65" />
          </div>

          <div className="my-auto flex flex-col items-center gap-2.5">
            <div className="h-16 w-4/5 border border-white/30 bg-gradient-to-b from-[#F4F1EA]/30 to-transparent flex items-center justify-center">
              <div className="h-8 w-8 border border-[#F4F1EA]/70 rotate-45" />
            </div>
            <div className="h-4 w-3/4 bg-[#FFFFFF]/85" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="h-9 border border-white/20 bg-white/10" />
            <div className="h-9 border border-white/35 bg-white/20" />
            <div className="h-9 border border-white/20 bg-white/10" />
          </div>
        </div>
      );

    case 3:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(180deg, rgba(244, 241, 234, 0.26) 0%, rgba(138, 138, 147, 0.08) 45%, #09090C 100%)",
          }}
        >
          <div className="space-y-2 border-b border-white/20 pb-2.5">
            <div className="flex items-center justify-between">
              <span className="h-3 w-3 border border-[#FFFFFF]/80 bg-white/25" />
              <span className="h-1.5 w-20 bg-white/55" />
            </div>
            <div className="h-6 w-11/12 bg-[#FFFFFF]/88" />
          </div>

          <div className="grid grid-cols-2 gap-2 my-auto py-2">
            <div className="h-16 border border-white/25 bg-white/10 p-2 flex flex-col justify-end gap-1">
              <span className="h-2 w-3/4 bg-white/75" />
              <span className="h-1 w-1/2 bg-white/40" />
            </div>
            <div
              className="h-16 border border-white/30 p-2 flex flex-col justify-end gap-1"
              style={{
                background:
                  "linear-gradient(145deg, rgba(244,241,234,0.28) 0%, rgba(255,255,255,0.06) 100%)",
              }}
            >
              <span className="h-2 w-2/3 bg-[#FFFFFF]/85" />
              <span className="h-1 w-1/2 bg-white/45" />
            </div>
          </div>

          <div className="h-3 w-full border-t border-white/15 pt-1.5 flex justify-between">
            <span className="h-1.5 w-14 bg-white/35" />
            <span className="h-1.5 w-8 bg-white/60" />
          </div>
        </div>
      );

    case 4:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, rgba(217, 167, 96, 0.28) 0%, rgba(244, 241, 234, 0.14) 36%, #0B0B0E 78%)",
          }}
        >
          <div className="space-y-1.5">
            <div className="h-7 w-full bg-[#F4F1EA]/90" />
            <div className="h-7 w-4/5 bg-[#FFFFFF]/70" />
            <div className="h-3 w-2/5 bg-[#8A8A93]/75" />
          </div>

          <div className="mt-2 flex-1 grid grid-cols-4 gap-2 items-end">
            <div className="col-span-2 h-24 border border-white/25 bg-gradient-to-tr from-[#D9A760]/25 via-white/15 to-white/35" />
            <div className="col-span-2 space-y-2 pb-1">
              <div className="h-10 border border-white/20 bg-white/10" />
              <div className="h-6 bg-[#FFFFFF]/85" />
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div
          className="relative h-full w-full overflow-hidden p-3.5 flex flex-col justify-between"
          style={{
            background:
              "linear-gradient(160deg, #0D0D10 0%, rgba(244, 241, 234, 0.20) 52%, rgba(217, 167, 96, 0.22) 100%)",
          }}
        >
          <div
            className="h-24 w-full border border-white/30 p-2.5 flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.86) 0%, rgba(244,241,234,0.48) 55%, rgba(138,138,147,0.22) 100%)",
            }}
          >
            <div className="flex justify-between">
              <span className="h-2 w-8 bg-[#050505]/80" />
              <span className="h-2 w-2 bg-[#050505]/70" />
            </div>
            <div className="h-4 w-3/4 bg-[#050505]/85" />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-16 border border-white/20 bg-white/10" />
            <div className="h-16 border border-white/25 bg-white/15" />
          </div>
        </div>
      );
  }
}

interface OrbitPanelSurfaceProps {
  panel: OrbitPanelConfig;
  isHovered: boolean;
}

function OrbitPanelSurface({ panel, isHovered }: OrbitPanelSurfaceProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return <HeroPanelArtwork variant={panel.variant} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#09090B]">
      <Image
        src={panel.mission.previewImage}
        alt={panel.mission.title}
        fill
        sizes="(max-width: 640px) 156px, (max-width: 768px) 185px, 225px"
        priority
        draggable={false}
        onError={() => setImgFailed(true)}
        style={{
          filter: isHovered
            ? "grayscale(0%) contrast(1.05) brightness(1)"
            : "grayscale(25%) contrast(1.08) brightness(0.82)",
        }}
        className="w-full h-full object-cover transition-[filter,transform] duration-500 ease-out group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
    </div>
  );
}

const INITIAL_ORBIT_ANGLE = 18;
const DEFAULT_RADIUS_Z = 335;
const DEFAULT_Y_SCALE = 1;

interface PanelFrame {
  transform: string;
  zIndex: number;
  opacity: number;
  filter: string;
  boxShadow: string;
}

function computePanelFrame(
  cfg: OrbitPanelConfig,
  orbitAngle: number,
  effectiveRadiusZ: number,
  yScale: number,
  isHovered: boolean,
  isDimmedByHover: boolean
): PanelFrame {
  const worldDeg = orbitAngle + cfg.baseAngle;
  const rad = (worldDeg * Math.PI) / 180;

  const sinVal = Math.sin(rad);
  const zCos = Math.cos(rad); // -1 atrás, +1 adelante

  const x = sinVal * (effectiveRadiusZ * 1.16);
  const z = zCos * effectiveRadiusZ;
  const y = cfg.offsetY * yScale;

  // Curvatura cilíndrica: cada panel mira suavemente hacia la cámara/centro
  const cantedY = -sinVal * 32;
  const isFront = z >= 0;
  const depthScale = isFront
    ? 0.96 + zCos * 0.12 // Hasta 1.08 en el plano frontal
    : 0.86 + (zCos + 1) * 0.08;

  const transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(
    1
  )}px, ${z.toFixed(1)}px) rotateY(${cantedY.toFixed(2)}deg) rotateX(${
    cfg.tiltX
  }deg) rotateZ(${cfg.tiltZ}deg) scale(${depthScale.toFixed(4)})`;

  if (isFront) {
    return {
      transform,
      zIndex: isHovered ? 50 : 25 + Math.round(zCos * 15),
      opacity: isDimmedByHover ? 0.35 : 1,
      filter: "blur(0px) brightness(1)",
      boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
    };
  }

  // Profundidad atmosférica real detrás del núcleo (z < 0 -> menor que zIndex 20)
  const rearOpacity = Number((0.18 + (zCos + 1) * (0.45 - 0.18)).toFixed(3));
  return {
    transform,
    zIndex: Math.max(1, 14 + Math.round(zCos * 10)),
    opacity: isDimmedByHover ? Math.min(rearOpacity, 0.16) : rearOpacity,
    filter: "blur(1.5px) brightness(0.55)",
    boxShadow: "none",
  };
}

export function HeroSection({ onOpenDrawer }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const panelSurfaceRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Estado orbital y arrastre manual con inercia
  const orbitAngleRef = useRef<number>(INITIAL_ORBIT_ANGLE);
  const angularVelocityRef = useRef<number>(0);
  const baseSpeedFactorRef = useRef<number>(1);
  const targetSpeedFactorRef = useRef<number>(1);
  const scrollProgressRef = useRef<number>(0);
  const hoveredIndexRef = useRef<number | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragLastXRef = useRef<number>(0);
  const totalDragDistanceRef = useRef<number>(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const radiusZRef = useRef<number>(DEFAULT_RADIUS_Z);
  const yScaleRef = useRef<number>(DEFAULT_Y_SCALE);

  // Parallax 3D con el mouse (-12deg a +12deg)
  const pointerNormX = useMotionValue(0);
  const pointerNormY = useMotionValue(-0.12);

  const cameraRotateX = useSpring(
    useTransform(pointerNormY, [-0.5, 0.5], [12, -12]),
    { stiffness: 110, damping: 22 }
  );
  const cameraRotateY = useSpring(
    useTransform(pointerNormX, [-0.5, 0.5], [-12, 12]),
    { stiffness: 110, damping: 22 }
  );

  // Scroll-Linked Expansion: expansión radial (+25%), aceleración y fade-out suave
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    scrollProgressRef.current = latest;
  });

  const scrollStageOpacity = useTransform(
    scrollYProgress,
    [0, 0.72, 1],
    [1, 0.35, 0]
  );
  const scrollStageScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  useEffect(() => {
    const updateDimensions = () => {
      const vw = window.innerWidth;
      if (vw < 768) {
        radiusZRef.current = 155;
        yScaleRef.current = 0.58;
      } else if (vw < 1180) {
        radiusZRef.current = 265;
        yScaleRef.current = 0.84;
      } else {
        radiusZRef.current = 335;
        yScaleRef.current = 1;
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
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
    const dt = Math.min(delta, 50) / 1000;
    const scrollP = scrollProgressRef.current;

    baseSpeedFactorRef.current +=
      (targetSpeedFactorRef.current - baseSpeedFactorRef.current) * 0.08;

    if (!isDraggingRef.current) {
      orbitAngleRef.current += angularVelocityRef.current;
      angularVelocityRef.current *= 0.94;
      if (Math.abs(angularVelocityRef.current) < 0.005) {
        angularVelocityRef.current = 0;
      }

      // Velocidad base + leve aceleración vinculada al scroll vertical
      orbitAngleRef.current +=
        dt * (10.5 + scrollP * 18) * baseSpeedFactorRef.current;
    }

    const effectiveRadiusZ = radiusZRef.current * (1 + scrollP * 0.25);
    const activeHover = hoveredIndexRef.current;

    for (let i = 0; i < ORBIT_PANELS.length; i++) {
      const panelEl = panelRefs.current[i];
      const surfaceEl = panelSurfaceRefs.current[i];
      if (!panelEl || !surfaceEl) continue;

      const frame = computePanelFrame(
        ORBIT_PANELS[i],
        orbitAngleRef.current,
        effectiveRadiusZ,
        yScaleRef.current,
        activeHover === i,
        activeHover !== null && activeHover !== i
      );

      panelEl.style.transform = frame.transform;
      panelEl.style.zIndex = String(frame.zIndex);
      panelEl.style.opacity = String(frame.opacity);
      surfaceEl.style.filter = frame.filter;
      surfaceEl.style.boxShadow = frame.boxShadow;
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
    pointerNormY.set(-0.12);
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragLastXRef.current = e.clientX;
    totalDragDistanceRef.current = 0;
    angularVelocityRef.current = 0;
  };

  const handlePanelEnter = (idx: number) => {
    targetSpeedFactorRef.current = 0.05;
    hoveredIndexRef.current = idx;
    setHoveredIndex(idx);
  };

  const handlePanelLeave = () => {
    targetSpeedFactorRef.current = 1;
    hoveredIndexRef.current = null;
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
      ref={sectionRef}
      id="inicio"
      className="relative min-h-screen overflow-x-hidden flex flex-col justify-between pt-20 pb-12 lg:pt-24 lg:pb-14"
    >
      {/* Envolvente Scroll-Linked fuera del plano preserve-3d */}
      <motion.div
        style={{
          opacity: scrollStageOpacity,
          scale: scrollStageScale,
        }}
        className="my-auto w-full"
      >
        {/* Escenario CSS 3D Real (perspective: 1100px, preserve-3d) */}
        <div
          ref={stageRef}
          data-cursor="orbit"
          onPointerMove={handleStagePointerMove}
          onPointerLeave={handleStagePointerLeave}
          onPointerDown={handleStagePointerDown}
          style={{ perspective: "1100px" }}
          className="relative flex w-full min-h-[480px] sm:min-h-[540px] md:min-h-[600px] items-center justify-center touch-pan-y select-none"
        >
          <motion.div
            style={{
              rotateX: cameraRotateX,
              rotateY: cameraRotateY,
            }}
            className="preserve-3d relative flex h-[480px] md:h-[560px] w-full items-center justify-center"
          >
            {/* A. EL NÚCLEO CENTRAL: EMBLEMA ELLIK (zIndex: 20, translateZ: 0px) */}
            <div
              style={{ transform: "translate3d(0px, 0px, 0px)", zIndex: 20 }}
              className="pointer-events-none relative flex flex-col items-center justify-center text-center"
            >
              <div className="relative flex h-28 w-28 md:h-36 md:w-36 items-center justify-center">
                <div
                  className="animate-pulse-star absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 65%)",
                  }}
                />
                <EllikEmblem className="animate-pulse-star relative h-16 w-16 md:h-20 md:w-20 text-[#FFFFFF]" />
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

            {/* B. LOS 6 PANELES ORBITALES CON ALTURAS E INCLINACIONES ASIMÉTRICAS */}
            {ORBIT_PANELS.map((panel, idx) => {
              const isHovered = hoveredIndex === idx;
              const initialFrame = computePanelFrame(
                panel,
                INITIAL_ORBIT_ANGLE,
                DEFAULT_RADIUS_Z,
                DEFAULT_Y_SCALE,
                false,
                false
              );

              return (
                <div
                  key={panel.key}
                  ref={(el) => {
                    panelRefs.current[idx] = el;
                  }}
                  data-cursor="view"
                  role="button"
                  tabIndex={0}
                  onMouseEnter={() => handlePanelEnter(idx)}
                  onMouseLeave={handlePanelLeave}
                  onFocus={() => handlePanelEnter(idx)}
                  onBlur={handlePanelLeave}
                  onClick={() => handlePanelClick(panel.mission.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handlePanelClick(panel.mission.id);
                    }
                  }}
                  aria-label={`${panel.mission.title} — Ir al proyecto`}
                  style={{
                    transform: initialFrame.transform,
                    zIndex: initialFrame.zIndex,
                    opacity: initialFrame.opacity,
                  }}
                  className="pointer-events-auto absolute w-[156px] h-[200px] sm:w-[185px] sm:h-[235px] md:w-[225px] md:h-[282px] cursor-pointer will-change-transform"
                >
                  <div
                    ref={(el) => {
                      panelSurfaceRefs.current[idx] = el;
                    }}
                    style={{
                      filter: initialFrame.filter,
                      boxShadow: initialFrame.boxShadow,
                    }}
                    className={`group flex h-full w-full flex-col bg-[#09090B] border transition-colors duration-300 ${
                      isHovered
                        ? "border-[#FFFFFF]"
                        : "border-[rgba(255,255,255,0.20)]"
                    }`}
                  >
                    <div className="relative flex-1 w-full overflow-hidden">
                      <OrbitPanelSurface panel={panel} isHovered={isHovered} />
                    </div>

                    {/* Barra inferior limpia de 32px */}
                    <div className="h-8 shrink-0 border-t border-[rgba(255,255,255,0.14)] bg-[#09090B] px-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] text-[#71717A] shrink-0">
                          {panel.mission.index}
                        </span>
                        <span className="font-sans text-xs text-[#8A8A93] group-hover:text-[#FFFFFF] transition-colors truncate">
                          {panel.mission.shortTitle}
                        </span>
                      </div>
                      <a
                        href={panel.mission.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (totalDragDistanceRef.current > 8) {
                            e.preventDefault();
                          }
                        }}
                        aria-label={`Visitar ${panel.mission.shortTitle} en vivo`}
                        title={`Visitar ${panel.mission.displayDomain}`}
                        className="flex h-6 w-6 items-center justify-center font-mono text-[11px] text-[#8A8A93] hover:text-[#FFFFFF] transition-colors shrink-0"
                      >
                        ↗
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      {/* C. Cierre del Hero */}
      <div className="relative z-30 flex flex-col items-center text-center pt-4">
        <p className="font-sans text-sm md:text-base text-[#8A8A93] max-w-md text-center leading-relaxed">
          Diseño y desarrollo web para comercios y marcas que quieren recibir
          pedidos sin fricción.
        </p>

        <MagneticButton
          onClick={() => onOpenDrawer()}
          className="mt-7 border border-[rgba(255,255,255,0.28)] bg-transparent px-7 py-3.5 font-mono text-xs tracking-[0.18em] uppercase text-[#FFFFFF] transition-colors duration-200 hover:border-[#FFFFFF]"
        >
          AGENDAR LLAMADA DE 10 MIN
        </MagneticButton>
      </div>
    </section>
  );
}
